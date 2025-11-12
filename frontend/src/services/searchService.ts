import api from './api';

/**
 * Search API Service
 * Handles all search-related API calls
 */

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

export interface SearchQueryParams {
  query: string;
  projectId?: string;
  types?: ('document' | 'message')[];
  limit?: number;
}

/**
 * Perform semantic search
 */
export async function search(params: SearchQueryParams): Promise<SearchResult[]> {
  const response = await api.get<SearchResult[]>('/search', {
    params: {
      query: params.query,
      projectId: params.projectId,
      types: params.types?.join(','),
      limit: params.limit,
    },
  });
  return response.data;
}

/**
 * Get search suggestions
 */
export async function getSuggestions(prefix: string): Promise<string[]> {
  const response = await api.get<string[]>('/search/suggestions', {
    params: { prefix },
  });
  return response.data;
}

export const searchService = {
  search,
  getSuggestions,
};

export default searchService;
