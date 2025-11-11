import { useRef, useState } from 'react';
import { useUploadAttachment } from '../../hooks/useAttachments';
import { Button } from '../ui/Button';

interface FileUploadProps {
  projectId: string;
  messageId?: string;
  onUploadComplete?: (attachmentId: string) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * FileUpload Component
 *
 * File upload button with drag-and-drop support.
 * Supports: TXT, PDF, DOCX, XLSX (max 10MB)
 *
 * Features:
 * - Click to select file
 * - Drag and drop support
 * - File type validation
 * - File size validation
 * - Upload progress feedback
 * - Error handling
 */
export function FileUpload({
  projectId,
  messageId,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadAttachment();

  const supportedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!supportedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado. Use TXT, PDF, DOCX ou XLSX.';
    }

    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Tamanho máximo: 10MB. Tamanho do arquivo: ${Math.round(file.size / 1024 / 1024)}MB.`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(new Error(validationError));
      return;
    }

    try {
      const attachment = await uploadMutation.mutateAsync({
        file,
        projectId,
        messageId,
      });
      onUploadComplete?.(attachment.id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer upload do arquivo';
      setError(errorMessage);
      onUploadError?.(new Error(errorMessage));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".txt,.pdf,.docx,.xlsx,.xls"
          className="hidden"
          disabled={uploadMutation.isPending}
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl">📎</div>
            <p className="text-sm font-medium text-gray-700">
              Clique ou arraste um arquivo
            </p>
            <p className="text-xs text-gray-500">
              TXT, PDF, DOCX, XLSX (máx. 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
