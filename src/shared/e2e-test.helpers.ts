import { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppHelper } from './app-helpers';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersRepository } from 'src/modules/users/users.repository';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RedisService } from 'src/modules/redis/redis.service';
import { MockRedisService } from 'src/modules/redis/redis.service.mock';

export const createRequestFunction = (
  app: INestApplication,
  headers: {
    sub?: string;
    token?: string;
  } = {},
) =>
  async function request(
    url: string,
    {
      expected,
      method,
      body,
      contentType = 'application/json',
      accept = 'application/json',
      attachment,
      query,
    }: {
      expected: number;
      method: 'get' | 'post' | 'put' | 'patch' | 'delete';
      body?: any;
      contentType?: string;
      accept?: string;
      attachment?: {
        name: string;
        file: string;
      };
      query?: Record<string, any>;
    },
  ) {
    const agent = supertest.agent(app.getHttpServer());
    const req = agent[method](url)
      .set('Accept', accept)
      .set('sub', headers.sub || 'sub')
      .set('access-token', headers.token || 'mock-token')
      .set('authorization', `Bearer ${headers.token}`);

    for (const key of Object.keys(headers)) {
      req.set(key, (headers as any)[key]);
    }
    if (attachment) {
      req.attach(attachment.name, attachment.file);
    }
    if (query) {
      req.query(query);
    }
    const reqAfterSend = body ? req.set('Content-Type', contentType).send(body) : req;
    return reqAfterSend.expect(expected).then((res) => res);
  };

export const initTestApp = async (overrides: TestingModuleBuilder): Promise<[INestApplication]> => {
  const testBuilder = overrides;

  const fixture = await testBuilder.compile();

  const app = fixture.createNestApplication();
  AppHelper.configApp(app);

  await app.init();
  return [app];
};

export const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
  existsBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  findOneBy: jest.fn(),
};

export const mockDataSource = {
  createEntityManager: jest.fn(),
  getRepository: jest.fn(),
};

export const MockMailerService = {
  sendMail: jest.fn().mockResolvedValue(true),
};

export const MockMailerModule = {
  provide: 'MAILER_SERVICE',
  useValue: MockMailerService,
};

export const getAuthTestModule = () => {
  return Test.createTestingModule({
    imports: [AuthModule, DatabaseModule],
  })
    .overrideProvider(UsersRepository)
    .useValue(mockRepository)
    .overrideProvider(getRepositoryToken(UserEntity))
    .useValue(mockRepository)
    .overrideProvider('MAILER_SERVICE')
    .useValue(MockMailerModule)
    .overrideProvider(getDataSourceToken())
    .useValue(mockDataSource)
    .overrideProvider(RedisService)
    .useValue(MockRedisService);
};
