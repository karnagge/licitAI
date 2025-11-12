import { useState, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

/**
 * SearchModal Component
 *
 * Full-screen search modal with SearchBar and SearchResults.
 * Provides a focused search experience with keyboard shortcuts.
 *
 * Features:
 * - Full-screen overlay
 * - Integrated search bar and results
 * - Keyboard shortcuts (Escape to close, Cmd/Ctrl+K to open)
 * - Optional project filtering
 * - Auto-focus on open
 * - Click outside to close
 */
export function SearchModal({ isOpen, onClose, projectId }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: results = [], isLoading } = useSearch(
    {
      query,
      projectId,
      limit: 20,
    },
    searchTriggered && query.length >= 2
  );

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchTriggered(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchTriggered(true);
  };

  const handleResultClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <SearchBar
            onSearch={handleSearch}
            placeholder={
              projectId
                ? 'Buscar neste projeto...'
                : 'Buscar em documentos e conversas...'
            }
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              {projectId ? 'Buscando apenas neste projeto' : 'Buscando em todos os projetos'}
            </span>
            <span>Pressione ESC para fechar</span>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searchTriggered ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Busca Inteligente
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Digite sua consulta para buscar documentos e conversas. Nossa IA
                encontrará os resultados mais relevantes usando busca semântica.
              </p>
            </div>
          ) : (
            <SearchResults
              results={results}
              query={query}
              isLoading={isLoading}
              onResultClick={handleResultClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
