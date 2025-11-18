import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import type { Project } from '@shared/types/entities';
import { ProjectStatus } from '@shared/types/enums';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

/**
 * ProjectCard Component
 *
 * Displays a project summary with status and metadata.
 * Clickable card that navigates to project detail page.
 *
 * Features:
 * - Project name and description preview
 * - Status badge with color coding
 * - Last updated timestamp
 * - Hover states for interactivity
 */
export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const statusColors = {
    [ProjectStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [ProjectStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [ProjectStatus.ARCHIVED]: 'bg-gray-100 text-gray-500',
  };

  const statusLabels = {
    [ProjectStatus.DRAFT]: 'Rascunho',
    [ProjectStatus.ACTIVE]: 'Ativo',
    [ProjectStatus.COMPLETED]: 'Concluído',
    [ProjectStatus.ARCHIVED]: 'Arquivado',
  };

  const formattedDate = new Date(project.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link to={`/projects/${project.id}`} onClick={onClick}>
      <Card
        padding="md"
        className="hover:shadow-md transition-shadow cursor-pointer h-full"
      >
        {/* Header: Project Name and Status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {project.name}
          </h3>
          <span
            className={`
              ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap
              ${statusColors[project.status as ProjectStatus]}
            `}
          >
            {statusLabels[project.status as ProjectStatus]}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Footer: Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <CalendarIcon />
            <span>Atualizado em {formattedDate}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Calendar Icon
 */
function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}
