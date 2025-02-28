import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as config from 'config';
import { LoggerInterceptor } from '../interceptors/logger.interceptor';
import * as httpContext from 'express-http-context';
import * as responseTime from 'response-time';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { LoggerHelper } from 'src/common/logger/logger.helper';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { controllerModules } from 'src/modules/app.module';
import * as basicAuth from 'express-basic-auth';
import { serverConfig } from 'src/common/config/config-helper';

export class SwaggerHelpers {
  static configApp(app: INestApplication) {
    app.enableCors({
      // exposedHeaders: CORS_EXPOSED_HEADERS,
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
  }

  static setupSwagger(app: INestApplication) {
    app.use(
      // Paths you want to protect with basic auth
      '/docs*',
      basicAuth({
        challenge: true,
        users: {
          [serverConfig.swaggerUsername || 'swaggerUser']:
            serverConfig.swaggerPassword || 'swaggerPassword',
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('api-beyond-blood')
      .setDescription('The beyond blood API description')
      .setVersion('1.0')
      .addBearerAuth();

    const tags = SwaggerHelpers.collectApiTags();
    tags.forEach((tag) => {
      config.addTag(tag);
    });

    const optionsSwagger = config.build();
    const document = SwaggerModule.createDocument(app, optionsSwagger);
    SwaggerModule.setup('/docs', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        displayOperationId: true,
        persistAuthorization: true,
      },
    });
  }

  static collectApiTags() {
    let tags: string[] = [];
    for (const module of controllerModules) {
      const controllers = Reflect.getMetadata('controllers', module);
      if (!controllers?.length) {
        continue;
      }
      for (const controller of controllers) {
        const apiTags = Reflect.getMetadata('swagger/apiUseTags', controller);
        if (apiTags?.length) {
          tags = tags.concat(apiTags);
        }
      }
    }
    tags.sort();

    return tags;
  }
}
