import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { IJwtPayload } from 'src/modules/jwt/jwt.type';
import { jwtConfig } from 'src/common/config/config-helper';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshToken.secretKey,
    });
  }

  async validate(payload: IJwtPayload) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
