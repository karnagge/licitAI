import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  type CreateProjectDto,
  type UpdateProjectDto,
} from '../services/projectService';

/**
 * Query keys for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) =>
    [...projectKeys.lists(), { page, pageSize }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated projects list
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of projects per page
 * @returns Query result with projects list
 *
 * @example
 * ```tsx
 * function ProjectsList() {
 *   const { data, isLoading, error } = useProjects(1, 12);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       {data.projects.map(project => (
 *         <ProjectCard key={project.id} project={project} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProjects(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: projectKeys.list(page, pageSize),
    queryFn: () => getProjects(page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single project by ID
 *
 * @param id - Project ID
 * @returns Query result with project details
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new project
 *
 * @returns Mutation result with create function
 *
 * @example
 * ```tsx
 * function CreateProjectForm() {
 *   const createMutation = useCreateProject();
 *
 *   const handleSubmit = async (data: CreateProjectDto) => {
 *     await createMutation.mutateAsync(data);
 *     navigate('/dashboard');
 *   };
 *
 *   return <ProjectForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />;
 * }
 * ```
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate projects list to refetch with new project
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing project
 *
 * @returns Mutation result with update function
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject
      );
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to archive a project
 *
 * @returns Mutation result with archive function
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProject,
    onSuccess: () => {
      // Invalidate all project queries to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
