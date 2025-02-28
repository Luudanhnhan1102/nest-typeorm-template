import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IRequestWithUser } from '../auth.constants';

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const req: IRequestWithUser = ctx.switchToHttp().getRequest();
  return req.user.sub;
});
