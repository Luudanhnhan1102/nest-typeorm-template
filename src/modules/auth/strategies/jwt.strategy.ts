import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConfig } from 'src/common/config/config-helper';
import { IJwtPayload } from 'src/modules/jwt/jwt.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.jwt.secretKey,
    });
  }

  async validate(payload: IJwtPayload) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
