import { LoginForm } from '../../components/forms/LoginForm';
import { Card } from '../../components/ui/Card';

/**
 * Login Page
 *
 * Public page for user authentication.
 * Uses minimalist design with centered card layout.
 */
export function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">licitAI</h1>
          <p className="text-sm text-gray-600">
            Plataforma de Geração de Documentos de Licitação
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Entrar na sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Acesse sua conta para gerenciar seus projetos e documentos
            </p>
          </div>

          <LoginForm />
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Ao fazer login, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
