import { Request } from 'express';
import { IJwtPayload } from '../jwt/jwt.type';

export interface IRequestWithUser extends Request {
  user: IJwtPayload;
}
