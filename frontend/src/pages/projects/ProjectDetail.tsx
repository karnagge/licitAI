import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useChatsByProject, useCreateChat } from '../../hooks/useChat';
import { useDocumentsByProject } from '../../hooks/useDocuments';
import { ChatInterface } from '../../components/features/ChatInterface';
import { DocumentViewer } from '../../components/features/DocumentViewer';
import { DocumentToolbar } from '../../components/features/DocumentToolbar';
import { SearchModal } from '../../components/features/SearchModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

/**
 * ProjectDetail Page
 *
 * Main workspace page combining chat interface and document view.
 * Users interact with AI through chat to generate and refine documents.
 *
 * Features:
 * - Split-pane layout (chat left, document right)
 * - Breadcrumb navigation
 * - Auto-create chat if none exists
 * - Display latest document
 * - Responsive layout
 * - Loading and error states
 */
export function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: chats, isLoading: chatsLoading } = useChatsByProject(projectId!);
  const { data: documents, isLoading: documentsLoading } = useDocumentsByProject(projectId!);
  const createChatMutation = useCreateChat();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [chatWidth, setChatWidth] = useState(50); // percentage
  const [searchOpen, setSearchOpen] = useState(false);

  // Auto-select first chat or create new one
  useEffect(() => {
    if (!chatsLoading && chats) {
      if (chats.length > 0 && !activeChatId) {
        setActiveChatId(chats[0].id);
      } else if (chats.length === 0 && projectId && !createChatMutation.isPending) {
        // Create initial chat
        createChatMutation.mutate(
          { projectId, title: 'Chat Inicial' },
          {
            onSuccess: (newChat) => {
              setActiveChatId(newChat.id);
            },
          }
        );
      }
    }
  }, [chats, chatsLoading, activeChatId, projectId, createChatMutation]);

  // Auto-select latest document
  useEffect(() => {
    if (!documentsLoading && documents && documents.length > 0 && !activeDocumentId) {
      // Get most recent document
      const latestDoc = [...documents].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setActiveDocumentId(latestDoc.id);
    }
  }, [documents, documentsLoading, activeDocumentId]);

  const handleMouseDown = () => {
    setResizing(true);
  };

  const handleMouseUp = () => {
    setResizing(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizing) {
      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      if (newWidth >= 30 && newWidth <= 70) {
        setChatWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener('mouseup', handleMouseUp as any);
      return () => document.removeEventListener('mouseup', handleMouseUp as any);
    }
  }, [resizing]);

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isLoading = projectLoading || chatsLoading || documentsLoading;
  const activeDocument = documents?.find((d) => d.id === activeDocumentId);

  return (
    <div
      className="h-screen flex flex-col bg-gray-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header with Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projetos
            </Link>
            <ChevronRightIcon />
            {project ? (
              <span className="text-gray-900 font-semibold">{project.name}</span>
            ) : (
              <span className="text-gray-400">Carregando...</span>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
              title="Buscar neste projeto (Ctrl/Cmd + K)"
            >
              <SearchIcon className="h-4 w-4" />
              <span>Buscar</span>
            </button>

            {documents && documents.length > 1 && (
              <select
                value={activeDocumentId || ''}
                onChange={(e) => setActiveDocumentId(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
              >
                <option value="">Selecione um documento</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} (v{doc.currentVersion})
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="sm"
            >
              Fechar Projeto
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-600">Carregando projeto...</p>
          </div>
        </div>
      )}

      {/* Split-Pane Layout */}
      {!isLoading && activeChatId && (
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Pane */}
          <div
            className="flex-shrink-0 bg-white border-r border-gray-200 overflow-hidden"
            style={{ width: `${chatWidth}%` }}
          >
            <ChatInterface chatId={activeChatId} />
          </div>

          {/* Resizer Handle */}
          <div
            className={`
              w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize
              transition-colors flex-shrink-0
              ${resizing ? 'bg-blue-500' : ''}
            `}
            onMouseDown={handleMouseDown}
          />

          {/* Document Pane */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeDocument ? (
              <>
                <DocumentToolbar
                  document={activeDocument}
                  onVersionHistory={() =>
                    navigate(`/documents/${activeDocument.id}/versions`)
                  }
                />
                <div className="flex-1 overflow-hidden">
                  <DocumentViewer document={activeDocument} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md">
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum documento ainda
                    </h3>
                    <p className="text-sm text-gray-600">
                      Use o chat para começar a gerar documentos com a IA.
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal - scoped to this project */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}

/**
 * Search Icon
 */
function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

/**
 * Chevron Right Icon
 */
function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
