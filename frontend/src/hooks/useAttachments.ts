import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadAttachment,
  getAttachmentsByProject,
  getAttachmentById,
  deleteAttachment,
} from '../services/attachmentService';

/**
 * Query keys for attachments
 */
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  listByProject: (projectId: string) =>
    [...attachmentKeys.lists(), { projectId }] as const,
  details: () => [...attachmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...attachmentKeys.details(), id] as const,
};

/**
 * Hook to fetch attachments by project
 */
export function useAttachmentsByProject(projectId: string) {
  return useQuery({
    queryKey: attachmentKeys.listByProject(projectId),
    queryFn: () => getAttachmentsByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single attachment
 */
export function useAttachment(attachmentId: string) {
  return useQuery({
    queryKey: attachmentKeys.detail(attachmentId),
    queryFn: () => getAttachmentById(attachmentId),
    enabled: !!attachmentId,
  });
}

/**
 * Hook to upload an attachment
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      projectId,
      messageId,
    }: {
      file: File;
      projectId: string;
      messageId?: string;
    }) => uploadAttachment(file, projectId, messageId),
    onSuccess: (newAttachment) => {
      // Invalidate project attachments list
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.listByProject(newAttachment.projectId),
      });
    },
  });
}

/**
 * Hook to delete an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      // Invalidate all attachment lists
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.lists(),
      });
    },
  });
}
