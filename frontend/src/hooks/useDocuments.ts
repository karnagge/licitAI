import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createDocument,
  getDocumentsByProject,
  getDocumentById,
  updateDocument,
  getDocumentVersions,
  exportDocumentToPDF,
  exportDocumentToDOCX,
  downloadBlob,
  type CreateDocumentDto,
  type UpdateDocumentDto,
} from '../services/documentService';

/**
 * Query keys for documents
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  listByProject: (projectId: string) =>
    [...documentKeys.lists(), { projectId }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (documentId: string) =>
    [...documentKeys.all, 'versions', documentId] as const,
};

/**
 * Hook to fetch documents by project
 */
export function useDocumentsByProject(projectId: string) {
  return useQuery({
    queryKey: documentKeys.listByProject(projectId),
    queryFn: () => getDocumentsByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single document
 */
export function useDocument(documentId: string) {
  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: () => getDocumentById(documentId),
    enabled: !!documentId,
  });
}

/**
 * Hook to fetch document versions
 */
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: documentKeys.versions(documentId),
    queryFn: () => getDocumentVersions(documentId),
    enabled: !!documentId,
  });
}

/**
 * Hook to create a document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDocument,
    onSuccess: (newDocument) => {
      // Invalidate project documents list
      queryClient.invalidateQueries({
        queryKey: documentKeys.listByProject(newDocument.projectId),
      });
    },
  });
}

/**
 * Hook to update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      // Update the specific document in cache
      queryClient.setQueryData(
        documentKeys.detail(updatedDocument.id),
        updatedDocument
      );
      // Invalidate lists and versions
      queryClient.invalidateQueries({
        queryKey: documentKeys.listByProject(updatedDocument.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.versions(updatedDocument.id),
      });
    },
  });
}

/**
 * Hook to export document to PDF/DOCX
 *
 * @example
 * ```tsx
 * const { exportToPDF, exportToDOCX, isExporting } = useExportDocument();
 *
 * const handleExportPDF = async () => {
 *   await exportToPDF(documentId, 'my-document.pdf');
 * };
 * ```
 */
export function useExportDocument() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToPDF = async (documentId: string, filename: string) => {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await exportDocumentToPDF(documentId);
      downloadBlob(blob, filename);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao exportar PDF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToDOCX = async (documentId: string, filename: string) => {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await exportDocumentToDOCX(documentId);
      downloadBlob(blob, filename);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao exportar DOCX';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    exportToDOCX,
    isExporting,
    error,
  };
}
