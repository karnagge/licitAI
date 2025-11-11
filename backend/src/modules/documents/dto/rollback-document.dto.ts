import { IsInt, Min } from 'class-validator';

export class RollbackDocumentDto {
  @IsInt()
  @Min(1)
  version: number;
}
