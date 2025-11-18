import { DocumentVersion } from '@shared/types/entities';
import { ChangeType } from '@shared/types/enums';

interface VersionListItemProps {
  version: DocumentVersion;
  isActive: boolean;
  isCurrent: boolean;
  onSelect: (version: number) => void;
  onRollback: (version: number) => void;
}

/**
 * VersionListItem Component
 *
 * Displays a single version in the version history list.
 * Shows version number, change type, timestamp, and creator info.
 *
 * Features:
 * - Change type badge with color coding
 * - Relative timestamp display
 * - Current version indicator
 * - Select and rollback actions
 * - Hover states
 */
export function VersionListItem({
  version,
  isActive,
  isCurrent,
  onSelect,
  onRollback,
}: VersionListItemProps) {
  const formattedDate = new Date(version.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`
        border-l-4 pl-4 py-3 cursor-pointer transition-colors
        ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
      `}
      onClick={() => onSelect(version.version)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Version info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              Versão {version.version}
            </span>
            {isCurrent && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Atual
              </span>
            )}
            <ChangeTypeBadge changeType={version.changeType} />
          </div>

          <p className="text-sm text-gray-600 mb-1">
            {version.creator.fullName}
          </p>

          <p className="text-xs text-gray-500">{formattedDate}</p>

          {version.changeDescription && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {version.changeDescription}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            {version.wordCount} palavras
          </p>
        </div>

        {/* Right side: Actions */}
        {!isCurrent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRollback(version.version);
            }}
            className="
              px-3 py-1.5 text-xs font-medium text-blue-700
              hover:text-blue-900 hover:bg-blue-100
              rounded-md transition-colors
              flex-shrink-0
            "
          >
            Reverter
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * ChangeTypeBadge Component
 *
 * Displays a colored badge based on change type
 */
function ChangeTypeBadge({ changeType }: { changeType: ChangeType }) {
  const badges: Record<ChangeType, { label: string; className: string }> = {
    INITIAL: {
      label: 'Inicial',
      className: 'bg-gray-100 text-gray-800',
    },
    MANUAL_EDIT: {
      label: 'Edição Manual',
      className: 'bg-blue-100 text-blue-800',
    },
    AI_GENERATION: {
      label: 'IA Gerada',
      className: 'bg-purple-100 text-purple-800',
    },
    AI_REFINEMENT: {
      label: 'IA Refinada',
      className: 'bg-indigo-100 text-indigo-800',
    },
    ROLLBACK: {
      label: 'Reversão',
      className: 'bg-orange-100 text-orange-800',
    },
  };

  const badge = badges[changeType] || badges.MANUAL_EDIT;

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
