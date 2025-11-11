import { useState } from 'react';
import { useUsers, useInviteUser, useUpdateUserRole, useRemoveUser } from '../../hooks/useUsers';
import { UserRole } from '../../../../shared/types/enums';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InviteUserForm } from '../../components/forms/InviteUserForm';

/**
 * TeamManagement Page
 *
 * Page for managing team members (users) in the organization.
 * Admin can invite, change roles, and remove users.
 *
 * Features:
 * - List all users
 * - Invite new users
 * - Change user roles (Admin only)
 * - Remove users (Admin only)
 * - Role-based UI restrictions
 */
export function TeamManagement() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data: users, isLoading } = useUsers();
  const inviteMutation = useInviteUser();
  const updateRoleMutation = useUpdateUserRole();
  const removeMutation = useRemoveUser();

  const handleInvite = async (data: any) => {
    try {
      const result = await inviteMutation.mutateAsync(data);
      setShowInviteForm(false);

      // Show temp password (MVP only - in production would send email)
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (window.confirm(`Tem certeza que deseja alterar a função deste usuário?`)) {
      try {
        await updateRoleMutation.mutateAsync({ userId, role: newRole });
      } catch (error) {
        console.error('Failed to update role:', error);
      }
    }
  };

  const handleRemove = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${userName} da organização?`)) {
      try {
        await removeMutation.mutateAsync(userId);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao remover usuário');
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges: Record<UserRole, { label: string; className: string }> = {
      [UserRole.ADMIN]: {
        label: 'Admin',
        className: 'bg-purple-100 text-purple-800',
      },
      [UserRole.MANAGER]: {
        label: 'Gerente',
        className: 'bg-blue-100 text-blue-800',
      },
      [UserRole.EDITOR]: {
        label: 'Editor',
        className: 'bg-green-100 text-green-800',
      },
      [UserRole.VIEWER]: {
        label: 'Visualizador',
        className: 'bg-gray-100 text-gray-800',
      },
    };

    const badge = badges[role];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciar Equipe
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Convide membros e gerencie permissões
              </p>
            </div>
            {!showInviteForm && (
              <Button onClick={() => setShowInviteForm(true)}>
                + Convidar Usuário
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showInviteForm ? (
          /* Invite Form */
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Convidar Novo Usuário
              </h2>
              <InviteUserForm
                onSubmit={handleInvite}
                onCancel={() => setShowInviteForm(false)}
                isSubmitting={inviteMutation.isPending}
              />
            </div>
          </Card>
        ) : (
          /* Users List */
          <div>
            {/* Temp Password Alert (MVP only) */}
            {tempPassword && (
              <Card className="mb-6 bg-yellow-50 border-yellow-200">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                    Usuário convidado com sucesso!
                  </h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    Senha temporária (compartilhe com o usuário):
                  </p>
                  <code className="block p-2 bg-yellow-100 rounded text-sm font-mono">
                    {tempPassword}
                  </code>
                  <button
                    onClick={() => setTempPassword(null)}
                    className="text-sm text-yellow-700 hover:text-yellow-900 mt-2"
                  >
                    Fechar
                  </button>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
                <p className="text-sm text-gray-600">Carregando usuários...</p>
              </div>
            )}

            {/* Users Table */}
            {!isLoading && users && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Último Acesso
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.emailVerified ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Ativo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR')
                              : 'Nunca'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {/* Change Role */}
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                disabled={updateRoleMutation.isPending}
                              >
                                <option value={UserRole.VIEWER}>Visualizador</option>
                                <option value={UserRole.EDITOR}>Editor</option>
                                <option value={UserRole.MANAGER}>Gerente</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                              </select>

                              {/* Remove */}
                              <button
                                onClick={() => handleRemove(user.id, user.fullName)}
                                disabled={removeMutation.isPending}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Remover usuário"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && users && users.length === 0 && (
              <Card className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comece convidando membros para sua equipe
                </p>
                <Button onClick={() => setShowInviteForm(true)}>
                  Convidar Primeiro Usuário
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
