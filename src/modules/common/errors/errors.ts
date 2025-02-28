import { HttpStatus } from '@nestjs/common';
import { ErrorCodes, IError } from './errors.interface';

export const Errors: Record<string, IError> = {
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error occurred.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
  },
  FORBIDDEN_ERROR: {
    message: 'Forbidden error.',
    statusCode: HttpStatus.FORBIDDEN,
    errorCode: ErrorCodes.FORBIDDEN_ERROR,
  },
  USER_EXISTS: {
    message: 'Email existed.',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCodes.USER_EXISTS,
  },
  USER_NOT_FOUND: {
    message: 'User not found.',
    statusCode: HttpStatus.NOT_FOUND,
    errorCode: ErrorCodes.USER_NOT_FOUND,
  },
  PLAN_NOT_FOUND: {
    message: 'Plan not found.',
    statusCode: HttpStatus.NOT_FOUND,
    errorCode: ErrorCodes.PLAN_NOT_FOUND,
  },
  PLAN_NAME_EXISTS: {
    message: 'Plan name exists.',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCodes.PLAN_NAME_EXISTS,
  },
  PLAN_NOT_ACTIVE: {
    message: 'Plan is not active.',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCodes.PLAN_NOT_ACTIVE,
  },
  INSUFFICIENT_BALANCE: {
    message: 'Insufficient balance.',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCodes.PLAN_NOT_ACTIVE,
  },
  INSUFFICIENT_JOB: {
    message: 'Insufficient job.',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCodes.INSUFFICIENT_JOB,
  },
};
