import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createChat,
  getChatsByProject,
  getChatById,
  sendMessage,
  getMessagesByChat,
  streamMessage,
  type CreateChatDto,
  type CreateMessageDto,
} from '../services/chatService';
import type { Message } from '@shared/types/entities';

/**
 * Query keys for chats
 */
export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  listByProject: (projectId: string) =>
    [...chatKeys.lists(), { projectId }] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  messages: (chatId: string) => [...chatKeys.all, 'messages', chatId] as const,
};

/**
 * Hook to fetch chats by project
 */
export function useChatsByProject(projectId: string) {
  return useQuery({
    queryKey: chatKeys.listByProject(projectId),
    queryFn: () => getChatsByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single chat with messages
 */
export function useChat(chatId: string) {
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => getChatById(chatId),
    enabled: !!chatId,
  });
}

/**
 * Hook to fetch messages for a chat
 */
export function useMessages(chatId: string) {
  return useQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => getMessagesByChat(chatId),
    enabled: !!chatId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

/**
 * Hook to create a chat
 */
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      // Invalidate project chats list
      queryClient.invalidateQueries({
        queryKey: chatKeys.listByProject(newChat.projectId),
      });
    },
  });
}

/**
 * Hook to send a message (without streaming)
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      // Invalidate messages for this chat
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(message.chatId),
      });
    },
  });
}

/**
 * Hook to handle streaming AI responses with SSE
 *
 * @returns Object with streaming state and control functions
 *
 * @example
 * ```tsx
 * const { sendStreamingMessage, isStreaming, streamingMessage, error } = useStreamingMessage(chatId);
 *
 * const handleSend = (content: string) => {
 *   sendStreamingMessage(content, {
 *     onMessage: (chunk) => console.log('Chunk:', chunk),
 *     onComplete: (fullMessage) => console.log('Complete:', fullMessage),
 *     onError: (error) => console.error('Error:', error),
 *   });
 * };
 * ```
 */
export function useStreamingMessage(chatId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<{
    agent?: string;
    status?: string;
    message?: string;
  }>({});

  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendStreamingMessage = useCallback(
    (
      content: string,
      callbacks?: {
        onMessage?: (chunk: string) => void;
        onComplete?: (fullMessage: string) => void;
        onError?: (error: string) => void;
        onAgentStatus?: (status: { agent?: string; status?: string; message?: string }) => void;
      }
    ) => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);
      setAgentStatus({});

      const eventSource = streamMessage(chatId, content);
      eventSourceRef.current = eventSource;

      let accumulatedMessage = '';

      // Handle message chunks
      eventSource.addEventListener('message', (event) => {
        const chunk = event.data;
        accumulatedMessage += chunk;
        setStreamingMessage(accumulatedMessage);
        callbacks?.onMessage?.(chunk);
      });

      // Handle agent status updates
      eventSource.addEventListener('agent-status', (event) => {
        try {
          const status = JSON.parse(event.data);
          setAgentStatus(status);
          callbacks?.onAgentStatus?.(status);
        } catch (e) {
          console.error('Failed to parse agent status:', e);
        }
      });

      // Handle completion
      eventSource.addEventListener('complete', (event) => {
        setIsStreaming(false);
        eventSource.close();
        eventSourceRef.current = null;
        setAgentStatus({});

        // Invalidate messages to refetch from server
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(chatId),
        });

        callbacks?.onComplete?.(accumulatedMessage);
      });

      // Handle errors
      eventSource.onerror = (err) => {
        const errorMessage = 'Erro ao receber resposta da IA';
        setError(errorMessage);
        setIsStreaming(false);
        eventSource.close();
        eventSourceRef.current = null;
        setAgentStatus({});
        callbacks?.onError?.(errorMessage);
      };
    },
    [chatId, queryClient]
  );

  const cancelStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setAgentStatus({});
  }, []);

  return {
    sendStreamingMessage,
    cancelStreaming,
    isStreaming,
    streamingMessage,
    agentStatus,
    error,
  };
}
