import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /search
   * Semantic search across documents and messages
   * Query params:
   *   - query (required): Search text
   *   - projectId (optional): Filter by project
   *   - types (optional): Filter by type (document, message)
   *   - limit (optional): Max results (default 10)
   */
  @Get()
  search(
    @CurrentTenant() tenantId: string,
    @Query() searchDto: SearchQueryDto,
  ) {
    return this.searchService.search(tenantId, searchDto);
  }

  /**
   * GET /search/suggestions
   * Get search suggestions
   * Query params:
   *   - prefix: Text to autocomplete
   */
  @Get('suggestions')
  getSuggestions(
    @CurrentTenant() tenantId: string,
    @Query('prefix') prefix: string,
  ) {
    return this.searchService.getSuggestions(tenantId, prefix || '');
  }
}
