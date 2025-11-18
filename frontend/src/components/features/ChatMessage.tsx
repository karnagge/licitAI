import type { Message } from '@shared/types/entities';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

/**
 * ChatMessage Component
 *
 * Displays a single message in the chat interface.
 * Supports user and assistant messages with different styling.
 *
 * Features:
 * - User vs assistant message styling
 * - Streaming indicator for AI responses
 * - Timestamp display
 * - Markdown-like formatting
 * - Avatar icons
 */
export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formattedTime = new Date(message.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
        `}
      >
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Message Content */}
      <div
        className={`
          flex-1 max-w-[75%]
          ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}
        `}
      >
        {/* Message Bubble */}
        <div
          className={`
            rounded-lg px-4 py-3 text-sm
            ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            }
          `}
        >
          {/* Content with whitespace preserved */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block ml-1 animate-pulse">▊</span>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`
            text-xs text-gray-500 mt-1 px-1
            ${isUser ? 'text-right' : 'text-left'}
          `}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

/**
 * User Icon
 */
function UserIcon() {
  return (
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

/**
 * Bot/Assistant Icon
 */
function BotIcon() {
  return (
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
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}
