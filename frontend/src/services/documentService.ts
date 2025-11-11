import api from './api';
import type { Document, DocumentVersion } from '../../../shared/types/entities';

/**
 * Document API Service
 * Handles all document-related API calls
 */

export interface CreateDocumentDto {
  projectId: string;
  templateId: string;
  title: string;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string;
  status?: string;
}

/**
 * Create a new document
 */
export async function createDocument(data: CreateDocumentDto): Promise<Document> {
  const response = await api.post<Document>('/documents', data);
  return response.data;
}

/**
 * Get all documents for a project
 */
export async function getDocumentsByProject(projectId: string): Promise<Document[]> {
  const response = await api.get<Document[]>('/documents', {
    params: { projectId },
  });
  return response.data;
}

/**
 * Get a single document with its latest version content
 */
export async function getDocumentById(id: string): Promise<Document & { latestVersion?: DocumentVersion }> {
  const response = await api.get<Document & { latestVersion?: DocumentVersion }>(`/documents/${id}`);
  return response.data;
}

/**
 * Update a document (creates new version if content changes)
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentDto
): Promise<Document> {
  const response = await api.patch<Document>(`/documents/${id}`, data);
  return response.data;
}

/**
 * Get all versions of a document
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const response = await api.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
  return response.data;
}

/**
 * Get a specific version of a document
 */
export async function getDocumentVersion(
  documentId: string,
  version: number
): Promise<DocumentVersion> {
  const response = await api.get<DocumentVersion>(`/documents/${documentId}/versions/${version}`);
  return response.data;
}

/**
 * Rollback document to a previous version
 * Creates a new version with content from the specified version
 */
export async function rollbackDocument(
  documentId: string,
  version: number
): Promise<Document> {
  const response = await api.post<Document>(`/documents/${documentId}/rollback`, {
    version,
  });
  return response.data;
}

/**
 * Export document to PDF
 * Returns a blob URL for download
 */
export async function exportDocumentToPDF(documentId: string): Promise<Blob> {
  const response = await api.get(`/documents/${documentId}/export/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Export document to DOCX
 * Returns a blob URL for download
 */
export async function exportDocumentToDOCX(documentId: string): Promise<Blob> {
  const response = await api.get(`/documents/${documentId}/export/docx`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Helper to trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const documentService = {
  createDocument,
  getDocumentsByProject,
  getDocumentById,
  updateDocument,
  getDocumentVersions,
  getDocumentVersion,
  rollbackDocument,
  exportDocumentToPDF,
  exportDocumentToDOCX,
  downloadBlob,
};

export default documentService;
