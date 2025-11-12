import { useState, useEffect } from 'react';

export type AgentPhase = 'researcher' | 'validator' | 'writer' | 'reviewer';
export type PhaseStatus = 'pending' | 'working' | 'completed' | 'error';

interface AgentPhaseState {
  phase: AgentPhase;
  status: PhaseStatus;
  message?: string;
  startTime?: number;
  endTime?: number;
}

interface AgentProgressTrackerProps {
  currentPhase?: AgentPhase;
  phaseMessage?: string;
  isActive: boolean;
  onComplete?: () => void;
}

/**
 * AgentProgressTracker Component
 *
 * Visual progress tracker showing all AI agent phases.
 * Displays current phase, completed phases, and upcoming phases.
 *
 * Features:
 * - Sequential phase display (Researcher → Validator → Writer → Reviewer)
 * - Status indicators (pending/working/completed/error)
 * - Phase timing
 * - Progress percentage
 * - Detailed messages for each phase
 * - Smooth animations
 */
export function AgentProgressTracker({
  currentPhase,
  phaseMessage,
  isActive,
  onComplete,
}: AgentProgressTrackerProps) {
  const [phases, setPhases] = useState<AgentPhaseState[]>([
    { phase: 'researcher', status: 'pending' },
    { phase: 'validator', status: 'pending' },
    { phase: 'writer', status: 'pending' },
    { phase: 'reviewer', status: 'pending' },
  ]);

  useEffect(() => {
    if (!currentPhase || !isActive) return;

    setPhases((prev) =>
      prev.map((p) => {
        // Current phase is working
        if (p.phase === currentPhase) {
          return {
            ...p,
            status: 'working' as PhaseStatus,
            message: phaseMessage,
            startTime: p.startTime || Date.now(),
          };
        }

        // Phases before current are completed
        const phaseOrder = ['researcher', 'validator', 'writer', 'reviewer'];
        const currentIndex = phaseOrder.indexOf(currentPhase);
        const phaseIndex = phaseOrder.indexOf(p.phase);

        if (phaseIndex < currentIndex && p.status !== 'completed') {
          return {
            ...p,
            status: 'completed' as PhaseStatus,
            endTime: Date.now(),
          };
        }

        return p;
      })
    );
  }, [currentPhase, phaseMessage, isActive]);

  useEffect(() => {
    // Check if all phases are completed
    const allCompleted = phases.every((p) => p.status === 'completed');
    if (allCompleted && isActive) {
      onComplete?.();
    }
  }, [phases, isActive, onComplete]);

  const getCompletedCount = () => phases.filter((p) => p.status === 'completed').length;
  const progress = (getCompletedCount() / phases.length) * 100;

  if (!isActive) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Processamento IA
          </h3>
          <span className="text-xs text-gray-600">
            {getCompletedCount()}/{phases.length} fases
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <AgentPhaseItem
            key={phase.phase}
            phase={phase}
            isLast={index === phases.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * AgentPhaseItem Component
 *
 * Individual phase display with status and details
 */
function AgentPhaseItem({
  phase,
  isLast,
}: {
  phase: AgentPhaseState;
  isLast: boolean;
}) {
  const phaseInfo = {
    researcher: {
      name: 'Pesquisador',
      icon: '🔍',
      color: 'purple',
      description: 'Buscando legislação e requisitos aplicáveis',
    },
    validator: {
      name: 'Validador',
      icon: '✓',
      color: 'yellow',
      description: 'Verificando conformidade legal',
    },
    writer: {
      name: 'Escritor',
      icon: '✍️',
      color: 'blue',
      description: 'Gerando conteúdo estruturado',
    },
    reviewer: {
      name: 'Revisor',
      icon: '👁️',
      color: 'green',
      description: 'Revisando qualidade e consistência',
    },
  };

  const info = phaseInfo[phase.phase];
  const colorClasses = {
    purple: {
      working: 'bg-purple-100 border-purple-300 text-purple-900',
      completed: 'bg-purple-50 border-purple-200 text-purple-700',
      pending: 'bg-gray-50 border-gray-200 text-gray-600',
    },
    yellow: {
      working: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      completed: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      pending: 'bg-gray-50 border-gray-200 text-gray-600',
    },
    blue: {
      working: 'bg-blue-100 border-blue-300 text-blue-900',
      completed: 'bg-blue-50 border-blue-200 text-blue-700',
      pending: 'bg-gray-50 border-gray-200 text-gray-600',
    },
    green: {
      working: 'bg-green-100 border-green-300 text-green-900',
      completed: 'bg-green-50 border-green-200 text-green-700',
      pending: 'bg-gray-50 border-gray-200 text-gray-600',
    },
  };

  const colors = colorClasses[info.color];
  const statusClass = colors[phase.status as keyof typeof colors] || colors.pending;

  const getDuration = () => {
    if (!phase.startTime) return null;
    const end = phase.endTime || Date.now();
    const duration = Math.round((end - phase.startTime) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="relative">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
      )}

      <div className={`relative border rounded-lg p-4 transition-all ${statusClass}`}>
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {phase.status === 'working' && (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-2 border-current opacity-20 rounded-full" />
                <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {phase.status === 'completed' && (
              <div className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
            {phase.status === 'pending' && (
              <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg leading-none">{info.icon}</span>
              <span className="text-sm font-semibold">{info.name}</span>
              {phase.status === 'completed' && getDuration() && (
                <span className="text-xs opacity-60">• {getDuration()}</span>
              )}
            </div>

            <p className="text-xs opacity-75">
              {phase.message || info.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
