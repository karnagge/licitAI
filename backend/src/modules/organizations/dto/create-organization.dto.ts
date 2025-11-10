import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsEnum(OrganizationType)
  type: OrganizationType;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsEmail()
  @MaxLength(255)
  primaryContactEmail: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  primaryContactName: string;
}
