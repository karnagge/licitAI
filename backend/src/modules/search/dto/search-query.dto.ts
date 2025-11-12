import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';

/**
 * DTO for semantic search query
 */
export class SearchQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: ('document' | 'message')[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
