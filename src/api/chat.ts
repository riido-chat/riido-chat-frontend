import type { ChatRequest, ChatResponse, ErrorChatResponse } from '@/types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function postChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data: ChatResponse | null = await response.json().catch(() => null);

  if (!response.ok && data?.status !== 'ERROR') {
    throw new Error('Chat request failed');
  }

  if (data === null) {
    throw new Error('Chat response is invalid');
  }

  return data;
}

export function toErrorChatResponse(): ErrorChatResponse {
  return {
    status: 'ERROR',
    conversationId: null,
    ragRunId: null,
    answer: null,
    error: {
      code: 'CLIENT_ERROR',
      message: '',
    },
    citations: [],
  };
}
