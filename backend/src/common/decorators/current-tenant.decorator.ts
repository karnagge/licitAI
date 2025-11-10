import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentTenant() decorator
 * Extracts tenant ID from authenticated user
 * Usage: @CurrentTenant() tenantId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId;
  },
);
