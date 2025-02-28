import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { UsersRepository } from '../users.repository';
import { userMock } from '../users.mock';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import * as _ from 'lodash';

jest.setTimeout(30000);

describe('Get user', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let jwtInternalService: JwtInternalService;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/users/me`;
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
    it('get successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      const res = await request(getEndpoint(), {
        expected: 200,
        method,
      });
      expect(res.body).toStrictEqual({
        ..._.omit(userMock, 'password'),
      });
    });
  });
});
