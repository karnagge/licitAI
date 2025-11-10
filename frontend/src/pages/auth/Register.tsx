import { RegisterForm } from '../../components/forms/RegisterForm';
import { Card } from '../../components/ui/Card';

/**
 * Register Page
 *
 * Public page for new user registration.
 * Creates both organization and admin user account.
 */
export function Register() {
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
              Criar sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Comece a gerar documentos de licitação com IA em minutos
            </p>
          </div>

          <RegisterForm />
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Ao criar uma conta, você concorda com nossos{' '}
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
