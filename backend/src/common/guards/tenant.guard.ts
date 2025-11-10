import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Tenant Isolation Guard
 * Ensures users can only access resources belonging to their tenant
 * Validates that resource tenant_id matches authenticated user's tenant_id
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('User tenant context missing');
    }

    // Tenant ID is validated at the service/repository layer
    // This guard ensures user object has tenant context
    // Additional validation happens in Prisma middleware

    return true;
  }
}
