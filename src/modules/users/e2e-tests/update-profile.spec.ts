import { INestApplication } from '@nestjs/common';
import {
  createRequestFunction,
  getAuthTestModule,
  initTestApp,
} from '../../../shared/e2e-test.helpers';
import { UsersRepository } from '../users.repository';
import { userMock } from '../users.mock';
import { JwtInternalService } from 'src/modules/jwt/jwt.service';
import { UpdateUserDto } from '../dto/updateUser.dto';
import * as _ from 'lodash';

jest.setTimeout(30000);

describe('update profile', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequestFunction>;
  let usersRepository: UsersRepository;
  let spies: jest.SpyInstance[] = [];
  const getEndpoint = () => `/users/update-profile`;
  const method = 'patch';
  const input: UpdateUserDto = {
    firstName: 'newName',
    lastName: 'lastName',
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
    it('Update profile successfully', async () => {
      spies.push(jest.spyOn(usersRepository, 'findOneByOrFail').mockResolvedValue(userMock as any));
      spies.push(
        jest.spyOn(usersRepository, 'save').mockResolvedValue({
          ...userMock,
          firstName: input.firstName,
          lastName: input.lastName,
        } as any),
      );
      const res = await request(getEndpoint(), {
        expected: 200,
        method,
        body: input,
      });
      expect(res.body).toStrictEqual({
        ..._.omit(userMock, 'password'),
        firstName: input.firstName,
        lastName: input.lastName,
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
          'firstName must be a string',
          'firstName should not be empty',
          'lastName must be a string',
          'lastName should not be empty',
        ],
      });
    });
  });
});
