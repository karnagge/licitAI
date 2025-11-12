import { useQuery } from '@tanstack/react-query';
import { search, getSuggestions, SearchQueryParams } from '../services/searchService';

/**
 * Query keys for search
 */
export const searchKeys = {
  all: ['search'] as const,
  searches: () => [...searchKeys.all, 'query'] as const,
  search: (params: SearchQueryParams) => [...searchKeys.searches(), params] as const,
  suggestions: (prefix: string) => [...searchKeys.all, 'suggestions', prefix] as const,
};

/**
 * Hook to perform search
 */
export function useSearch(params: SearchQueryParams, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.search(params),
    queryFn: () => search(params),
    enabled: enabled && !!params.query && params.query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get search suggestions
 */
export function useSuggestions(prefix: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(prefix),
    queryFn: () => getSuggestions(prefix),
    enabled: prefix.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
