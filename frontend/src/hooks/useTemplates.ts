import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  type CreateTemplateDto,
} from '../services/templateService';
import type { TemplateType } from '../../../shared/types/enums';

/**
 * Query keys for templates
 */
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (type?: TemplateType) => [...templateKeys.lists(), { type }] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

/**
 * Hook to fetch templates list
 *
 * @param type - Optional filter by template type
 * @returns Query result with templates list
 *
 * @example
 * ```tsx
 * function TemplatesList() {
 *   const { data: templates, isLoading } = useTemplates();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       {templates?.map(template => (
 *         <TemplateCard key={template.id} template={template} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTemplates(type?: TemplateType) {
  return useQuery({
    queryKey: templateKeys.list(type),
    queryFn: () => getTemplates(type),
    staleTime: 1000 * 60 * 5, // 5 minutes - templates don't change often
  });
}

/**
 * Hook to fetch a single template by ID
 *
 * @param id - Template ID
 * @returns Query result with template details
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplateById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a custom template
 *
 * @returns Mutation result with create function
 *
 * @example
 * ```tsx
 * function CreateTemplateForm() {
 *   const createMutation = useCreateTemplate();
 *
 *   const handleSubmit = async (data: CreateTemplateDto) => {
 *     await createMutation.mutateAsync(data);
 *     navigate('/templates');
 *   };
 *
 *   return <TemplateForm onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      // Invalidate templates list to refetch with new template
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
