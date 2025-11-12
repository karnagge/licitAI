export type AgentPhase = 'researcher' | 'validator' | 'writer' | 'reviewer';

interface AgentPhaseIndicatorProps {
  phase: AgentPhase;
  message?: string;
  compact?: boolean;
}

/**
 * AgentPhaseIndicator Component
 *
 * Compact inline indicator showing current agent phase.
 * Displays agent name, icon, and optional message.
 *
 * Features:
 * - Color-coded by agent type
 * - Animated working indicator
 * - Compact and expanded modes
 * - Phase-specific icons and messages
 */
export function AgentPhaseIndicator({
  phase,
  message,
  compact = false,
}: AgentPhaseIndicatorProps) {
  const phaseInfo = {
    researcher: {
      name: 'Pesquisador',
      icon: '🔍',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      defaultMessage: 'Pesquisando legislação aplicável...',
    },
    validator: {
      name: 'Validador',
      icon: '✓',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      defaultMessage: 'Validando conformidade legal...',
    },
    writer: {
      name: 'Escritor',
      icon: '✍️',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      defaultMessage: 'Gerando conteúdo...',
    },
    reviewer: {
      name: 'Revisor',
      icon: '👁️',
      color: 'bg-green-100 text-green-800 border-green-200',
      defaultMessage: 'Revisando documento...',
    },
  };

  const info = phaseInfo[phase];
  const displayMessage = message || info.defaultMessage;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${info.color}`}>
        <span className="animate-pulse">{info.icon}</span>
        <span>{info.name}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg border ${info.color}`}>
      {/* Animated Spinner */}
      <div className="flex-shrink-0 w-4 h-4 relative">
        <div className="absolute inset-0 border-2 border-current opacity-20 rounded-full" />
        <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>

      {/* Content */}
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{info.icon}</span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{info.name}</span>
          <span className="text-xs opacity-75">{displayMessage}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * AgentPhaseBadge Component
 *
 * Small badge showing just the agent icon and name.
 * Used for minimal space contexts.
 */
export function AgentPhaseBadge({ phase }: { phase: AgentPhase }) {
  const phaseInfo = {
    researcher: { icon: '🔍', name: 'Pesquisador' },
    validator: { icon: '✓', name: 'Validador' },
    writer: { icon: '✍️', name: 'Escritor' },
    reviewer: { icon: '👁️', name: 'Revisor' },
  };

  const info = phaseInfo[phase];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  );
}
