import { useState, FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProjectFormData {
  name: string;
  description?: string;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

/**
 * ProjectForm Component
 *
 * Reusable form for creating/editing projects.
 * Used in project creation modal and project settings.
 *
 * Features:
 * - Project name and description fields
 * - Form validation
 * - Loading states
 * - Customizable submit button
 * - Optional cancel button
 */
export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  isLoading = false,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('O nome do projeto é obrigatório');
      return;
    }

    if (name.trim().length < 3) {
      setError('O nome do projeto deve ter no mínimo 3 caracteres');
      return;
    }

    if (name.trim().length > 200) {
      setError('O nome do projeto deve ter no máximo 200 caracteres');
      return;
    }

    if (description.trim().length > 1000) {
      setError('A descrição deve ter no máximo 1000 caracteres');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Falha ao salvar projeto. Tente novamente.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="projectName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nome do Projeto <span className="text-red-500">*</span>
        </label>
        <Input
          id="projectName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Licitação para aquisição de..."
          disabled={isLoading}
          required
          autoFocus
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">
          Um nome claro e descritivo para identificar este projeto
        </p>
      </div>

      <div>
        <label
          htmlFor="projectDescription"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Descrição
        </label>
        <textarea
          id="projectDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o objetivo deste projeto de licitação..."
          disabled={isLoading}
          rows={4}
          maxLength={1000}
          className="
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            text-sm
          "
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Opcional - ajuda a contextualizar o projeto</span>
          <span>{description.length}/1000</span>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          variant="primary"
        >
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
