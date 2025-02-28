import { Module } from '@nestjs/common';
import { typeOrmConfig } from './data-source';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
