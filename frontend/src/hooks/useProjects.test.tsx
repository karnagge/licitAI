import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects, useProject, useCreateProject } from './useProjects';
import * as projectService from '../services/projectService';
import { mockProject } from '../test/test-utils';

// Mock the project service
vi.mock('../services/projectService');

describe('useProjects', () => {
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

  it('should fetch paginated projects', async () => {
    const mockResponse = {
      projects: [mockProject],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    vi.mocked(projectService.getProjects).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useProjects(1, 10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(projectService.getProjects).toHaveBeenCalledWith(1, 10);
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(projectService.getProjects).mockRejectedValue(error);

    const { result } = renderHook(() => useProjects(1, 10), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useProject', () => {
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

  it('should fetch a single project', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useProject('project-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProject);
    expect(projectService.getProjectById).toHaveBeenCalledWith('project-123');
  });

  it('should not fetch when projectId is undefined', () => {
    renderHook(() => useProject(undefined as unknown as string), { wrapper });

    expect(projectService.getProjectById).not.toHaveBeenCalled();
  });
});

describe('useCreateProject', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create a project', async () => {
    const newProject = {
      name: 'New Project',
      description: 'Test description',
    };

    vi.mocked(projectService.createProject).mockResolvedValue(mockProject);

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    result.current.mutate(newProject);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProject);
    expect(projectService.createProject).toHaveBeenCalled();
    const callArgs = vi.mocked(projectService.createProject).mock.calls[0][0];
    expect(callArgs).toMatchObject(newProject);
  });

  it('should handle creation errors', async () => {
    const error = new Error('Failed to create');
    vi.mocked(projectService.createProject).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    result.current.mutate({
      name: 'Test',
      description: 'Test',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('should invalidate projects query on success', async () => {
    vi.mocked(projectService.createProject).mockResolvedValue(mockProject);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateProject(), { wrapper });

    result.current.mutate({
      name: 'Test',
      description: 'Test',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['projects', 'list'],
      }),
    );
  });
});
