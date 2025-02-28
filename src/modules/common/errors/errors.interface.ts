export enum ErrorCodes {
  INTERNAL_SERVER_ERROR = '01',
  FORBIDDEN_ERROR = '02',
  USER_EXISTS = '03',
  USER_NOT_FOUND = '04',
  PLAN_NAME_EXISTS = '05',
  PLAN_NOT_FOUND = '06',
  PLAN_NOT_ACTIVE = '07',
  INSUFFICIENT_BALANCE = '08',
  INSUFFICIENT_JOB = '09',
}

export interface IError {
  message: string;
  statusCode: number;
  errorCode: string;
}
