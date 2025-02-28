import { LoggerInterceptor } from '../interceptors/logger.interceptor';
import * as httpContext from 'express-http-context';
import * as responseTime from 'response-time';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { LoggerHelper } from 'src/common/logger/logger.helper';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as config from 'config';
import { Helpers } from './helpers';
import { serverConfig } from 'src/common/config/config-helper';
import { NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

export class AppHelper {
  static configApp(app: INestApplication) {
    const allowedMethods = Helpers.getArrayStringConfig(serverConfig.cors.methods);
    app.enableCors({
      exposedHeaders: Helpers.getArrayStringConfig(serverConfig.cors.exposedHeaders),
      origin:
        serverConfig.cors.origin === '*'
          ? '*'
          : Helpers.getArrayStringConfig(serverConfig.cors.origin),
      methods: allowedMethods,
      allowedHeaders: Helpers.getArrayStringConfig(serverConfig.cors.allowedHeaders),
      credentials: serverConfig.cors.credentials,
    });
    app.use(function (_: Request, response: Response, next: NextFunction) {
      response.setHeader('Access-Control-Allow-Origin', serverConfig.cors.origin);
      response.setHeader('Access-Control-Allow-Headers', [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Location',
      ]);
      response.setHeader('Access-Control-Allow-Methods', allowedMethods);
      next();
    });
    app.setGlobalPrefix(config.get('service.baseUrl'));
    app.useGlobalInterceptors(new LoggerInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.use(httpContext.middleware);
    app.use(responseTime({ header: 'x-response-time' }));
    app.use(LoggerHelper.setCorrelationId);
    app.use(bodyParser.json({ limit: '8mb' }));
    app.use(bodyParser.urlencoded({ limit: '8mb', extended: true }));
  }
}
