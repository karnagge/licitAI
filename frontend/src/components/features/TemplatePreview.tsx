import { Button } from '../ui/Button';
import type { Template } from '../../../../shared/types/entities';
import { TemplateType } from '../../../../shared/types/enums';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onSelect?: () => void;
}

/**
 * TemplatePreview Component
 *
 * Modal that displays detailed template information and section structure.
 * Allows users to review template before selecting.
 *
 * Features:
 * - Full template details
 * - Section list with descriptions
 * - Type and system status badges
 * - Usage statistics
 * - Select and close actions
 */
export function TemplatePreview({
  template,
  onClose,
  onSelect,
}: TemplatePreviewProps) {
  const typeLabels = {
    [TemplateType.ETP]: 'Estudo Técnico Preliminar',
    [TemplateType.BIDDING_NOTICE]: 'Edital de Licitação',
    [TemplateType.CONTRACT]: 'Contrato',
    [TemplateType.CUSTOM]: 'Personalizado',
  };

  // Parse sections from JSONB
  const sections = Array.isArray(template.sections)
    ? template.sections
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {typeLabels[template.type as TemplateType] || template.type}
                </span>
                {template.isSystem && (
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    Template do Sistema
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Usado {template.usageCount} vezes
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          {template.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          )}

          {/* Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Seções do Documento ({sections.length})
            </h3>
            {sections.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nenhuma seção definida
              </p>
            ) : (
              <div className="space-y-3">
                {sections.map((section: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {section.name || section.title || `Seção ${index + 1}`}
                        </h4>
                        {section.description && (
                          <p className="text-xs text-gray-600">
                            {section.description}
                          </p>
                        )}
                        {section.required && (
                          <span className="inline-block mt-1 text-xs text-blue-600">
                            Obrigatória
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
          {onSelect && (
            <Button onClick={onSelect} variant="primary">
              Usar Este Template
            </Button>
          )}
        </div>
      </div>
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
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
