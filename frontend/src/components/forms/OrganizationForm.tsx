import { useState, FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OrganizationType } from '@shared/types/enums';

interface OrganizationFormData {
  name: string;
  type: OrganizationType;
  cnpj?: string;
}

interface OrganizationFormProps {
  initialData?: Partial<OrganizationFormData>;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

/**
 * OrganizationForm Component
 *
 * Reusable form for creating/editing organization information.
 * Used in registration flow and organization settings.
 *
 * Features:
 * - Organization name and type fields
 * - Optional CNPJ field
 * - Form validation
 * - Loading states
 * - Customizable submit button
 */
export function OrganizationForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  isLoading = false,
}: OrganizationFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<OrganizationType>(
    initialData?.type || OrganizationType.MUNICIPAL
  );
  const [cnpj, setCnpj] = useState(initialData?.cnpj || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('O nome da organização é obrigatório');
      return;
    }

    if (name.trim().length < 3) {
      setError('O nome da organização deve ter no mínimo 3 caracteres');
      return;
    }

    // CNPJ validation (optional but must be valid if provided)
    if (cnpj && !isValidCNPJ(cnpj)) {
      setError('CNPJ inválido');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        type,
        cnpj: cnpj.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha ao salvar organização. Tente novamente.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="organizationName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nome da Organização <span className="text-red-500">*</span>
        </label>
        <Input
          id="organizationName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prefeitura Municipal de..."
          disabled={isLoading}
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500">
          Nome oficial da instituição pública
        </p>
      </div>

      <div>
        <label
          htmlFor="organizationType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tipo de Organização <span className="text-red-500">*</span>
        </label>
        <select
          id="organizationType"
          value={type}
          onChange={(e) => setType(e.target.value as OrganizationType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isLoading}
          required
        >
          <option value={OrganizationType.MUNICIPAL}>Municipal</option>
          <option value={OrganizationType.STATE}>Estadual</option>
          <option value={OrganizationType.FEDERAL}>Federal</option>
          <option value={OrganizationType.AUTONOMOUS}>Autônoma</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Nível governamental da organização
        </p>
      </div>

      <div>
        <label
          htmlFor="cnpj"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          CNPJ
        </label>
        <Input
          id="cnpj"
          type="text"
          value={cnpj}
          onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
          placeholder="00.000.000/0000-00"
          disabled={isLoading}
          maxLength={18}
        />
        <p className="mt-1 text-xs text-gray-500">Opcional</p>
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

/**
 * Format CNPJ with masks: 00.000.000/0000-00
 */
function formatCNPJ(value: string): string {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');

  // Apply mask
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12)
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Validate CNPJ using check digits algorithm
 */
function isValidCNPJ(cnpj: string): boolean {
  // Remove non-digits
  const numbers = cnpj.replace(/\D/g, '');

  // Must have 14 digits
  if (numbers.length !== 14) return false;

  // Reject known invalid CNPJs
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit1 !== parseInt(numbers[12])) return false;

  // Validate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit2 !== parseInt(numbers[13])) return false;

  return true;
}
