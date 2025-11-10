import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
