import type { ChatRequest, ChatResponse, ErrorChatResponse } from '@/types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const DEFAULT_ERROR_MESSAGE = '답변을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

export class ChatApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null = null, message: string = DEFAULT_ERROR_MESSAGE) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
    this.code = code;
  }
}

export async function postChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data: ChatResponse | null = await response.json().catch(() => null);

  if (!response.ok) {
    // 404·500·503은 ERROR 형태의 body를 내려주므로 서버 메시지를 그대로 전달한다.
    if (data?.status === 'ERROR') {
      throw new ChatApiError(response.status, data.error.code, data.error.message);
    }
    throw new ChatApiError(response.status);
  }

  if (data === null) {
    throw new ChatApiError(response.status);
  }

  return data;
}

export function toErrorChatResponse(error: unknown): ErrorChatResponse {
  const isChatApiError = error instanceof ChatApiError;

  return {
    status: 'ERROR',
    conversationId: null,
    ragRunId: null,
    answer: null,
    error: {
      code: isChatApiError ? (error.code ?? 'HTTP_ERROR') : 'NETWORK_ERROR',
      message: isChatApiError ? error.message : DEFAULT_ERROR_MESSAGE,
    },
    citations: [],
  };
}
