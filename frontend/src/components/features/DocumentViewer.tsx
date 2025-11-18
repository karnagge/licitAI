import type { Document, DocumentVersion } from '@shared/types/entities';
import { DocumentStatus, ContentFormat } from '@shared/types/enums';

interface DocumentViewerProps {
  document: Document & { latestVersion?: DocumentVersion };
  isLoading?: boolean;
}

/**
 * DocumentViewer Component
 *
 * Displays the document content with proper formatting.
 * Supports HTML and Markdown content formats.
 *
 * Features:
 * - Content rendering (HTML/Markdown)
 * - Document metadata display
 * - Status badge
 * - Word count
 * - Last updated timestamp
 * - Loading state
 */
export function DocumentViewer({ document, isLoading = false }: DocumentViewerProps) {
  const statusColors = {
    [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [DocumentStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.FINAL]: 'bg-green-100 text-green-800',
    [DocumentStatus.ARCHIVED]: 'bg-gray-100 text-gray-500',
  };

  const statusLabels = {
    [DocumentStatus.DRAFT]: 'Rascunho',
    [DocumentStatus.IN_REVIEW]: 'Em Revisão',
    [DocumentStatus.FINAL]: 'Final',
    [DocumentStatus.ARCHIVED]: 'Arquivado',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
          <p className="text-sm text-gray-600">Carregando documento...</p>
        </div>
      </div>
    );
  }

  const version = document.latestVersion;
  const content = version?.content || '';
  const isHtml = version?.contentFormat === ContentFormat.HTML;

  const formattedDate = new Date(document.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Document Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-8 py-6 sticky top-0 z-10">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <span
            className={`
              ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
              ${statusColors[document.status as DocumentStatus]}
            `}
          >
            {statusLabels[document.status as DocumentStatus]}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CalendarIcon />
            <span>Atualizado em {formattedDate}</span>
          </div>
          {version && (
            <>
              <div className="flex items-center gap-1">
                <DocumentTextIcon />
                <span>Versão {document.currentVersion}</span>
              </div>
              <div className="flex items-center gap-1">
                <WordCountIcon />
                <span>{version.wordCount.toLocaleString('pt-BR')} palavras</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="px-8 py-8 max-w-4xl mx-auto">
        {!content ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Documento vazio
            </h3>
            <p className="text-sm text-gray-600">
              Este documento ainda não possui conteúdo.
            </p>
          </div>
        ) : (
          <div
            className={`
              prose prose-sm max-w-none
              prose-headings:text-gray-900 prose-headings:font-semibold
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-700
              ${!isHtml ? 'whitespace-pre-wrap' : ''}
            `}
          >
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div>{content}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Calendar Icon
 */
function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

/**
 * Document Text Icon
 */
function DocumentTextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

/**
 * Word Count Icon
 */
function WordCountIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
      />
    </svg>
  );
}
