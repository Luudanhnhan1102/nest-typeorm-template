import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import { GenerateAdminModule } from './generate-admin.module';
import { argv } from 'yargs';
import { UsersService } from 'src/modules/users/users.service';
import { LoggerHelper } from 'src/common/logger/logger.helper';
import { ERole } from 'src/modules/users/users.constants';

export class GenerateAdminProgram {
  app: INestApplicationContext;
  usersService: UsersService;
  email: string;
  password: string;

  async main() {
    await this.initialize();
    await this.process();
    await this.end();
  }

  async initialize() {
    this.app = await this.getApp();
    this.usersService = this.app.get(UsersService);
    this.email = (argv as any)[`email`] as string;
    this.password = (argv as any)[`password`] as string;
    if (!this.email || !this.password) {
      throw new Error('Require email & password');
    }
    LoggerHelper.debugLog({
      methodName: 'GenerateAdminProgram.initialize',
      msg: 'Initialized',
    });
  }

  async process() {
    const registeredUser = { email: this.email, password: this.password, role: ERole.admin };
    try {
      LoggerHelper.debugLog({
        methodName: 'GenerateAdminProgram.process',
        msg: 'input',
        data: registeredUser,
      });
      await this.usersService.registerUPUser(registeredUser);
    } catch (err) {
      LoggerHelper.errorLog({
        methodName: 'GenerateAdminProgram.process',
        msg: 'input',
        data: registeredUser,
        error: err,
      });
      throw err;
    }
    LoggerHelper.debugLog({
      methodName: 'GenerateAdminProgram.process',
      msg: 'completed',
      data: registeredUser,
    });
  }

  async getApp() {
    return NestFactory.createApplicationContext(GenerateAdminModule);
  }

  async end() {
    return this.app.close();
  }
}

export const run = () => {
  new GenerateAdminProgram()
    .main()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.log({
        e,
      });
      process.exit(-1);
    });
};
