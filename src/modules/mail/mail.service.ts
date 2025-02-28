import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ISendMailInput } from './mail.types';
import { serviceConfig } from 'src/common/config/config-helper';
import { LoggerHelper } from 'src/common/logger/logger.helper';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMailVerifyEmail(to: string, name: string, link: string) {
    await this.sendMail({
      to,
      subject: `${serviceConfig.brand} - verify email`,
      template: './verifyEmail.handlebars',
      context: {
        link,
        name,
      },
    });
  }

  async sendMailResetPassword(to: string, name: string, link: string) {
    await this.sendMail({
      to,
      subject: `${serviceConfig.brand} - forgot password link`,
      template: './requestResetPassword.handlebars',
      context: {
        link,
        name,
      },
    });
  }

  async updatePasswordSuccessfully(to: string, name: string) {
    await this.sendMail({
      to,
      subject: `${serviceConfig.brand} - update password successfully`,
      template: './resetPassword.handlebars',
      context: { name },
    });
  }

  async sendMail({ to, template, from, context, subject, sender }: ISendMailInput) {
    try {
      await this.mailerService.sendMail({
        ...(from && { from }),
        to,
        subject,
        sender,
        template,
        context: context,
      });
    } catch (error) {
      LoggerHelper.errorLog({
        error: error,
        msg: 'Send mail error',
        methodName: 'MailService::sendMail',
      });
    }
  }
}
