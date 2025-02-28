import * as config from 'config';
import {
  AuthConfig,
  PinoConfig,
  PinoRedactConfig,
  ServerConfig,
  SmtpConfig,
  ServiceConfig,
  AwsConfig,
  DatabaseConfig,
  RedisConfig,
} from './config.type';
import { Helpers } from 'src/shared/helpers';

export const loggerConfig: PinoConfig = {
  ...config.get<PinoConfig>('logger'),
  clwEnabled: Helpers.tryTransformBooleanString(config.get('logger.clwEnabled')),
  fileEnabled: Helpers.tryTransformBooleanString(config.get('logger.fileEnabled')),
  consoleEnabled: Helpers.tryTransformBooleanString(config.get('logger.consoleEnabled')),
  redact: {
    ...config.get<PinoRedactConfig>('logger.redact'),
    enabled: Helpers.tryTransformBooleanString(config.get('logger.redact.enabled')),
    paths: config.get<boolean>('logger.redact.enabled')
      ? typeof config.get('logger.redact.paths') === 'string'
        ? config.get<string>('logger.redact.paths').split(',')
        : config.get('logger.redact.paths')
      : [],
  },
};

const rawServerConfig = config.get<ServerConfig>('server');
export const serverConfig: ServerConfig = {
  ...rawServerConfig,
  swaggerServerEnabled: Helpers.tryTransformBooleanString(rawServerConfig.swaggerServerEnabled),
  cors: {
    ...rawServerConfig.cors,
    credentials: Helpers.tryTransformBooleanString(rawServerConfig.cors.credentials),
  },
};

const rawJwtConfig = config.get<AuthConfig>('auth');
export const jwtConfig: AuthConfig = {
  ...rawJwtConfig,
  salt: +rawJwtConfig.salt,
  jwt: {
    ...rawJwtConfig.jwt,
    expireTime: rawJwtConfig.jwt.expireTime,
  },
  refreshToken: {
    ...rawJwtConfig.refreshToken,
    expireTime: rawJwtConfig.refreshToken.expireTime,
  },
  forgotPasswordToken: {
    expireTime: +rawJwtConfig.forgotPasswordToken.expireTime,
  },
  verifyEmail: {
    ...rawJwtConfig.verifyEmail,
    expireTime: rawJwtConfig.verifyEmail.expireTime,
  },
};

const rawSmtpConfig = config.get<SmtpConfig>('smtp');
export const smtpConfig: SmtpConfig = {
  ...rawSmtpConfig,
  port: +rawSmtpConfig.port,
  secure: Helpers.tryTransformBooleanString(rawSmtpConfig.secure),
};

const rawServiceConfig = config.get<ServiceConfig>('service');
export const serviceConfig: ServiceConfig = {
  ...rawServiceConfig,
};

const rawAwsConfig = config.get<AwsConfig>('awsConfig');
export const awsConfig: AwsConfig = {
  ...rawAwsConfig,
  isLocal: Helpers.tryTransformBooleanString(rawAwsConfig.isLocal),
};

const rawDatabaseConfig = config.get<DatabaseConfig>('database');
export const databaseConfig: DatabaseConfig = {
  ...rawDatabaseConfig,
  migrationOnStartup: Helpers.tryTransformBooleanString(rawDatabaseConfig.migrationOnStartup),
  synchronizationStartup: Helpers.tryTransformBooleanString(
    rawDatabaseConfig.synchronizationStartup,
  ),
  port: +rawDatabaseConfig.port,
  log:
    typeof rawDatabaseConfig.log === 'string'
      ? (rawDatabaseConfig.log as string).split(',')
      : rawDatabaseConfig.log,
};

const rawRedisConfig = config.get<RedisConfig>('redis');
export const redisConfig: RedisConfig = {
  ...rawRedisConfig,
  cluster: {
    ...rawRedisConfig.cluster,
    port: +rawRedisConfig.cluster.port,
  },
  standalone: {
    ...rawRedisConfig.standalone,
    port: +rawRedisConfig.standalone.port,
  },
};
