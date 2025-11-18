import { useState } from 'react';
import { useTemplates, useCreateTemplate } from '../../hooks/useTemplates';
import { TemplateType } from '@shared/types/enums';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CustomTemplateForm } from '../../components/forms/CustomTemplateForm';

/**
 * TemplateManagement Page
 *
 * Page for managing organization templates.
 * Users can view all templates (system + custom) and create new ones.
 *
 * Features:
 * - List of all available templates
 * - Filter by type
 * - System vs custom template indicators
 * - Create new custom template
 * - Template usage statistics
 */
export function TemplateManagement() {
  const [filterType, setFilterType] = useState<TemplateType | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: templates, isLoading } = useTemplates(filterType);
  const createMutation = useCreateTemplate();

  const handleCreateTemplate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Templates
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Templates do sistema e personalizados da sua organização
              </p>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                + Criar Template
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showCreateForm ? (
          /* Create Form */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Criar Novo Template
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Defina as seções e a estrutura do seu template customizado
              </p>
            </div>
            <CustomTemplateForm
              onSubmit={handleCreateTemplate}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        ) : (
          /* Templates List */
          <div>
            {/* Filters */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por tipo:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType(undefined)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === undefined
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType(TemplateType.ETP)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === TemplateType.ETP
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ETP
                </button>
                <button
                  onClick={() => setFilterType(TemplateType.NOTICE)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === TemplateType.NOTICE
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Edital
                </button>
                <button
                  onClick={() => setFilterType(TemplateType.CONTRACT)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === TemplateType.CONTRACT
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Contrato
                </button>
                <button
                  onClick={() => setFilterType(TemplateType.JUSTIFICATION)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === TemplateType.JUSTIFICATION
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Justificativa
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
                <p className="text-sm text-gray-600">Carregando templates...</p>
              </div>
            )}

            {/* Templates Grid */}
            {!isLoading && templates && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        {template.isSystem ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Sistema
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Personalizado
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {template.description || 'Sem descrição'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.sections?.length || 0} seções</span>
                        <span>{template.usageCount} usos</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // TODO: Navigate to template detail or use in project
                            console.log('View template:', template.id);
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && templates && templates.length === 0 && (
              <Card className="text-center py-12">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {filterType
                    ? 'Nenhum template deste tipo disponível'
                    : 'Comece criando seu primeiro template customizado'}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Criar Template
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
