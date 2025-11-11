import { IsString, IsUUID, IsOptional } from 'class-validator';

/**
 * DTO for creating an attachment
 */
export class CreateAttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsString()
  storagePath: string;

  @IsString()
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  messageId?: string;
}
