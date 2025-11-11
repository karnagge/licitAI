interface AgentStatusIndicatorProps {
  agent?: string;
  status?: string;
  message?: string;
  isVisible?: boolean;
}

/**
 * AgentStatusIndicator Component
 *
 * Displays the current AI agent activity during document generation.
 * Shows which agent is working and what it's doing.
 *
 * Features:
 * - Agent name display (Researcher, Validator, Writer, Reviewer)
 * - Status message
 * - Animated indicator
 * - Smooth fade in/out
 *
 * @example
 * ```tsx
 * <AgentStatusIndicator
 *   agent="Researcher"
 *   status="working"
 *   message="Pesquisando legislação aplicável..."
 *   isVisible={true}
 * />
 * ```
 */
export function AgentStatusIndicator({
  agent,
  status,
  message,
  isVisible = false,
}: AgentStatusIndicatorProps) {
  if (!isVisible || !agent) return null;

  const agentColors = {
    Researcher: 'bg-purple-100 text-purple-800 border-purple-200',
    Validator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Writer: 'bg-blue-100 text-blue-800 border-blue-200',
    Reviewer: 'bg-green-100 text-green-800 border-green-200',
  } as const;

  const agentIcons = {
    Researcher: '🔍',
    Validator: '✓',
    Writer: '✍️',
    Reviewer: '👁️',
  } as const;

  const colorClass =
    agentColors[agent as keyof typeof agentColors] || 'bg-gray-100 text-gray-800';
  const icon = agentIcons[agent as keyof typeof agentIcons] || '🤖';

  return (
    <div
      className={`
        inline-flex items-center gap-3 px-4 py-3 rounded-lg border
        ${colorClass}
        animate-fade-in
      `}
    >
      {/* Animated Spinner */}
      <div className="flex-shrink-0 w-5 h-5 relative">
        <div className="absolute inset-0 border-2 border-current opacity-20 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-sm font-semibold">{agent}</span>
        </div>
        {message && (
          <p className="text-xs opacity-80 truncate">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * TypingIndicator Component
 *
 * Simple animated dots indicator for when AI is typing.
 * Used when agent status is not available.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 w-fit">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="text-sm text-gray-600">IA está pensando...</span>
    </div>
  );
}
