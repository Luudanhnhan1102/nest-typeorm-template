import * as dotenv from 'dotenv';
dotenv.config(); // Not move this line to other position line 2
import * as config from 'config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { LoggerHelper } from './common/logger/logger.helper';
import { SwaggerHelpers } from './shared/swagger-helpers';
import { AppHelper } from './shared/app-helpers';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  AppHelper.configApp(app);
  SwaggerHelpers.setupSwagger(app);
  await app.listen(config.get('server.port'));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

(async () => {
  await bootstrap();
  LoggerHelper.debugLog({
    methodName: 'bootstrap',
    msg: `Start service at ${config.get('server.host')}:${config.get('server.port')}}`,
  });
  LoggerHelper.debugLog({
    methodName: 'bootstrap',
    msg: `Swagger docs at ${config.get('server.host')}:${config.get('server.port')}/docs`,
  });
})();
