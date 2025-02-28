import { ERole } from '../users/users.constants';

export interface IJwtPayload {
  email: string;
  role: ERole;
  sub: number;
}
