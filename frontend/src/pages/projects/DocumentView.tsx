import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../../hooks/useDocuments';
import { DocumentViewer } from '../../components/features/DocumentViewer';
import { DocumentToolbar } from '../../components/features/DocumentToolbar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

/**
 * DocumentView Page
 *
 * Displays a document with toolbar and viewer.
 * Standalone page for viewing and exporting documents.
 *
 * Features:
 * - Document toolbar with actions
 * - Document content viewer
 * - Navigation breadcrumbs
 * - Loading and error states
 * - Back to project button
 */
export function DocumentView() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();

  const { data: document, isLoading, error } = useDocument(documentId!);

  const handleVersionHistory = () => {
    navigate(`/documents/${documentId}/versions`);
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    alert('Funcionalidade de compartilhamento em desenvolvimento');
  };

  const handleBack = () => {
    if (document) {
      navigate(`/projects/${document.projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <BackIcon />
            <span>Voltar</span>
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>/</span>
            <span>Documento</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-600">Carregando documento...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar documento
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Não foi possível carregar o documento. Tente novamente.
              </p>
              <Button onClick={handleBack} variant="primary">
                Voltar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Document Content */}
      {!isLoading && !error && document && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <DocumentToolbar
            document={document}
            onVersionHistory={handleVersionHistory}
            onShare={handleShare}
          />

          {/* Viewer */}
          <div className="flex-1 overflow-hidden">
            <DocumentViewer document={document} isLoading={false} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Back Icon
 */
function BackIcon() {
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
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
}
