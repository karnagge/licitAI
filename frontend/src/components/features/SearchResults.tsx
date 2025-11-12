import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../../services/searchService';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
  onResultClick?: (result: SearchResult) => void;
}

/**
 * SearchResults Component
 *
 * Displays search results with highlighting and navigation.
 * Shows result type, similarity score, and content snippets.
 *
 * Features:
 * - Result type badges (document/message)
 * - Similarity score display
 * - Content snippet with highlighting
 * - Project name and metadata
 * - Click to navigate
 * - Empty state handling
 * - Loading state
 * - Grouped by result type
 */
export function SearchResults({
  results,
  query,
  isLoading = false,
  onResultClick,
}: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }

    // Navigate to the appropriate page
    if (result.type === 'document') {
      navigate(`/projects/${result.projectId}/documents/${result.id}`);
    } else if (result.type === 'message') {
      navigate(`/projects/${result.projectId}/chat`);
    }
  };

  // Highlight search query in text
  const highlightText = (text: string, highlight: string): JSX.Element => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-medium">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Get content snippet (first 200 chars)
  const getSnippet = (content: string, maxLength: number = 200): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Group results by type
  const documentResults = results.filter((r) => r.type === 'document');
  const messageResults = results.filter((r) => r.type === 'message');

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-gray-600">Buscando...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Não encontramos resultados para "{query}". Tente usar termos diferentes ou
          verifique a ortografia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </p>
      </div>

      {/* Document Results */}
      {documentResults.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DocumentIcon className="h-4 w-4" />
            Documentos ({documentResults.length})
          </h3>
          <div className="space-y-3">
            {documentResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                query={query}
                onClick={() => handleResultClick(result)}
                highlightText={highlightText}
                getSnippet={getSnippet}
              />
            ))}
          </div>
        </div>
      )}

      {/* Message Results */}
      {messageResults.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ChatIcon className="h-4 w-4" />
            Conversas ({messageResults.length})
          </h3>
          <div className="space-y-3">
            {messageResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                query={query}
                onClick={() => handleResultClick(result)}
                highlightText={highlightText}
                getSnippet={getSnippet}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SearchResultCard Component
 *
 * Individual search result card with details
 */
interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
  highlightText: (text: string, highlight: string) => JSX.Element;
  getSnippet: (content: string, maxLength?: number) => string;
}

function SearchResultCard({
  result,
  query,
  onClick,
  highlightText,
  getSnippet,
}: SearchResultCardProps) {
  const similarityPercent = Math.round(result.similarity * 100);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              result.type === 'document'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {result.type === 'document' ? (
              <>
                <DocumentIcon className="h-3 w-3" />
                Documento
              </>
            ) : (
              <>
                <ChatIcon className="h-3 w-3" />
                Conversa
              </>
            )}
          </span>

          {/* Project Name */}
          {result.projectName && (
            <span className="text-xs text-gray-600">
              {result.projectName}
            </span>
          )}
        </div>

        {/* Similarity Score */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="font-medium text-green-600">{similarityPercent}%</span>
          <span>relevante</span>
        </div>
      </div>

      {/* Title (for documents) */}
      {result.title && (
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          {highlightText(result.title, query)}
        </h4>
      )}

      {/* Content Snippet */}
      <p className="text-sm text-gray-700 leading-relaxed mb-2">
        {highlightText(getSnippet(result.content, 200), query)}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Por {result.createdBy}</span>
        <span>•</span>
        <span>{new Date(result.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    </button>
  );
}

/**
 * Document Icon
 */
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
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
 * Chat Icon
 */
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}
