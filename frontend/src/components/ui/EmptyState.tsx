import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState Component
 *
 * Displays guidance when a list or collection is empty.
 * Helps users understand next steps.
 *
 * Features:
 * - Optional icon for visual context
 * - Clear title and description
 * - Optional call-to-action button
 * - Centered, clean layout
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FolderIcon />}
 *   title="Nenhum projeto ainda"
 *   description="Crie seu primeiro projeto para começar a gerar documentos"
 *   actionLabel="Criar Projeto"
 *   onAction={() => navigate('/projects/new')}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        ${className}
      `}
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-gray-400 w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Default Folder Icon for Empty Projects List
 */
export function FolderPlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-full h-full"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}
