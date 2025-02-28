import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import * as _ from 'lodash';
import { UsersRepository } from '../../users/users.repository';
import { userMock } from '../../users/users.mock';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import { SignInDto } from '../dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';

jest.setTimeout(30000);

describe('Login', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let jwtInternalService: JwtInternalService;
  let spies: jest.SpyInstance[] = [];
  let jwtService: JwtService;
  const getEndpoint = () => `/auth/login`;
  const method = 'post';
  const input: SignInDto = {
    ..._.pick(userMock, ['email', 'password']),
  };

  beforeAll(async () => {
    [app] = await initTestApp(getAuthTestModule());
    request = createRequestFunction(app);
    usersRepository = app.get(UsersRepository);
    jwtInternalService = app.get(JwtInternalService);
    jwtService = app.get(JwtService);
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
    it('Login successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(userMock as any));
      spies.push(jest.spyOn(jwtInternalService, 'compare').mockReturnValue(true as never));
      const res = await request(getEndpoint(), {
        expected: 201,
        method,
        body: input,
      });
      expect(res.body).toStrictEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      const decoded = jwtService.decode(res.body.accessToken);
      expect(decoded).toStrictEqual({
        sub: userMock.id,
        role: userMock.role,
        exp: expect.any(Number),
        email: userMock.email,
        iat: expect.any(Number),
      });
    });
  });

  describe('Negative testing', () => {
    it('Create with empty input', async () => {
      const res = await request(getEndpoint(), {
        expected: 401,
        method,
        body: {},
      });
      expect(res.body).toStrictEqual({
        statusCode: 401,
        message: 'email or password is incorrect',
      });
    });

    it('Wrong user or password', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(userMock as any));
      const res = await request(getEndpoint(), {
        expected: 401,
        method,
        body: {
          ...input,
          password: 'wrong',
        },
      });
      expect(res.body).toStrictEqual({
        statusCode: 401,
        message: 'email or password is incorrect',
      });
    });
  });
});
