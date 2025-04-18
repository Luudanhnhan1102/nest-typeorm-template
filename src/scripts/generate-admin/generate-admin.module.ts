import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from 'src/modules/users/users.module';

export const modules = [DatabaseModule, UsersModule];
@Module({
  imports: modules,
})
export class GenerateAdminModule {}
