import 'reflect-metadata';
import 'dotenv/config';
import { VerificationMethod } from '@app/config';
import type { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PUBLIC_WORKSPACE_EMAIL } from '../apps/api/src/workspace/public-workspace.service';

jest.setTimeout(30_000);

interface VerificationResponse {
  hostname: string;
  token: string;
  instructions: { recordType: string };
}

describe('Next API end-to-end', () => {
  let context: INestApplicationContext;
  let dataSource: DataSource;

  beforeAll(async () => {
    Object.assign(process.env, { NODE_ENV: 'test' });
    const { getServerContext } = await import('../next/context');
    context = await getServerContext();
    dataSource = context.get(DataSource);
  });

  afterAll(async () => {
    const [workspace] = await dataSource.query<Array<{ id: string }>>(
      'SELECT id FROM users WHERE email = $1',
      [PUBLIC_WORKSPACE_EMAIL],
    );
    if (workspace) {
      await dataSource.query(
        'DELETE FROM target_verifications WHERE owner_id = $1',
        [workspace.id],
      );
      await dataSource.query('DELETE FROM audit_logs WHERE actor_id = $1', [
        workspace.id,
      ]);
    }
    await context.close();
    globalThis.loadGridServerContext = undefined;
  });

  it('reports liveness and readiness through route handlers', async () => {
    const liveRoute = await import('../../app/api/v1/health/live/route');
    const readyRoute = await import('../../app/api/v1/health/ready/route');

    const live = await liveRoute.GET();
    expect(await live.json()).toEqual(expect.objectContaining({ status: 'ok' }));

    const ready = await readyRoute.GET(
      new Request('http://localhost/api/v1/health/ready'),
    );
    expect(ready.status).toBe(200);
    expect(await ready.json()).toEqual(
      expect.objectContaining({
        status: 'ok',
        info: { database: { status: 'up' } },
      }),
    );
  });

  it('opens the shared workspace without authentication', async () => {
    const verificationRoute = await import(
      '../../app/api/v1/targets/verifications/route'
    );
    const testsRoute = await import('../../app/api/v1/tests/route');
    const verification = await verificationRoute.POST(
      new Request('http://localhost/api/v1/targets/verifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          targetUrl: 'https://8.8.8.8/health',
          method: VerificationMethod.DNS_TXT,
        }),
      }),
    );

    expect(verification.status).toBe(201);
    const body = (await verification.json()) as VerificationResponse;
    expect(body.hostname).toBe('8.8.8.8');
    expect(body.instructions.recordType).toBe('TXT');
    expect(body.token).toEqual(expect.any(String));

    const tests = await testsRoute.GET(
      new Request('http://localhost/api/v1/tests'),
    );
    expect(tests.status).toBe(200);
    expect(await tests.json()).toEqual([]);

    const [workspace] = await dataSource.query<Array<{ email: string }>>(
      'SELECT email FROM users WHERE email = $1',
      [PUBLIC_WORKSPACE_EMAIL],
    );
    expect(workspace?.email).toBe(PUBLIC_WORKSPACE_EMAIL);
  });
});
