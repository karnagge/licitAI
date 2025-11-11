import { useState } from 'react';
import { UserRole } from '../../../../shared/types/enums';
import { Button } from '../ui/Button';

interface InviteUserFormProps {
  onSubmit: (data: {
    email: string;
    fullName: string;
    role: UserRole;
  }) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * InviteUserForm Component
 *
 * Form for inviting new users to the organization.
 * Admin/Manager can specify email, name, and role.
 *
 * Features:
 * - Email validation
 * - Role selection
 * - Form validation
 * - Loading states
 */
export function InviteUserForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InviteUserFormProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EDITOR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.trim() || !fullName.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      await onSubmit({
        email: email.trim(),
        fullName: fullName.trim(),
        role,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao convidar usuário');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="usuario@exemplo.com"
          disabled={isSubmitting}
        />
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="João da Silva"
          disabled={isSubmitting}
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Função *
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <option value={UserRole.VIEWER}>Visualizador (somente leitura)</option>
          <option value={UserRole.EDITOR}>Editor (pode editar documentos)</option>
          <option value={UserRole.MANAGER}>Gerente (pode gerenciar projetos e templates)</option>
          <option value={UserRole.ADMIN}>Administrador (controle total)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {role === UserRole.VIEWER && 'Pode visualizar documentos e projetos'}
          {role === UserRole.EDITOR && 'Pode criar e editar documentos'}
          {role === UserRole.MANAGER && 'Pode gerenciar projetos, templates e convidar usuários'}
          {role === UserRole.ADMIN && 'Controle total da organização'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando convite...' : 'Enviar Convite'}
        </Button>
      </div>
    </form>
  );
}
