import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { userMock } from 'src/modules/users/users.mock';
import { UsersRepository } from 'src/modules/users/users.repository';
import * as _ from 'lodash';

jest.setTimeout(30000);

describe('update password', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/auth/update-password`;
  const method = 'patch';
  const newPass = 'newPass';
  const input: UpdatePasswordDto = {
    currentPassword: userMock.password,
    newPassword: newPass,
  };
  let jwtInternalService: JwtInternalService;

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
    it('Update password successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtInternalService, 'compare').mockReturnValue(true as never));

      const res = await request(getEndpoint(), {
        expected: 200,
        method,
        body: input,
      });
      expect(res.body).toStrictEqual({
        ..._.omit(userMock, 'password'),
        id: userMock.id,
        email: userMock.email,
        role: userMock.role,
        status: 'active',
      });
    });
  });

  describe('Negative testing', () => {
    it('Body empty => Bad request', async () => {
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
        body: {},
      });
      expect(res.body).toStrictEqual({
        statusCode: 400,
        message: [
          'currentPassword should not be empty',
          'currentPassword must be a string',
          'newPassword should not be empty',
          'newPassword must be a string',
        ],
      });
    });

    it('Password is incorrect', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtInternalService, 'compare').mockReturnValue(false as never));
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
        body: input,
      });
      expect(res.body).toStrictEqual({
        statusCode: 400,
        message: 'Password is incorrect',
      });
    });
  });
});
