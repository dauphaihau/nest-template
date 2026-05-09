import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/interceptors/request-logging.interceptor';
import { parseCorsAllowedOrigins } from '../src/config/cors.config';
import { AppModule } from '../src/modules/app.module';
import type {
  AuthResponse,
  UserProfile,
} from '../src/modules/domains/auth/app/auth.types';
import { createTestDatabase, dropTestDatabase } from './e2e-postgres';

jest.setTimeout(30_000);

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let originalEnv: NodeJS.ProcessEnv;
  let testDb: Awaited<ReturnType<typeof createTestDatabase>>;

  beforeAll(async () => {
    originalEnv = { ...process.env };
    testDb = await createTestDatabase();

    process.env.NODE_ENV = 'test';
    process.env.API_PREFIX = 'api';
    process.env.DB_HOST = testDb.rootConfig.host;
    process.env.DB_PORT = String(testDb.rootConfig.port);
    process.env.DB_USER = testDb.rootConfig.user;
    process.env.DB_PASSWORD = testDb.rootConfig.password;
    process.env.DB_NAME = testDb.dbName;
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.BCRYPT_SALT_ROUNDS = '4';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const corsAllowedOrigins = parseCorsAllowedOrigins(process.env);

    if (corsAllowedOrigins.length > 0) {
      app.enableCors({
        origin: corsAllowedOrigins,
      });
    }

    app.enableShutdownHooks();
    app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new RequestLoggingInterceptor(),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    restoreProcessEnv(originalEnv);

    if (testDb) {
      await dropTestDatabase(testDb);
    }
  });

  it('registers, authenticates, refreshes, and revokes a session', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'member@example.com',
        password: 'password123',
        displayName: 'Member User',
      })
      .expect(201);
    const registerBody = registerResponse.body as unknown as AuthResponse;

    expect(registerBody.accessToken).toEqual(expect.any(String));
    expect(registerBody.refreshToken).toEqual(expect.any(String));
    expect(registerBody.user).toMatchObject({
      email: 'member@example.com',
      displayName: 'Member User',
      roles: ['member'],
      permissions: [],
    });
    expect(registerBody.user.id).toEqual(expect.any(String));
    expect(registerBody.user.sessionId).toEqual(expect.any(String));

    const accessToken = registerBody.accessToken;
    const refreshToken = registerBody.refreshToken;
    const sessionId = registerBody.user.sessionId;

    const meResponse = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const meBody = meResponse.body as unknown as UserProfile;

    expect(meBody).toMatchObject({
      email: 'member@example.com',
      displayName: 'Member User',
      sessionId,
      roles: ['member'],
      permissions: [],
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'member@example.com',
        password: 'password123',
      })
      .expect(200);
    const loginBody = loginResponse.body as unknown as AuthResponse;

    expect(loginBody.user.email).toBe('member@example.com');
    expect(loginBody.user.sessionId).not.toBe(sessionId);

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    const refreshBody = refreshResponse.body as unknown as AuthResponse;

    expect(refreshBody.accessToken).toEqual(expect.any(String));
    expect(refreshBody.refreshToken).toEqual(expect.any(String));
    expect(refreshBody.user.email).toBe('member@example.com');
    expect(refreshBody.user.sessionId).toBe(sessionId);
    expect(refreshBody.refreshToken).not.toBe(refreshToken);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${refreshBody.accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshBody.accessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshBody.refreshToken })
      .expect(401);
  });

  it('exposes a health endpoint under the global API prefix', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    const responseBody = response.body as unknown as {
      status: string;
      timestamp: string;
    };

    expect(responseBody.status).toBe('ok');
    expect(responseBody.timestamp).toEqual(expect.any(String));
  });
});

function restoreProcessEnv(originalEnv: NodeJS.ProcessEnv) {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
}
