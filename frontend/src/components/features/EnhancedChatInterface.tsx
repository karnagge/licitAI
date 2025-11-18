import { useEffect, useRef, useState } from 'react';
import { useMessages, useStreamingMessage } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentProgressTracker, AgentPhase } from './AgentProgressTracker';
import { AgentPhaseIndicator } from './AgentPhaseIndicator';
import type { Message } from '@shared/types/entities';

interface EnhancedChatInterfaceProps {
  chatId: string;
  showProgressTracker?: boolean;
}

/**
 * EnhancedChatInterface Component
 *
 * Advanced chat interface with detailed AI agent orchestration visibility.
 * Shows complete progress through all agent phases.
 *
 * Features:
 * - Message history display
 * - Real-time SSE streaming
 * - Detailed agent progress tracker
 * - Phase-by-phase visibility
 * - Inline agent indicators
 * - Auto-scroll to latest message
 * - Toggle progress tracker visibility
 */
export function EnhancedChatInterface({
  chatId,
  showProgressTracker = true,
}: EnhancedChatInterfaceProps) {
  const { data: messages, isLoading, error } = useMessages(chatId);
  const {
    sendStreamingMessage,
    isStreaming,
    streamingMessage,
    agentStatus,
    error: streamError,
  } = useStreamingMessage(chatId);

  const [tempStreamingMsg, setTempStreamingMsg] = useState<Message | null>(null);
  const [trackerVisible, setTrackerVisible] = useState(showProgressTracker);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage, tempStreamingMsg]);

  // Update temp streaming message
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
    sendStreamingMessage(content, {
      onComplete: () => {
        // Messages will be refetched automatically
      },
      onError: (error) => {
        console.error('Streaming error:', error);
      },
    });
  };

  const allMessages = [
    ...(messages || []),
    ...(tempStreamingMsg ? [tempStreamingMsg] : []),
  ];

  // Parse current agent phase from agentStatus
  const getCurrentPhase = (): AgentPhase | undefined => {
    const agent = agentStatus.agent?.toLowerCase();
    if (agent?.includes('research')) return 'researcher';
    if (agent?.includes('validat')) return 'validator';
    if (agent?.includes('writ')) return 'writer';
    if (agent?.includes('review')) return 'reviewer';
    return undefined;
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="flex h-full gap-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 rounded-lg overflow-hidden">
        {/* Header with Progress Toggle */}
        {isStreaming && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentPhase && (
                  <AgentPhaseIndicator phase={currentPhase} message={agentStatus.message} compact />
                )}
              </div>
              <button
                onClick={() => setTrackerVisible(!trackerVisible)}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {trackerVisible ? 'Ocultar detalhes' : 'Mostrar detalhes'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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

      {/* Progress Tracker Sidebar */}
      {trackerVisible && isStreaming && (
        <div className="w-80 flex-shrink-0">
          <AgentProgressTracker
            currentPhase={currentPhase}
            phaseMessage={agentStatus.message}
            isActive={isStreaming}
            onComplete={() => {
              console.log('All agent phases completed');
            }}
          />
        </div>
      )}
    </div>
  );
}
