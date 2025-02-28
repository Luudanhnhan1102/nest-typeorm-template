import { ERole, EUserStatus } from './users.constants';

export const userMock = {
  email: 'email@gmail.com',
  role: ERole.user,
  password: 'password',
  status: EUserStatus.active,
  id: 1,
};
