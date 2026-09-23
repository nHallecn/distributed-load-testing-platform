import 'reflect-metadata';
import 'dotenv/config';
import { VerificationMethod } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { Server } from 'node:http';
import request from 'supertest';
import { configureApi } from '../apps/api/src/configure-app';
import { PUBLIC_WORKSPACE_EMAIL } from '../apps/api/src/workspace/public-workspace.service';

jest.setTimeout(30_000);

interface VerificationResponse {
  hostname: string;
  token: string;
  instructions: {
    recordType: string;
  };
}

interface ReadinessResponse {
  status: string;
  info: {
    database: {
      status: string;
    };
  };
}

describe('API end-to-end', () => {
  let app: INestApplication | undefined;
  let server: Server;
  let dataSource: DataSource | undefined;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const { AppModule } = await import('../apps/api/src/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApi(app);
    await app.init();
    server = app.getHttpServer() as Server;
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (!dataSource) {
      await app?.close();
      return;
    }
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
    await app?.close();
  });

  it('reports liveness and readiness', async () => {
    const live = await request(server).get('/api/v1/health/live').expect(200);
    expect(live.body as unknown).toEqual(
      expect.objectContaining({ status: 'ok' }),
    );

    const ready = await request(server).get('/api/v1/health/ready').expect(200);
    const readiness = ready.body as unknown as ReadinessResponse;
    expect(readiness.status).toBe('ok');
    expect(readiness.info.database.status).toBe('up');
  });

  it('opens the shared workspace without authentication', async () => {
    const verification = await request(server)
      .post('/api/v1/targets/verifications')
      .send({
        targetUrl: 'https://8.8.8.8/health',
        method: VerificationMethod.DNS_TXT,
      })
      .expect(201);
    const verificationBody =
      verification.body as unknown as VerificationResponse;
    expect(verificationBody.hostname).toBe('8.8.8.8');
    expect(verificationBody.instructions.recordType).toBe('TXT');
    expect(verificationBody.token).toEqual(expect.any(String));

    await request(server).get('/api/v1/tests').expect(200).expect([]);

    const [workspace] = await dataSource.query<Array<{ email: string }>>(
      'SELECT email FROM users WHERE email = $1',
      [PUBLIC_WORKSPACE_EMAIL],
    );
    expect(workspace?.email).toBe(PUBLIC_WORKSPACE_EMAIL);

    await request(server).post('/api/v1/auth/register').send({}).expect(404);
  });
});
