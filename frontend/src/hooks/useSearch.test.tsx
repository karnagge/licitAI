import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearch, useSuggestions } from './useSearch';
import * as searchService from '../services/searchService';

// Mock the search service
vi.mock('../services/searchService');

describe('useSearch', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch search results', async () => {
    const mockResults = [
      {
        id: 'doc-1',
        type: 'document' as const,
        title: 'Test Document',
        content: 'Test content',
        projectId: 'project-1',
        similarity: 0.9,
        createdAt: new Date(),
        createdBy: 'user-1',
      },
    ];

    vi.mocked(searchService.search).mockResolvedValue(mockResults);

    const { result } = renderHook(
      () =>
        useSearch({
          query: 'test query',
          limit: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResults);
    expect(searchService.search).toHaveBeenCalledWith({
      query: 'test query',
      limit: 10,
    });
  });

  it('should not fetch when query is too short', () => {
    renderHook(
      () =>
        useSearch({
          query: 'a',
          limit: 10,
        }),
      { wrapper },
    );

    expect(searchService.search).not.toHaveBeenCalled();
  });

  it('should not fetch when disabled', () => {
    renderHook(
      () =>
        useSearch(
          {
            query: 'test query',
            limit: 10,
          },
          false,
        ),
      { wrapper },
    );

    expect(searchService.search).not.toHaveBeenCalled();
  });

  it('should handle search errors', async () => {
    const error = new Error('Search failed');
    vi.mocked(searchService.search).mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useSearch({
          query: 'test query',
          limit: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('should pass project filter', async () => {
    vi.mocked(searchService.search).mockResolvedValue([]);

    renderHook(
      () =>
        useSearch({
          query: 'test query',
          projectId: 'project-123',
          limit: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(searchService.search).toHaveBeenCalled());

    expect(searchService.search).toHaveBeenCalledWith({
      query: 'test query',
      projectId: 'project-123',
      limit: 10,
    });
  });

  it('should pass type filter', async () => {
    vi.mocked(searchService.search).mockResolvedValue([]);

    renderHook(
      () =>
        useSearch({
          query: 'test query',
          types: ['document'],
          limit: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(searchService.search).toHaveBeenCalled());

    expect(searchService.search).toHaveBeenCalledWith({
      query: 'test query',
      types: ['document'],
      limit: 10,
    });
  });
});

describe('useSuggestions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch suggestions', async () => {
    const mockSuggestions = ['pregão', 'pregão eletrônico'];

    vi.mocked(searchService.getSuggestions).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSuggestions('pregão'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSuggestions);
    expect(searchService.getSuggestions).toHaveBeenCalledWith('pregão');
  });

  it('should not fetch when query is too short', () => {
    renderHook(() => useSuggestions('a'), { wrapper });

    expect(searchService.getSuggestions).not.toHaveBeenCalled();
  });

  it('should not fetch when query is empty', () => {
    renderHook(() => useSuggestions(''), { wrapper });

    expect(searchService.getSuggestions).not.toHaveBeenCalled();
  });

  it('should handle suggestion errors gracefully', async () => {
    vi.mocked(searchService.getSuggestions).mockRejectedValue(
      new Error('Failed'),
    );

    const { result } = renderHook(() => useSuggestions('test'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
