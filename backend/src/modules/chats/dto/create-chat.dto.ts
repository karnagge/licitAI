import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
