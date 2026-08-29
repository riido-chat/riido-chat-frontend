import type { ChatRequest, ChatResponse, ErrorChatResponse } from '@/types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function postChat(request: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  const data: ChatResponse | null = await response.json().catch(() => null);

  if (data === null) {
    throw new Error('Chat response is invalid');
  }

  // 서버가 반환한 ERROR 응답(404, 422, 500, 503) 처리
  if (data.status === 'ERROR') {
    return data;
  }

  if (!response.ok) {
    throw new Error('Chat request failed');
  }

  return data;
}

// 클라이언트 측 오류 응답 생성
export function createClientErrorChatResponse(): ErrorChatResponse {
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
