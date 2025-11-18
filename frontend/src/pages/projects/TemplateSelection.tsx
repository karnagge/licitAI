import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplates } from '../../hooks/useTemplates';
import { TemplateCard } from '../../components/features/TemplateCard';
import { TemplatePreview } from '../../components/features/TemplatePreview';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Template } from '@shared/types/entities';
import { TemplateType } from '@shared/types/enums';

/**
 * TemplateSelection Page
 *
 * Allows users to choose a template for their new project.
 * Displays available system and custom templates with filtering options.
 *
 * Features:
 * - Filter templates by type (ETP, Bidding Notice, Contract)
 * - Grid layout of template cards
 * - Template preview modal
 * - Template selection and navigation
 * - Loading and error states
 */
export function TemplateSelection() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [selectedType, setSelectedType] = useState<TemplateType | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading, error } = useTemplates(selectedType);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (!selectedTemplate || !projectId) return;

    // Navigate to chat interface with selected template
    navigate(`/projects/${projectId}/chat?templateId=${selectedTemplate.id}`);
  };

  const typeFilters = [
    { value: undefined, label: 'Todos' },
    { value: TemplateType.ETP, label: 'Estudo Técnico Preliminar' },
    { value: TemplateType.BIDDING_NOTICE, label: 'Edital de Licitação' },
    { value: TemplateType.CONTRACT, label: 'Contrato' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selecione um Template
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Escolha o tipo de documento que deseja gerar
              </p>
            </div>
            <Button
              onClick={() => navigate(`/projects/${projectId}`)}
              variant="secondary"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setSelectedType(filter.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  selectedType === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12">
            <p className="text-red-600">
              Erro ao carregar templates. Tente novamente.
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates && templates.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-600">
              Nenhum template encontrado para este filtro.
            </p>
          </Card>
        )}

        {/* Templates Grid */}
        {!isLoading && !error && templates && templates.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                />
              ))}
            </div>

            {/* Continue Button */}
            {selectedTemplate && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Template selecionado:</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTemplate.name}
                    </p>
                  </div>
                  <Button onClick={handleContinue} variant="primary" size="lg">
                    Continuar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            handleSelectTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
