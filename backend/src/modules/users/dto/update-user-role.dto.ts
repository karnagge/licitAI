import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * DTO for updating a user's role
 */
export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
