import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingsService } from '../ai-agents/embeddings.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { Prisma } from '@prisma/client';

export interface SearchResult {
  type: 'document' | 'message';
  id: string;
  title?: string;
  content: string;
  projectId: string;
  projectName?: string;
  similarity: number;
  createdAt: Date;
  createdBy: string;
  metadata?: any;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private embeddings: EmbeddingsService,
  ) {}

  /**
   * Perform semantic search across documents and messages
   * Uses vector similarity search with pgvector
   * @param tenantId - Organization ID
   * @param searchDto - Search query and filters
   * @returns Ranked search results
   */
  async search(
    tenantId: string,
    searchDto: SearchQueryDto,
  ): Promise<SearchResult[]> {
    this.logger.log(`Searching for: "${searchDto.query}" in tenant ${tenantId}`);

    // Generate embedding for search query
    const queryEmbedding = await this.embeddings.generateEmbedding(
      searchDto.query,
    );

    const limit = searchDto.limit || 10;
    const types = searchDto.types || ['document', 'message'];
    const results: SearchResult[] = [];

    // Search in documents if requested
    if (types.includes('document')) {
      const documentResults = await this.searchDocuments(
        tenantId,
        queryEmbedding,
        searchDto.projectId,
        limit,
      );
      results.push(...documentResults);
    }

    // Search in messages if requested
    if (types.includes('message')) {
      const messageResults = await this.searchMessages(
        tenantId,
        queryEmbedding,
        searchDto.projectId,
        limit,
      );
      results.push(...messageResults);
    }

    // Sort by similarity and limit
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Search in documents using vector similarity
   */
  private async searchDocuments(
    tenantId: string,
    queryEmbedding: number[],
    projectId: string | undefined,
    limit: number,
  ): Promise<SearchResult[]> {
    // Build SQL query with pgvector similarity search
    // Note: Prisma doesn't natively support vector operations yet,
    // so we use raw SQL
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let query = `
      SELECT
        d.id,
        d.title,
        dv.content,
        d."projectId" as "project_id",
        p.name as "project_name",
        d."createdBy" as "created_by",
        d."createdAt" as "created_at",
        1 - (d.embedding <=> $1::vector) as similarity
      FROM documents d
      INNER JOIN document_versions dv ON d.id = dv."documentId" AND dv.version = d."currentVersion"
      INNER JOIN projects p ON d."projectId" = p.id
      WHERE d."tenantId" = $2
        AND d.embedding IS NOT NULL
    `;

    const params: any[] = [embeddingStr, tenantId];
    let paramIndex = 3;

    if (projectId) {
      query += ` AND d."projectId" = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    query += `
      ORDER BY similarity DESC
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, ...params);

    return rawResults.map((row) => ({
      type: 'document' as const,
      id: row.id,
      title: row.title,
      content: this.truncateContent(row.content),
      projectId: row.project_id,
      projectName: row.project_name,
      similarity: parseFloat(row.similarity),
      createdAt: row.created_at,
      createdBy: row.created_by,
    }));
  }

  /**
   * Search in messages using vector similarity
   */
  private async searchMessages(
    tenantId: string,
    queryEmbedding: number[],
    projectId: string | undefined,
    limit: number,
  ): Promise<SearchResult[]> {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let query = `
      SELECT
        m.id,
        m.content,
        c."projectId" as "project_id",
        p.name as "project_name",
        m."createdBy" as "created_by",
        m."createdAt" as "created_at",
        1 - (m.embedding <=> $1::vector) as similarity
      FROM messages m
      INNER JOIN chats c ON m."chatId" = c.id
      INNER JOIN projects p ON c."projectId" = p.id
      WHERE m."tenantId" = $2
        AND m.embedding IS NOT NULL
        AND m.role = 'assistant'
    `;

    const params: any[] = [embeddingStr, tenantId];
    let paramIndex = 3;

    if (projectId) {
      query += ` AND c."projectId" = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    query += `
      ORDER BY similarity DESC
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const rawResults = await this.prisma.$queryRawUnsafe<any[]>(query, ...params);

    return rawResults.map((row) => ({
      type: 'message' as const,
      id: row.id,
      content: this.truncateContent(row.content),
      projectId: row.project_id,
      projectName: row.project_name,
      similarity: parseFloat(row.similarity),
      createdAt: row.created_at,
      createdBy: row.created_by || 'system',
    }));
  }

  /**
   * Truncate content to snippet length
   */
  private truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Get search suggestions based on recent queries
   * (Simple implementation - could be enhanced with ML)
   */
  async getSuggestions(
    tenantId: string,
    prefix: string,
  ): Promise<string[]> {
    // For MVP, return common search terms
    const commonTerms = [
      'prazo de entrega',
      'orçamento',
      'especificações técnicas',
      'Lei 14.133',
      'justificativa',
      'critérios de avaliação',
    ];

    return commonTerms
      .filter((term) => term.toLowerCase().includes(prefix.toLowerCase()))
      .slice(0, 5);
  }
}
