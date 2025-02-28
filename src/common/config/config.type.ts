export type PinoRedactConfig = {
  enabled: boolean;
  paths: string[];
  censor?: any;
};

export type PinoConfig = {
  enabled?: boolean;
  redact?: PinoRedactConfig;
  groupName?: string;
  logStreamName?: string;
  clwEnabled: boolean;
  fileEnabled: boolean;
  consoleEnabled: boolean;
  folderLog: string;
};

export type CorsConfig = {
  allowedHeaders: string;
  exposedHeaders: string;
  methods: string;
  credentials: boolean;
  origin: string;
};

export type ServerConfig = {
  swaggerServer: string;
  swaggerServerEnabled: boolean;
  swaggerUsername: string;
  swaggerPassword: string;
  hostname: string;
  webUrl: string;
  cors: CorsConfig;
  timezone: string;
};

export type AuthConfig = {
  jwt: {
    secretKey: string;
    expireTime: string;
  };
  refreshToken: {
    secretKey: string;
    expireTime: string;
  };
  salt: number;
  forgotPasswordToken: {
    expireTime: number;
  };
  verifyEmail: {
    expireTime: number;
  };
};

export type SmtpConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
  from: string;
};

export type ServiceConfig = {
  brand: string;
  clientAuthUrl: string;
  baseUrl: string;
};

export type AwsConfig = {
  isLocal: boolean;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  log: string[];
  migrationOnStartup: boolean;
  synchronizationStartup: boolean;
  timezone: string;
  type: 'mysql' | 'postgres';
};

export type RedisConfig = {
  standalone: {
    port: number;
    host: string;
  };
  cluster: {
    port: number;
    host: string;
  };
};
