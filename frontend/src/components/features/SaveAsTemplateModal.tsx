import { useState } from 'react';
import { useCreateFromDocument } from '../../hooks/useTemplates';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SaveAsTemplateModalProps {
  documentId: string;
  documentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * SaveAsTemplateModal Component
 *
 * Modal for saving a document as a reusable template.
 * Extracts document structure (headings) to create template sections.
 *
 * Features:
 * - Simple form (name + description)
 * - Automatic structure extraction from document
 * - Success/error feedback
 * - Loading states
 */
export function SaveAsTemplateModal({
  documentId,
  documentTitle,
  isOpen,
  onClose,
  onSuccess,
}: SaveAsTemplateModalProps) {
  const [name, setName] = useState(`Template: ${documentTitle}`);
  const [description, setDescription] = useState('');

  const createFromDocMutation = useCreateFromDocument();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createFromDocMutation.mutateAsync({
        documentId,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // Success
      onSuccess?.();
      onClose();
    } catch (error: any) {
      // Error is already shown by mutation
      console.error('Failed to create template:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Salvar como Template
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Este documento será salvo como template reutilizável. A estrutura
            (títulos e seções) será extraída automaticamente.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="template-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Template *
              </label>
              <input
                type="text"
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: ETP Simplificado"
              />
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição (opcional)
              </label>
              <textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva quando usar este template..."
              />
            </div>
          </div>

          {createFromDocMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                {createFromDocMutation.error instanceof Error
                  ? createFromDocMutation.error.message
                  : 'Erro ao criar template. Tente novamente.'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={createFromDocMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createFromDocMutation.isPending}
            >
              {createFromDocMutation.isPending ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
