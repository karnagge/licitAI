import { useState } from 'react';
import { useDocumentVersions, useRollbackDocument } from '../../hooks/useDocuments';
import { VersionListItem } from './VersionListItem';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface VersionHistoryPanelProps {
  documentId: string;
  currentVersion: number;
  onVersionSelect?: (version: number) => void;
  onClose?: () => void;
}

/**
 * VersionHistoryPanel Component
 *
 * Side panel displaying document version history.
 * Users can view versions, compare them, and rollback.
 *
 * Features:
 * - List of all document versions
 * - Current version indicator
 * - Version selection for comparison
 * - Rollback functionality with confirmation
 * - Loading and error states
 * - Empty state when no versions
 */
export function VersionHistoryPanel({
  documentId,
  currentVersion,
  onVersionSelect,
  onClose,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState<number | null>(null);

  const { data: versions, isLoading, error } = useDocumentVersions(documentId);
  const rollbackMutation = useRollbackDocument();

  const handleVersionSelect = (version: number) => {
    setSelectedVersion(version);
    onVersionSelect?.(version);
  };

  const handleRollbackClick = (version: number) => {
    setRollbackConfirm(version);
  };

  const handleRollbackConfirm = async () => {
    if (rollbackConfirm === null) return;

    try {
      await rollbackMutation.mutateAsync({
        documentId,
        version: rollbackConfirm,
      });
      setRollbackConfirm(null);
      setSelectedVersion(null);
    } catch (error) {
      console.error('Failed to rollback document:', error);
    }
  };

  const handleRollbackCancel = () => {
    setRollbackConfirm(null);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Versões
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {versions?.length || 0} {versions?.length === 1 ? 'versão' : 'versões'}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm text-gray-600">Carregando versões...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm">
            <div className="text-center py-8">
              <div className="text-3xl mb-3">⚠️</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Erro ao carregar versões
              </h4>
              <p className="text-sm text-gray-600">
                Não foi possível carregar o histórico. Tente novamente.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && versions?.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-sm">
            <div className="text-center py-8">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Nenhuma versão encontrada
              </h4>
              <p className="text-sm text-gray-600">
                Este documento ainda não possui histórico.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Versions List */}
      {!isLoading && !error && versions && versions.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {versions.map((version) => (
              <VersionListItem
                key={version.id}
                version={version}
                isActive={selectedVersion === version.version}
                isCurrent={version.version === currentVersion}
                onSelect={handleVersionSelect}
                onRollback={handleRollbackClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {rollbackConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Confirmar Reversão
              </h4>
              <p className="text-sm text-gray-700 mb-6">
                Tem certeza que deseja reverter para a versão {rollbackConfirm}?
                <br />
                <br />
                Uma nova versão será criada com o conteúdo da versão selecionada.
                O histórico completo será mantido.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleRollbackCancel}
                  variant="secondary"
                  disabled={rollbackMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRollbackConfirm}
                  variant="primary"
                  disabled={rollbackMutation.isPending}
                >
                  {rollbackMutation.isPending ? 'Revertendo...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Close Icon
 */
function CloseIcon() {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
