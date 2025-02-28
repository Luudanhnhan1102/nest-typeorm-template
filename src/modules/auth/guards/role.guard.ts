import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { ERole } from 'src/modules/users/users.constants';
import { IRequestWithUser } from '../auth.constants';

export const RoleGuard = (roles: ERole[]): Type<CanActivate> => {
  class RoleGuardMixin {
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<IRequestWithUser>();
      const user = request.user;
      return roles.includes(user.role);
    }
  }

  return mixin(RoleGuardMixin);
};
