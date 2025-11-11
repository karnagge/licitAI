import api from './api';
import type { Attachment } from '../../../shared/types/entities';

/**
 * Attachment API Service
 * Handles all attachment-related API calls
 */

/**
 * Upload a file attachment
 */
export async function uploadAttachment(
  file: File,
  projectId: string,
  messageId?: string
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({ projectId });
  if (messageId) {
    params.append('messageId', messageId);
  }

  const response = await api.post<Attachment>(
    `/attachments/upload?${params.toString()}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Get all attachments for a project
 */
export async function getAttachmentsByProject(projectId: string): Promise<Attachment[]> {
  const response = await api.get<Attachment[]>('/attachments', {
    params: { projectId },
  });
  return response.data;
}

/**
 * Get a single attachment
 */
export async function getAttachmentById(id: string): Promise<Attachment> {
  const response = await api.get<Attachment>(`/attachments/${id}`);
  return response.data;
}

/**
 * Download an attachment
 */
export async function downloadAttachment(id: string, filename: string): Promise<void> {
  const response = await api.get(`/attachments/${id}/download`, {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(id: string): Promise<void> {
  await api.delete(`/attachments/${id}`);
}

export const attachmentService = {
  uploadAttachment,
  getAttachmentsByProject,
  getAttachmentById,
  downloadAttachment,
  deleteAttachment,
};

export default attachmentService;
