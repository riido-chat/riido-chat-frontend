import type {
  ChatRequest,
  ChatResponse,
  ErrorChatResponse,
  FeedbackRating,
  FeedbackResponse,
} from '@/types/chat.types';

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
      retryable: false,
    },
    citations: [],
  };
}

// 답변 평가 등록 및 변경. 같은 값 재전송은 서버에서 멱등 처리된다.
export async function putFeedback(
  ragRunId: string,
  rating: FeedbackRating,
  signal?: AbortSignal,
): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${ragRunId}/feedback`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Feedback request failed');
  }

  return response.json();
}

// 답변 평가 해제. 평가가 없는 상태에서 호출해도 동일 응답(멱등)을 받는다.
export async function deleteFeedback(
  ragRunId: string,
  signal?: AbortSignal,
): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${ragRunId}/feedback`, {
    method: 'DELETE',
    signal,
  });

  if (!response.ok) {
    throw new Error('Feedback request failed');
  }

  return response.json();
}
