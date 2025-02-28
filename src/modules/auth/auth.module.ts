import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { JwtInternalModule } from '../jwt/jwt.module';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';
// import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, UsersModule, JwtInternalModule, MailModule, RedisModule],
  providers: [AuthService, LocalStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
