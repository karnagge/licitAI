import { useState } from 'react';
import { TemplateType } from '@shared/types/enums';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TemplateSection {
  title: string;
  description: string;
  order: number;
  required: boolean;
  guidelines: string;
}

interface CustomTemplateFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    type: TemplateType;
    sections: TemplateSection[];
  }) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * CustomTemplateForm Component
 *
 * Form for creating custom templates with user-defined sections.
 * Users can add/remove sections, set order, and define requirements.
 *
 * Features:
 * - Template metadata (name, description, type)
 * - Dynamic section management (add/remove/reorder)
 * - Section configuration (title, description, required)
 * - Form validation
 * - Loading states
 */
export function CustomTemplateForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomTemplateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TemplateType>(TemplateType.ETP);
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      title: '',
      description: '',
      order: 0,
      required: true,
      guidelines: '',
    },
  ]);

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: '',
        description: '',
        order: sections.length,
        required: false,
        guidelines: '',
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    // Reorder remaining sections
    setSections(
      newSections.map((section, i) => ({
        ...section,
        order: i,
      }))
    );
  };

  const handleSectionChange = (
    index: number,
    field: keyof TemplateSection,
    value: any
  ) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };
    setSections(newSections);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap sections
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order
    setSections(
      newSections.map((section, i) => ({
        ...section,
        order: i,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      alert('Por favor, insira um nome para o template');
      return;
    }

    if (sections.length === 0) {
      alert('Por favor, adicione pelo menos uma seção');
      return;
    }

    const invalidSection = sections.find((s) => !s.title.trim());
    if (invalidSection) {
      alert('Todas as seções devem ter um título');
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      type,
      sections,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Metadata */}
      <Card>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Informações do Template
          </h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Template *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Estudo Técnico Preliminar Simplificado"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o propósito deste template..."
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TemplateType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={TemplateType.ETP}>Estudo Técnico Preliminar (ETP)</option>
              <option value={TemplateType.NOTICE}>Edital de Licitação</option>
              <option value={TemplateType.CONTRACT}>Contrato</option>
              <option value={TemplateType.JUSTIFICATION}>Justificativa</option>
              <option value={TemplateType.OTHER}>Outro</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Sections */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Seções do Template
            </h3>
            <Button type="button" onClick={handleAddSection} size="sm">
              + Adicionar Seção
            </Button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Seção {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Move buttons */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'up')}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                    )}
                    {index < sections.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'down')}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                    )}
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Remover seção"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    handleSectionChange(index, 'title', e.target.value)
                  }
                  required
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título da seção *"
                />

                <textarea
                  value={section.description}
                  onChange={(e) =>
                    handleSectionChange(index, 'description', e.target.value)
                  }
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição (opcional)"
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.required}
                    onChange={(e) =>
                      handleSectionChange(index, 'required', e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Seção obrigatória
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary" disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
}
