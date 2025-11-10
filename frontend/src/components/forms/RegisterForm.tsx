import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OrganizationType } from '../../../../shared/types/enums';

/**
 * RegisterForm Component
 *
 * Handles user registration with organization creation.
 * Creates both organization and admin user in a single flow.
 *
 * The backend /auth/register endpoint:
 * 1. Creates the organization first
 * 2. Creates the admin user linked to that organization
 * 3. Returns JWT tokens for immediate authentication
 *
 * Features:
 * - Multi-field validation
 * - Password confirmation
 * - Organization type selection (aligned with Prisma schema)
 * - Error handling
 * - Loading states
 */
export function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] =
    useState<OrganizationType>(OrganizationType.MUNICIPAL);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !organizationName
    ) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        organizationName,
        organizationType,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha no registro. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nome Completo
        </label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Seu nome completo"
          disabled={isLoading}
          required
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={isLoading}
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Senha
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          disabled={isLoading}
          required
          autoComplete="new-password"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Confirmar Senha
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Digite a senha novamente"
          disabled={isLoading}
          required
          autoComplete="new-password"
        />
      </div>

      {/* Organization Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Informações da Organização
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome da Organização
            </label>
            <Input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Prefeitura Municipal de..."
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="organizationType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tipo de Organização
            </label>
            <select
              id="organizationType"
              value={organizationType}
              onChange={(e) =>
                setOrganizationType(e.target.value as OrganizationType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            >
              <option value={OrganizationType.MUNICIPAL}>Municipal</option>
              <option value={OrganizationType.STATE}>Estadual</option>
              <option value={OrganizationType.FEDERAL}>Federal</option>
              <option value={OrganizationType.AUTONOMOUS}>Autônoma</option>
            </select>
          </div>
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Fazer login
        </Link>
      </p>
    </form>
  );
}
