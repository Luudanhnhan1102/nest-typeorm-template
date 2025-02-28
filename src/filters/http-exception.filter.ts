import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { LoggerHelper } from 'src/common/logger/logger.helper';
import { EntityNotFoundError } from 'typeorm';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const responseError = this.createGeneralExceptionError(exception);

    LoggerHelper.debugLog({
      data: responseError,
      methodName: HttpExceptionFilter.name,
      msg: 'catch',
    });

    response.status(responseError.statusCode).json(responseError);
  }

  createGeneralExceptionError(error: any): any {
    if (error instanceof HttpException) {
      const errRes = error.getResponse() as Record<string, any>;
      return {
        message: errRes.message || error.message,
        errorCode: errRes.errorCode,
        statusCode: error.getStatus(),
        ...(errRes.description && { description: errRes.description }),
        ...(errRes.tackTrace && { stackTrace: errRes.stackTrace }),
        ...(errRes.data && { data: errRes.data }),
        ...(errRes.errors && { errors: errRes.errors }),
      };
    } else if (error instanceof EntityNotFoundError) {
      return {
        message: 'Entity not found',
        errorCode: 404,
        statusCode: 404,
      };
    }

    return {
      message: error.message,
      errorCode: 500,
      statusCode: 500,
    };
  }
}
