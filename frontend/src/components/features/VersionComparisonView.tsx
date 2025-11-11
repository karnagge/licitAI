import { useDocumentVersion } from '../../hooks/useDocuments';
import { Card } from '../ui/Card';

interface VersionComparisonViewProps {
  documentId: string;
  version1: number;
  version2: number;
}

/**
 * VersionComparisonView Component
 *
 * Side-by-side comparison of two document versions.
 * Highlights differences between versions for easy review.
 *
 * Features:
 * - Side-by-side layout
 * - Word-level diff highlighting
 * - Loading states for each version
 * - Metadata display (author, date, change type)
 * - Scrollable content areas
 */
export function VersionComparisonView({
  documentId,
  version1,
  version2,
}: VersionComparisonViewProps) {
  const { data: v1, isLoading: loading1 } = useDocumentVersion(documentId, version1);
  const { data: v2, isLoading: loading2 } = useDocumentVersion(documentId, version2);

  const isLoading = loading1 || loading2;

  // Simple word-level diff
  const getDiff = (text1: string, text2: string) => {
    const words1 = text1.split(/(\s+)/);
    const words2 = text2.split(/(\s+)/);

    const diff1: { text: string; type: 'same' | 'removed' | 'changed' }[] = [];
    const diff2: { text: string; type: 'same' | 'added' | 'changed' }[] = [];

    const maxLen = Math.max(words1.length, words2.length);

    for (let i = 0; i < maxLen; i++) {
      const w1 = words1[i] || '';
      const w2 = words2[i] || '';

      if (w1 === w2) {
        diff1.push({ text: w1, type: 'same' });
        diff2.push({ text: w2, type: 'same' });
      } else {
        if (w1) diff1.push({ text: w1, type: w2 ? 'changed' : 'removed' });
        if (w2) diff2.push({ text: w2, type: w1 ? 'changed' : 'added' });
      }
    }

    return { diff1, diff2 };
  };

  const content1 = v1 ? stripHtml(v1.content) : '';
  const content2 = v2 ? stripHtml(v2.content) : '';
  const { diff1, diff2 } = getDiff(content1, content2);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Comparação de Versões
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Versão {version1}</span>
            {v1 && (
              <div className="text-xs text-gray-600 mt-1">
                {v1.creator.fullName} • {new Date(v1.createdAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-700">Versão {version2}</span>
            {v2 && (
              <div className="text-xs text-gray-600 mt-1">
                {v2.creator.fullName} • {new Date(v2.createdAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-600">Carregando comparação...</p>
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      {!isLoading && v1 && v2 && (
        <>
          {/* Legend */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
                <span className="text-gray-700">Removido</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                <span className="text-gray-700">Adicionado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></span>
                <span className="text-gray-700">Modificado</span>
              </div>
            </div>
          </div>

          {/* Side-by-side Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-px bg-gray-200 h-full">
              {/* Version 1 */}
              <div className="bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {diff1.map((part, idx) => (
                      <DiffSpan key={idx} text={part.text} type={part.type} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Version 2 */}
              <div className="bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    {diff2.map((part, idx) => (
                      <DiffSpan key={idx} text={part.text} type={part.type} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Palavras:</span> {v1.wordCount}
              </div>
              <div>
                <span className="font-medium">Palavras:</span> {v2.wordCount}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * DiffSpan Component
 *
 * Renders a text segment with appropriate diff styling
 */
function DiffSpan({
  text,
  type,
}: {
  text: string;
  type: 'same' | 'removed' | 'added' | 'changed';
}) {
  const styles: Record<typeof type, string> = {
    same: '',
    removed: 'bg-red-100 text-red-900 line-through',
    added: 'bg-green-100 text-green-900',
    changed: 'bg-yellow-100 text-yellow-900',
  };

  if (type === 'same') {
    return <span>{text}</span>;
  }

  return <span className={`${styles[type]} px-0.5 rounded`}>{text}</span>;
}

/**
 * Strip HTML tags from content
 * Simple implementation for text comparison
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
