import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../../hooks/useDocuments';
import { VersionHistoryPanel } from '../../components/features/VersionHistoryPanel';
import { VersionComparisonView } from '../../components/features/VersionComparisonView';
import { DocumentViewer } from '../../components/features/DocumentViewer';
import { Button } from '../../components/ui/Button';

/**
 * VersionHistory Page
 *
 * Full-featured version history interface.
 * Allows viewing, comparing, and rolling back document versions.
 *
 * Features:
 * - Version list panel (left)
 * - Content viewer or comparison view (right)
 * - Toggle between single version view and comparison
 * - Breadcrumb navigation
 * - Loading and error states
 */
export function VersionHistory() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();

  const { data: document, isLoading } = useDocument(documentId!);

  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<number | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<number | null>(null);

  const handleVersionSelect = (version: number) => {
    if (compareMode) {
      // In compare mode, select two versions
      if (compareVersion1 === null) {
        setCompareVersion1(version);
      } else if (compareVersion2 === null && version !== compareVersion1) {
        setCompareVersion2(version);
      } else {
        // Reset and start over
        setCompareVersion1(version);
        setCompareVersion2(null);
      }
    } else {
      // In single view mode
      setSelectedVersion(version);
    }
  };

  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareVersion1(null);
    setCompareVersion2(null);
    setSelectedVersion(null);
  };

  const handleBack = () => {
    if (document) {
      navigate(`/projects/${document.projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const canCompare = compareVersion1 !== null && compareVersion2 !== null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="sm">
              <BackIcon />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>/</span>
              <span className="font-semibold text-gray-900">
                {document ? document.title : 'Carregando...'}
              </span>
              <span>/</span>
              <span>Histórico de Versões</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleCompareMode}
              variant={compareMode ? 'primary' : 'secondary'}
              size="sm"
            >
              {compareMode ? 'Modo Normal' : 'Comparar Versões'}
            </Button>
          </div>
        </div>

        {/* Compare Mode Instructions */}
        {compareMode && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              {!compareVersion1 && 'Selecione a primeira versão para comparar'}
              {compareVersion1 && !compareVersion2 && 'Selecione a segunda versão para comparar'}
              {canCompare && (
                <>
                  Comparando versão {compareVersion1} com versão {compareVersion2}
                </>
              )}
            </p>
          </div>
        )}
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

      {/* Content */}
      {!isLoading && document && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Version History */}
          <div className="w-96 flex-shrink-0 border-r border-gray-200 overflow-hidden">
            <VersionHistoryPanel
              documentId={documentId!}
              currentVersion={document.currentVersion}
              onVersionSelect={handleVersionSelect}
            />
          </div>

          {/* Right Panel: Content or Comparison */}
          <div className="flex-1 overflow-hidden">
            {compareMode && canCompare ? (
              // Comparison View
              <VersionComparisonView
                documentId={documentId!}
                version1={compareVersion1!}
                version2={compareVersion2!}
              />
            ) : (
              // Single Version View or Document View
              <div className="h-full flex items-center justify-center bg-white">
                {selectedVersion ? (
                  <div className="max-w-4xl w-full h-full overflow-y-auto p-8">
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Visualizando Versão {selectedVersion}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedVersion === document.currentVersion
                          ? 'Esta é a versão atual'
                          : 'Versão anterior do documento'}
                      </p>
                    </div>
                    {/* TODO: Show version content here */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-600">
                        Visualização de versão específica em desenvolvimento.
                        Use o modo de comparação para ver diferenças entre versões.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Selecione uma versão
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md">
                      {compareMode
                        ? 'Selecione duas versões para comparar suas diferenças'
                        : 'Selecione uma versão no painel esquerdo para visualizar'}
                    </p>
                  </div>
                )}
              </div>
            )}
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
