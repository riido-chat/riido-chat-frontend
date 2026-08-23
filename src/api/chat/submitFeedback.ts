import { API_URL } from '@/api/config';

export type FeedbackRating = 'HELPFUL' | 'NOT_HELPFUL';

export async function submitFeedback(ragRunId: string, rating: FeedbackRating) {
  const response = await fetch(`${API_URL}/api/v1/chat/${ragRunId}/feedback`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rating,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message ?? '피드백 등록 중 문제가 발생했습니다.');
  }

  return response.json() as Promise<{
    ragRunId: string;
    rating: FeedbackRating;
  }>;
}
