import { IsString, IsOptional, MinLength } from 'class-validator';

export class ImproveTextDto {
  @IsString()
  @MinLength(1)
  selectedText: string;

  @IsString()
  @MinLength(1)
  context: string;

  @IsOptional()
  @IsString()
  instruction?: string;
}
