// import 'reflect-metadata';
import { DataSource, LogLevel } from 'typeorm';
import { resolve } from 'path';
import { databaseConfig } from '../config/config-helper';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const entitiesPath = `${resolve(__dirname, '../../')}/**/*.entity.{ts,js}`;

export const typeOrmConfig = {
  type: databaseConfig.type,
  synchronize: databaseConfig.synchronizationStartup,
  migrationsRun: databaseConfig.migrationOnStartup,
  entities: [entitiesPath],
  migrations: ['dist/migrations/*.{ts,js}'],
  logging: databaseConfig.log as LogLevel[],
  namingStrategy: new SnakeNamingStrategy(),
  timezone: databaseConfig.timezone,
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  username: databaseConfig.username,
  password: databaseConfig.password,
};

export const AppDataSource = {
  provide: DataSource,
  useFactory: async () => {
    return new DataSource(typeOrmConfig).initialize();
  },
};
