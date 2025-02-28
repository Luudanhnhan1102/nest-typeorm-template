import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

export const controllerModules = [UsersModule, AuthModule, HealthModule];

@Module({
  imports: [DatabaseModule, ...controllerModules],
  providers: [],
})
export class AppModule {}
