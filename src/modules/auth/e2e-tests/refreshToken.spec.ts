import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { UsersRepository } from '../../users/users.repository';
import { userMock } from '../../users/users.mock';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import { EUserStatus } from 'src/modules/users/users.constants';

jest.setTimeout(30000);

describe('Refresh token', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let jwtInternalService: JwtInternalService;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/auth/refresh-token`;
  const method = 'get';

  beforeAll(async () => {
    [app] = await initTestApp(getAuthTestModule());
    jwtInternalService = app.get(JwtInternalService);
    request = createRequestFunction(app, {
      token: await jwtInternalService.signPayload({
        role: userMock.role,
        sub: userMock.id,
        email: userMock.email,
      }),
    });
    usersRepository = app.get(UsersRepository);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await app?.close();
  });

  afterEach(async () => {
    spies.forEach((spy) => spy?.mockRestore());
    spies = [];
  });

  describe('Positive testing', () => {
    it('Refresh successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      const res = await request(getEndpoint(), {
        expected: 200,
        method,
      });
      expect(res.body).toStrictEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });

  describe('Negative testing', () => {
    it('Create without token', async () => {
      const newRequest = createRequestFunction(app, {});
      const res = await newRequest(getEndpoint(), {
        expected: 401,
        method,
      });
      expect(res.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });

    it('User is not active', async () => {
      spies.push(
        jest
          .spyOn(usersRepository, 'findOneByOrFail')
          .mockResolvedValue({ ...userMock, status: EUserStatus.inactive } as any),
      );
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
      });
      expect(res.body).toStrictEqual({
        message: 'User is not active',
        statusCode: 400,
      });
    });
  });
});
