import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtInternalService } from './jwt.service';
import { jwtConfig } from 'src/common/config/config-helper';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RefreshTokenStrategy } from '../auth/strategies/refresh-token.strategy';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.jwt.secretKey,
      signOptions: { expiresIn: jwtConfig.jwt.expireTime },
    }),
  ],
  providers: [
    JwtInternalService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
    RefreshTokenStrategy,
    RefreshTokenGuard,
  ],
  exports: [JwtInternalService, JwtStrategy],
})
export class JwtInternalModule {}
