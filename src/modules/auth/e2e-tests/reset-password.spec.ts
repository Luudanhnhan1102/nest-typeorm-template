import { INestApplication } from '@nestjs/common';
import { MailService } from 'src/modules/mail/mail.service';
import { userMock } from 'src/modules/users/users.mock';
import { UsersRepository } from 'src/modules/users/users.repository';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { EUserStatus } from 'src/modules/users/users.constants';
import * as _ from 'lodash';

jest.setTimeout(30000);

describe('reset password', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/auth/reset-password`;
  const method = 'patch';
  const token = 'token';
  const newPass = 'newPass';
  const input: ResetPasswordDto = {
    token: token,
    email: userMock.email,
    password: newPass,
  };
  let mailService: MailService;
  let jwtService: JwtInternalService;
  let redisService: RedisService;

  beforeAll(async () => {
    [app] = await initTestApp(getAuthTestModule());
    request = createRequestFunction(app);
    usersRepository = app.get(UsersRepository);
    mailService = app.get(MailService);
    jwtService = app.get(JwtInternalService);
    redisService = app.get(RedisService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await app?.close();
  });

  beforeEach(async () => {
    spies.push(jest.spyOn(mailService, 'sendMail'));
  });

  afterEach(async () => {
    spies.forEach((spy) => spy?.mockRestore());
    spies = [];
  });

  describe('Positive testing', () => {
    it('Reset password successfully', async () => {
      const passwordResetTokenMock = 'passwordResetToken';
      spies.push(jest.spyOn(redisService, 'get').mockResolvedValue(passwordResetTokenMock));
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtService, 'compare').mockReturnValue(true as never));
      const res = await request(getEndpoint(), {
        expected: 200,
        method,
        body: input,
      });
      expect(res.body).toStrictEqual({
        ..._.omit(userMock, 'password'),
        id: expect.any(Number),
        email: userMock.email,
        role: userMock.role,
        status: EUserStatus.active,
      });
      expect(token).toBeDefined();
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
          'token should not be empty',
          'token must be a string',
          'email must be a string',
          'email must be an email',
          'password should not be empty',
          'password must be a string',
        ],
      });
    });

    it('Wrong token => Not found', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtService, 'compare').mockReturnValue(true as never));
      spies.push(jest.spyOn(redisService, 'get').mockResolvedValue(null));
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
        body: { ...input, token: 'wrong' },
      });
      expect(res.body).toStrictEqual({
        statusCode: 400,
        message: 'Invalid or expired password reset token',
      });
    });

    it('Wrong token => invalid token', async () => {
      const passwordResetTokenMock = 'passwordResetToken';
      spies.push(jest.spyOn(redisService, 'get').mockResolvedValue(passwordResetTokenMock));
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtService, 'compare').mockReturnValue(false as never));
      const res = await request(getEndpoint(), {
        expected: 400,
        method,
        body: { ...input, token: 'wrong' },
      });
      expect(res.body).toStrictEqual({
        statusCode: 400,
        message: 'Invalid or expired password reset token',
      });
    });
  });
});
