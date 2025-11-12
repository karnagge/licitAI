import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingsService } from '../ai-agents/embeddings.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;
  let embeddingsService: EmbeddingsService;

  const mockPrismaService = {
    $queryRawUnsafe: jest.fn(),
  };

  const mockEmbeddingsService = {
    generateEmbedding: jest.fn(),
  };

  const mockTenantId = 'tenant-123';
  const mockEmbedding = new Array(1536).fill(0.1);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmbeddingsService,
          useValue: mockEmbeddingsService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
    embeddingsService = module.get<EmbeddingsService>(EmbeddingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should perform semantic search across documents and messages', async () => {
      const mockDocumentResults = [
        {
          id: 'doc-1',
          title: 'Edital 001/2024',
          content: 'Pregão eletrônico para...',
          projectId: 'project-1',
          similarity: 0.85,
          createdAt: new Date(),
          createdBy: 'user-1',
          fullName: 'João Silva',
        },
      ];

      const mockMessageResults = [
        {
          id: 'msg-1',
          content: 'Gerar edital de licitação',
          projectId: 'project-1',
          similarity: 0.75,
          createdAt: new Date(),
          createdBy: 'user-1',
          fullName: 'João Silva',
        },
      ];

      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce(mockDocumentResults)
        .mockResolvedValueOnce(mockMessageResults);

      const result = await service.search(mockTenantId, {
        query: 'pregão eletrônico',
        limit: 10,
      });

      expect(embeddingsService.generateEmbedding).toHaveBeenCalledWith(
        'pregão eletrônico',
      );
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('document');
      expect(result[1].type).toBe('message');
      expect(result[0].similarity).toBeGreaterThan(result[1].similarity); // Ordered by similarity
    });

    it('should filter by project id', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.search(mockTenantId, {
        query: 'test',
        projectId: 'project-123',
        limit: 10,
      });

      // Verify that projectId filter is passed to queries
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('AND d."projectId" = $3'),
        expect.anything(),
        mockTenantId,
        'project-123',
        10,
      );
    });

    it('should filter by result types', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

      await service.search(mockTenantId, {
        query: 'test',
        types: ['document'],
        limit: 10,
      });

      // Should only call searchDocuments, not searchMessages
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    });

    it('should respect limit parameter', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.search(mockTenantId, {
        query: 'test',
        limit: 5,
      });

      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        mockTenantId,
        5,
      );
    });

    it('should handle empty results gracefully', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.search(mockTenantId, {
        query: 'non-existent-query',
        limit: 10,
      });

      expect(result).toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('should return filtered suggestions', async () => {
      const result = await service.getSuggestions(mockTenantId, 'prazo');

      expect(result).toContain('prazo de entrega');
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should filter case-insensitively', async () => {
      const result = await service.getSuggestions(mockTenantId, 'LEI');

      expect(result).toContain('Lei 14.133');
    });

    it('should return empty array when no matches', async () => {
      const result = await service.getSuggestions(mockTenantId, 'xyznonexistent');

      expect(result).toEqual([]);
    });

    it('should limit results to 5', async () => {
      const result = await service.getSuggestions(mockTenantId, 'a');

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });
});
