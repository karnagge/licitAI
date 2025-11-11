import { IsEmail, IsEnum, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * DTO for inviting a new user to the organization
 */
export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
