import * as httpContext from 'express-http-context';
import { uuid } from 'uuidv4';
import * as config from 'config';
import { awsConfig, loggerConfig } from '../config/config-helper';
import { Helpers } from 'src/shared/helpers';
import { createLogger, format, transports } from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import { createHash } from 'crypto';
import * as DailyRotateFile from 'winston-daily-rotate-file';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MaskJson = require('mask-json');

const maskFormat = format((info, opts) => {
  if (!opts.maskConfidential) {
    return info;
  }
  try {
    const mask = MaskJson(opts.maskKeys, { ignoreCase: true, replacement: '********' });
    info = mask(info);
    return info;
  } catch (error) {
    return info;
  }
});

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    maskFormat({
      maskConfidential: loggerConfig.redact?.enabled,
      maskKeys: loggerConfig.redact?.paths,
    }),
    format.json(),
  ),
  transports: [
    ...(loggerConfig.clwEnabled
      ? [
          new WinstonCloudWatch({
            level: 'debug',
            logGroupName: loggerConfig.groupName,
            logStreamName: getLogStream(),
            uploadRate: 1000,
            jsonMessage: true,
            awsRegion: awsConfig.region,
            ...(awsConfig.isLocal && {
              awsOptions: {
                credentials: {
                  accessKeyId: awsConfig.accessKeyId,
                  secretAccessKey: awsConfig.secretAccessKey,
                },
                region: awsConfig.region,
              },
            }),
          }),
        ]
      : []),
    ...(loggerConfig.fileEnabled
      ? [
          new DailyRotateFile({
            filename: `${loggerConfig.folderLog}/application-%DATE%.log`,
            datePattern: `YYYY-MM-DD-HH`,
            zippedArchive: true,
            maxSize: `20m`,
            maxFiles: `14d`,
          }),
        ]
      : []),
    ...(loggerConfig.consoleEnabled ? [new transports.Console()] : []),
  ],
});

function getLogStream() {
  const startTime = new Date().toISOString();

  const date = new Date().toISOString().split('T')[0];
  return `${loggerConfig.logStreamName}${date}-${createHash('md5')
    .update(startTime)
    .digest('hex')}`;
}

export const CORRELATION_ID_KEY = 'correlationId';
export const logEnabled = loggerConfig.enabled;

const serviceName = config.get('service.name');
const env = process.env.NODE_ENV || 'development';
enum LogLevel {
  Error,
  Warning,
  Info,
  Debug,
}
const logLevelFunc = {
  [LogLevel.Error]: logger.error,
  [LogLevel.Warning]: logger.warn,
  [LogLevel.Info]: logger.info,
  [LogLevel.Debug]: logger.debug,
};

export type LogInput = {
  methodName: string;
  data?: Record<string, unknown>;
  msg?: string;
};

export class LoggerHelper {
  static setCorrelationId(req: any, _: any, next: any) {
    req.timestamp = Date.now();
    const correlationId = uuid();
    req.correlationId = correlationId;
    httpContext.set(CORRELATION_ID_KEY, correlationId);
    next();
  }

  static getCorrelationId() {
    let correlationId = httpContext.get(CORRELATION_ID_KEY);
    if (!correlationId) {
      correlationId = uuid();
      httpContext.set(CORRELATION_ID_KEY, correlationId);
    }
    return correlationId;
  }

  private static log(
    logLevel: LogLevel,
    {
      data,
      msg,
      methodName,
    }: {
      data?: any;
      msg?: string;
      methodName: string;
    },
  ): void {
    const logFunc = logLevelFunc[logLevel];

    const correlationId = this.getCorrelationId();
    const correlationIdMsg = !!correlationId ? `[${correlationId}]` : '';
    const methodNameMsg = !!methodName ? `[${methodName}]` : '';
    const message = `${msg}`;
    const host = `[${env}][${serviceName}]`;

    logFunc.call(
      logger,
      { ...data, correlationId, msg: message },
      host + correlationIdMsg + methodNameMsg + message,
    );
  }

  static debugLog(input: LogInput): void {
    LoggerHelper.log(LogLevel.Debug, input);
  }

  static errorLog({
    error,
    data,
    msg,
    methodName,
  }: LogInput & {
    error?: Error;
  }): void {
    if (!logEnabled) {
      return;
    }
    const logData: Record<string, unknown> = {
      ...data,
      ...(error && {
        stack: error.stack,
        message: error.message,
      }),
    };
    LoggerHelper.log(LogLevel.Error, { data: logData, msg, methodName });
  }

  static httpRequestLog(req: any) {
    if (req.url === `${config.get('service.baseUrl')}/health`) return;
    const requestLog = {
      correlationId: req.correlationId,
      //   userId: decodeJWTToken(req.headers['access-token'])?.sub,
      msg: `HTTP Request`,
      methodName: 'Logger::requestLog',
      data: {
        method: req.method,
        originalUri: req.originalUrl,
        uri: req.url,
        referer: req.headers.referer || '',
        userAgent: req.headers['user-agent'],
        req: {
          body: Helpers.tryParseJsonString(Object.assign({}, req.body)),
          headers: req.headers,
        },
      },
    };
    LoggerHelper.log(LogLevel.Debug, requestLog);
  }

  static httpResponseLog = (req: any, res: any) => {
    if (req.url === `${config.get('service.baseUrl')}/health`) return;
    const elapsedStart = req.timestamp ? req.timestamp : 0;
    const elapsedEnd = Date.now();
    const processTime = `${elapsedStart > 0 ? elapsedEnd - elapsedStart : 0}ms`;
    res.setHeader('x-request-id', req.correlationId);
    res.setHeader('x-process-time', processTime);
    const rawResponse = res.write;
    const rawResponseEnd = res.end;
    const chunks: Buffer[] = [];
    res.write = (...args: any[]) => {
      const restArgs = [];
      for (let i = 0; i < args.length; i++) {
        restArgs[i] = args[i];
      }
      chunks.push(Buffer.from(restArgs[0]));
      rawResponse.apply(res, restArgs);
    };
    res.end = (...args: any[]) => {
      const restArgs = [];
      for (let i = 0; i < args.length; i++) {
        restArgs[i] = args[i];
      }
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const body = Buffer.concat(chunks).toString('utf8');
      const responseLog = {
        timestamp: new Date(elapsedEnd).toISOString(),
        correlationId: req.correlationId,
        level: LogLevel.Debug,
        msg: `HTTP Response - ${processTime}`,
        methodName: 'Logger ::responseLog',
        data: {
          req: {
            body: req.body,
            headers: req.headers,
          },
          res: {
            body: Helpers.tryParseJsonString(body),
            headers: res.getHeaders(),
          },
          statusCode: res.statusCode,
          method: req.method,
          originalUri: req.originalUrl,
          uri: req.url,
          userAgent: req.headers['user-agent'],
          processTime,
        },
      };
      LoggerHelper.log(LogLevel.Debug, responseLog);
      rawResponseEnd.apply(res, restArgs);
    };
  };
}
