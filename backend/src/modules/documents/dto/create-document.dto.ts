import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  title: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  templateId: string;
}
