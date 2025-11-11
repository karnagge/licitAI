import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * ChatInput Component
 *
 * Text input for sending messages in chat.
 * Supports multiline input with auto-resize.
 *
 * Features:
 * - Auto-expanding textarea
 * - Send on Enter (Shift+Enter for new line)
 * - Character counter
 * - Disabled state while AI is processing
 * - Send button with icon
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 4000;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3 items-end">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            maxLength={maxLength}
            className="
              w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              resize-none overflow-y-auto
              text-sm
            "
            style={{ maxHeight: '150px' }}
          />

          {/* Character Counter */}
          {message.length > maxLength * 0.8 && (
            <div
              className={`
                absolute bottom-2 right-2 text-xs
                ${message.length >= maxLength ? 'text-red-600' : 'text-gray-500'}
              `}
            >
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          variant="primary"
          size="md"
          className="flex-shrink-0"
        >
          <SendIcon />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        Pressione <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> para
        enviar, <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Enter</kbd>{' '}
        para nova linha
      </div>
    </form>
  );
}

/**
 * Send Icon
 */
function SendIcon() {
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
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  );
}
