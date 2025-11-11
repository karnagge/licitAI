import api from './api';
import type { Chat, Message } from '../../../shared/types/entities';

/**
 * Chat API Service
 * Handles all chat and message-related API calls
 */

export interface CreateChatDto {
  projectId: string;
  title?: string;
}

export interface CreateMessageDto {
  chatId: string;
  content: string;
}

/**
 * Create a new chat for a project
 */
export async function createChat(data: CreateChatDto): Promise<Chat> {
  const response = await api.post<Chat>('/chats', data);
  return response.data;
}

/**
 * Get all chats for a project
 */
export async function getChatsByProject(projectId: string): Promise<Chat[]> {
  const response = await api.get<Chat[]>('/chats', {
    params: { projectId },
  });
  return response.data;
}

/**
 * Get a single chat with its messages
 */
export async function getChatById(id: string): Promise<Chat & { messages: Message[] }> {
  const response = await api.get<Chat & { messages: Message[] }>(`/chats/${id}`);
  return response.data;
}

/**
 * Send a message in a chat
 */
export async function sendMessage(data: CreateMessageDto): Promise<Message> {
  const response = await api.post<Message>('/messages', data);
  return response.data;
}

/**
 * Get all messages for a chat
 */
export async function getMessagesByChat(chatId: string): Promise<Message[]> {
  const response = await api.get<Message[]>('/messages', {
    params: { chatId },
  });
  return response.data;
}

/**
 * Stream AI response using Server-Sent Events
 * Returns an EventSource for real-time message streaming
 */
export function streamMessage(chatId: string, content: string): EventSource {
  const token = localStorage.getItem('accessToken');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

  // Create SSE connection with message data
  const url = new URL(`${baseUrl}/messages/stream`, window.location.origin);
  url.searchParams.set('chatId', chatId);
  url.searchParams.set('content', encodeURIComponent(content));
  url.searchParams.set('token', token || '');

  const eventSource = new EventSource(url.toString());

  return eventSource;
}

export const chatService = {
  createChat,
  getChatsByProject,
  getChatById,
  sendMessage,
  getMessagesByChat,
  streamMessage,
};

export default chatService;
