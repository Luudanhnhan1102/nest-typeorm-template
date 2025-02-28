import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { userMock } from 'src/modules/users/users.mock';
import { UsersRepository } from 'src/modules/users/users.repository';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { MailService } from 'src/modules/mail/mail.service';
import { EntityNotFoundError } from 'typeorm';
import { RedisService } from 'src/modules/redis/redis.service';

jest.setTimeout(30000);

describe('forgot password', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let spies: jest.SpyInstance[] = [];
  let usersRepository: UsersRepository;
  let mailService: MailService;
  let redisService: RedisService;
  const getEndpoint = () => `/auth/forgot-password`;
  const method = 'post';
  const input: ForgotPasswordDto = {
    email: userMock.email,
  };

  beforeAll(async () => {
    [app] = await initTestApp(getAuthTestModule());
    request = createRequestFunction(app);
    usersRepository = app.get(UsersRepository);
    mailService = app.get(MailService);
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
    it('Forgot password successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      await request(getEndpoint(), {
        expected: 201,
        method,
        body: input,
      });
      expect(mailService.sendMail).toBeCalledWith({
        context: {
          link: expect.any(String),
          name: userMock.email,
        },
        subject: 'Beyond Blood - forgot password link',
        template: './requestResetPassword.handlebars',
        to: userMock.email,
      });
      expect(redisService.set).toBeCalledWith(
        'forgot-password-email@gmail.com',
        expect.any(String),
        300,
      );
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
        message: ['email must be an email', 'email should not be empty', 'email must be a string'],
      });
    });

    it('Wrong email => Not found', async () => {
      spies.push(
        jest
          .spyOn(usersRepository, 'findOneByOrFail')
          .mockRejectedValue(new EntityNotFoundError({} as any, {})),
      );

      const res = await request(getEndpoint(), {
        expected: 404,
        method,
        body: { email: 'a@email.com' },
      });
      expect(res.body).toStrictEqual({
        statusCode: 404,
        message: 'Entity not found',
        errorCode: 404,
      });
    });
  });
});
