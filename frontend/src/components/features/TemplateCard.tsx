import { Card } from '../ui/Card';
import type { Template } from '@shared/types/entities';
import { TemplateType } from '@shared/types/enums';

interface TemplateCardProps {
  template: Template;
  onSelect?: () => void;
  onPreview?: () => void;
  isSelected?: boolean;
}

/**
 * TemplateCard Component
 *
 * Displays a template option with type, description, and usage stats.
 * Supports selection and preview actions.
 *
 * Features:
 * - Template name and description
 * - Type badge (ETP, Bidding Notice, Contract, Custom)
 * - System vs Custom indicator
 * - Usage count
 * - Preview and select buttons
 * - Selected state styling
 */
export function TemplateCard({
  template,
  onSelect,
  onPreview,
  isSelected = false,
}: TemplateCardProps) {
  const typeColors = {
    [TemplateType.ETP]: 'bg-purple-100 text-purple-800',
    [TemplateType.BIDDING_NOTICE]: 'bg-blue-100 text-blue-800',
    [TemplateType.CONTRACT]: 'bg-green-100 text-green-800',
    [TemplateType.CUSTOM]: 'bg-orange-100 text-orange-800',
  };

  const typeLabels = {
    [TemplateType.ETP]: 'Estudo Técnico Preliminar',
    [TemplateType.BIDDING_NOTICE]: 'Edital de Licitação',
    [TemplateType.CONTRACT]: 'Contrato',
    [TemplateType.CUSTOM]: 'Personalizado',
  };

  return (
    <Card
      padding="md"
      className={`
        transition-all cursor-pointer h-full flex flex-col
        ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}
      `}
      onClick={onSelect}
    >
      {/* Header: Name and System Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
          {template.name}
        </h3>
        {template.isSystem && (
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium whitespace-nowrap">
            Sistema
          </span>
        )}
      </div>

      {/* Type Badge */}
      <div className="mb-3">
        <span
          className={`
            inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
            ${typeColors[template.type as TemplateType] || 'bg-gray-100 text-gray-800'}
          `}
        >
          {typeLabels[template.type as TemplateType] || template.type}
        </span>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {template.description}
        </p>
      )}

      {/* Footer: Usage Stats and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <UsageIcon />
          <span>Usado {template.usageCount}x</span>
        </div>

        <div className="flex gap-2">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Visualizar
            </button>
          )}
          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isSelected ? 'Selecionado' : 'Selecionar'}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Usage Icon
 */
function UsageIcon() {
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
