import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IJwtPayload } from './jwt.type';
import * as bcrypt from 'bcryptjs';
import { jwtConfig } from 'src/common/config/config-helper';
import * as _ from 'lodash';

@Injectable()
export class JwtInternalService {
  constructor(private jwtService: JwtService) {}

  async signPayload(payload: IJwtPayload, options?: JwtSignOptions) {
    const input = options?.expiresIn ? _.omit(payload, 'exp') : payload;
    return this.jwtService.signAsync(input, options);
  }

  async verifyAsync(token: string, secretKey: string): Promise<IJwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: secretKey,
    });
  }

  hash(password: string) {
    return bcrypt.hashSync(password, jwtConfig.salt);
  }

  compare(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}
