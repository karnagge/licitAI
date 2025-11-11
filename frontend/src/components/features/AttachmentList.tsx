import { Attachment } from '../../../../shared/types/entities';
import { AttachmentStatus } from '../../../../shared/types/enums';
import { useDeleteAttachment } from '../../hooks/useAttachments';
import { downloadAttachment } from '../../services/attachmentService';

interface AttachmentListProps {
  attachments: Attachment[];
  showDelete?: boolean;
}

/**
 * AttachmentList Component
 *
 * Displays a list of file attachments.
 * Shows file info, status, and actions.
 *
 * Features:
 * - File icon based on type
 * - File size display
 * - Status indicators (uploading, ready, processing, error)
 * - Download action
 * - Delete action (optional)
 * - Processing status
 */
export function AttachmentList({ attachments, showDelete = false }: AttachmentListProps) {
  const deleteMutation = useDeleteAttachment();

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadAttachment(attachment.id, attachment.filename);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (window.confirm('Tem certeza que deseja remover este anexo?')) {
      try {
        await deleteMutation.mutateAsync(attachmentId);
      } catch (error) {
        console.error('Failed to delete attachment:', error);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      [AttachmentStatus.UPLOADING]: {
        label: 'Enviando',
        className: 'bg-blue-100 text-blue-800',
      },
      [AttachmentStatus.READY]: {
        label: 'Pronto',
        className: 'bg-green-100 text-green-800',
      },
      [AttachmentStatus.PROCESSING]: {
        label: 'Processando',
        className: 'bg-yellow-100 text-yellow-800',
      },
      [AttachmentStatus.ERROR]: {
        label: 'Erro',
        className: 'bg-red-100 text-red-800',
      },
    };

    const badge = statusMap[status] || statusMap[AttachmentStatus.READY];

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Nenhum anexo</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {/* File Icon */}
          <div className="text-2xl flex-shrink-0">
            {getFileIcon(attachment.mimeType)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.filename}
              </p>
              {getStatusBadge(attachment.status)}
            </div>
            <p className="text-xs text-gray-600">
              {formatFileSize(attachment.sizeBytes)}
              {attachment.processedAt && (
                <span className="ml-2">
                  • Processado em {new Date(attachment.processedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {attachment.status === AttachmentStatus.READY && (
              <button
                onClick={() => handleDownload(attachment)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Baixar"
              >
                <DownloadIcon />
              </button>
            )}

            {showDelete && (
              <button
                onClick={() => handleDelete(attachment.id)}
                disabled={deleteMutation.isPending}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Remover"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Download Icon
 */
function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

/**
 * Delete Icon
 */
function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}
