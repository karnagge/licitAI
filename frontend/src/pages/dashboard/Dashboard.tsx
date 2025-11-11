import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import { ProjectCard } from '../../components/features/ProjectCard';
import { ProjectForm } from '../../components/forms/ProjectForm';
import { EmptyState, FolderPlusIcon } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { CreateProjectDto } from '../../services/projectService';

/**
 * Dashboard Page
 *
 * Main landing page showing all projects for the current organization.
 *
 * Features:
 * - Grid layout of project cards
 * - Create new project modal
 * - Pagination controls
 * - Empty state for first-time users
 * - Loading and error states
 */
export function Dashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pageSize = 12;
  const { data, isLoading, error } = useProjects(page, pageSize);
  const createMutation = useCreateProject();

  const handleCreateProject = async (projectData: CreateProjectDto) => {
    try {
      const newProject = await createMutation.mutateAsync(projectData);
      setShowCreateModal(false);
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      // Error handling is done in the form component
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie todos os seus projetos de licitação
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              + Novo Projeto
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando projetos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12">
            <p className="text-red-600">
              Erro ao carregar projetos. Tente novamente.
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.projects.length === 0 && (
          <Card>
            <EmptyState
              icon={<FolderPlusIcon />}
              title="Nenhum projeto ainda"
              description="Crie seu primeiro projeto para começar a gerar documentos de licitação com IA"
              actionLabel="Criar Primeiro Projeto"
              onAction={() => setShowCreateModal(true)}
            />
          </Card>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && data && data.projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {(page - 1) * pageSize + 1} a{' '}
                  {Math.min(page * pageSize, data.total)} de {data.total} projetos
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="secondary"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center px-4 text-sm text-gray-700">
                    Página {page} de {data.totalPages}
                  </div>
                  <Button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    variant="secondary"
                    size="sm"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Criar Novo Projeto
            </h2>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowCreateModal(false)}
              submitLabel="Criar Projeto"
              isLoading={createMutation.isPending}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/**
 * Simple Modal Component
 * (Could be extracted to ui/Modal.tsx if reused elsewhere)
 */
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
