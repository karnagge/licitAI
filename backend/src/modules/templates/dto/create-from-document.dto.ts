import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for creating a template from an existing document
 */
export class CreateFromDocumentDto {
  @IsString()
  @MinLength(1)
  documentId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
