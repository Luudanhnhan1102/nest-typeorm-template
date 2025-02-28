import { ERole } from './users.constants';

export interface ICreateUser {
  email: string;
  password: string;
  role: ERole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
