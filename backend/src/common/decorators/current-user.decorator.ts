import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

/**
 * @CurrentUser() decorator
 * Extracts authenticated user from request
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Return specific property if requested, otherwise return full user object
    return data ? user?.[data] : user;
  },
);
