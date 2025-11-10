import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password too long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Full name too short' })
  @MaxLength(150, { message: 'Full name too long' })
  fullName: string;

  // Organization fields (for first-time registration)
  @IsString()
  @MinLength(3, { message: 'Organization name too short' })
  @MaxLength(200, { message: 'Organization name too long' })
  organizationName: string;

  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  organizationType: OrganizationType;

  @IsOptional()
  @IsString()
  @MaxLength(18, { message: 'CNPJ too long' })
  cnpj?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Location too long' })
  location?: string;
}
