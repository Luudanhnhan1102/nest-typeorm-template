import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  initTestApp,
  mockDataSource,
  MockMailerModule,
  mockRepository,
} from '../../../shared/e2e-test.helpers';
import { Test } from '@nestjs/testing';
import * as _ from 'lodash';
import { userMock } from '../../users/users.mock';
import { SignUpDto } from '../dto/signUp.dto';
import { AuthModule } from '../auth.module';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UsersRepository } from 'src/modules/users/users.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { ERole } from 'src/modules/users/users.constants';

jest.setTimeout(30000);

describe('Sign up', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/auth/sign-up`;
  const method = 'post';
  const input: SignUpDto = {
    ..._.pick(userMock, ['email', 'password']),
  };

  beforeAll(async () => {
    [app] = await initTestApp(
      Test.createTestingModule({
        imports: [AuthModule, DatabaseModule],
      })
        .overrideProvider(UsersRepository)
        .useValue(mockRepository)
        .overrideProvider(getRepositoryToken(UserEntity))
        .useValue(mockRepository)
        .overrideProvider('MAILER_SERVICE')
        .useValue(MockMailerModule)
        .overrideProvider(getDataSourceToken())
        .useValue(mockDataSource),
    );
    request = createRequestFunction(app);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    if (app) {
      await app.close();
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  beforeEach(async () => {});

  afterEach(async () => {
    spies.forEach((spy) => spy?.mockRestore());
    spies = [];
  });

  describe('Positive testing', () => {
    it('Sign up successfully', async () => {
      spies.push(jest.spyOn(mockRepository, 'existsBy').mockResolvedValue(false));
      spies.push(
        jest.spyOn(mockRepository, 'save').mockResolvedValue({
          id: 1,
          email: input.email,
        }),
      );
      const res = await request(getEndpoint(), {
        expected: 201,
        method,
        body: input,
      });
      const newUserData = {
        id: expect.any(Number),
        email: userMock.email,
      };
      expect(res.body).toStrictEqual(newUserData);
      expect(mockRepository.existsBy).toBeCalledWith({
        email: input.email,
      });
      expect(mockRepository.save).toBeCalledWith({
        ...input,
        role: ERole.user,
        password: expect.any(String),
      });
    });
  });

  describe('Negative testing', () => {
    it('Create with empty input', async () => {
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
        body: {},
      });
      expect(res.body).toStrictEqual({
        statusCode: 400,
        message: [
          'email must be an email',
          'email should not be empty',
          'email must be a string',
          'password should not be empty',
          'password must be a string',
        ],
      });
    });
  });
});
