import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsString()
  @MinLength(1)
  content: string;
}
