import { useEffect, useRef, useState } from 'react';
import { useMessages, useStreamingMessage } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentStatusIndicator, TypingIndicator } from './AgentStatusIndicator';
import type { Message } from '../../../../shared/types/entities';

interface ChatInterfaceProps {
  chatId: string;
}

/**
 * ChatInterface Component
 *
 * Complete chat interface organism combining messages, input, and agent status.
 * Handles real-time SSE streaming from AI agents.
 *
 * Features:
 * - Message history display
 * - Real-time SSE streaming
 * - Agent status indicators
 * - Typing indicators
 * - Auto-scroll to latest message
 * - Loading and error states
 */
export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { data: messages, isLoading, error } = useMessages(chatId);
  const {
    sendStreamingMessage,
    isStreaming,
    streamingMessage,
    agentStatus,
    error: streamError,
  } = useStreamingMessage(chatId);

  const [tempStreamingMsg, setTempStreamingMsg] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage, tempStreamingMsg]);

  // Update temp streaming message as content arrives
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      setTempStreamingMsg({
        id: 'streaming',
        chatId,
        content: streamingMessage,
        role: 'assistant',
        tenantId: '',
        createdAt: new Date(),
      });
    } else if (!isStreaming) {
      setTempStreamingMsg(null);
    }
  }, [isStreaming, streamingMessage, chatId]);

  const handleSendMessage = (content: string) => {
    // Add user message to display immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      content,
      role: 'user',
      tenantId: '',
      createdAt: new Date(),
    };

    // Start streaming AI response
    sendStreamingMessage(content, {
      onComplete: () => {
        // Messages will be refetched automatically
      },
      onError: (error) => {
        console.error('Streaming error:', error);
      },
    });
  };

  // Combine real messages with temp streaming message
  const allMessages = [
    ...(messages || []),
    ...(tempStreamingMsg ? [tempStreamingMsg] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando mensagens...</p>
          </div>
        )}

        {/* Error State */}
        {(error || streamError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">
              {error ? 'Erro ao carregar mensagens' : streamError}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && allMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comece uma conversa
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Descreva o que você precisa para seu documento de licitação. A IA irá
              ajudá-lo a gerar um documento completo e em conformidade.
            </p>
          </div>
        )}

        {/* Messages */}
        {!isLoading && allMessages.length > 0 && (
          <>
            {allMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.id === 'streaming' && isStreaming}
              />
            ))}

            {/* Agent Status Indicator */}
            {isStreaming && agentStatus.agent && (
              <div className="flex justify-start">
                <AgentStatusIndicator
                  agent={agentStatus.agent}
                  status={agentStatus.status}
                  message={agentStatus.message}
                  isVisible={true}
                />
              </div>
            )}

            {/* Typing Indicator (when no agent status) */}
            {isStreaming && !agentStatus.agent && !streamingMessage && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        placeholder={
          isStreaming
            ? 'Aguardando resposta da IA...'
            : 'Descreva o que você precisa...'
        }
      />
    </div>
  );
}
