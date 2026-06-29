import 'reflect-metadata';
import 'dotenv/config';
import { VerificationMethod } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Server } from 'node:http';
import request from 'supertest';
import { configureApi } from '../apps/api/src/configure-app';

jest.setTimeout(30_000);

interface RegistrationResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    passwordHash?: string;
  };
}

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
  let app: INestApplication;
  let server: Server;
  let dataSource: DataSource;
  let userId: string | undefined;
  const email = `api-e2e-${randomUUID()}@example.test`;
  const password = `Strong-e2e-password-${randomUUID()}`;

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
    if (userId) {
      await dataSource.query('DELETE FROM audit_logs WHERE actor_id = $1', [
        userId,
      ]);
      await dataSource.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await app.close();
  });

  it('reports liveness and readiness', async () => {
    const live = await request(server)
      .get('/api/v1/health/live')
      .expect(200);
    expect(live.body as unknown).toEqual(
      expect.objectContaining({ status: 'ok' }),
    );

    const ready = await request(server)
      .get('/api/v1/health/ready')
      .expect(200);
    const readiness = ready.body as unknown as ReadinessResponse;
    expect(readiness.status).toBe('ok');
    expect(readiness.info.database.status).toBe('up');
  });

  it('rejects unauthenticated access to owned resources', async () => {
    await request(server).get('/api/v1/tests').expect(401);
  });

  it('registers, authenticates, and exposes the current account', async () => {
    const registration = await request(server)
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const registrationBody = registration.body as unknown as RegistrationResponse;
    userId = registrationBody.user.id;
    const accessToken = registrationBody.accessToken;
    expect(accessToken).toEqual(expect.any(String));
    expect(registrationBody.user).toEqual(
      expect.objectContaining({ id: userId, email, role: 'user' }),
    );
    expect(registrationBody.user.passwordHash).toBeUndefined();

    const me = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body as unknown).toEqual(
      expect.objectContaining({ id: userId, email, role: 'user' }),
    );

    await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password: 'incorrect-password' })
      .expect(401);

    await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const verification = await request(server)
      .post('/api/v1/targets/verifications')
      .set('Authorization', `Bearer ${accessToken}`)
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

    await request(server)
      .get('/api/v1/tests')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([]);
  });
});
