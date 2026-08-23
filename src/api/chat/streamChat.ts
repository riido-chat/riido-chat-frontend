import { API_URL } from '@/api/config';
import type { ChatRequest, ChatSseEvent } from './chat.types';

type StreamChatOptions = {
  signal?: AbortSignal;
  onEvent: (event: ChatSseEvent) => void;
};

export async function streamChat(request: ChatRequest, { signal, onEvent }: StreamChatOptions) {
  const response = await fetch(`${API_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message ?? '질문 요청 중 문제가 발생했습니다.');
  }

  if (!response.body) {
    throw new Error('응답 스트림이 존재하지 않습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    // \r\n 기반 SSE도 \n 형태로 통일
    buffer = buffer.replace(/\r\n/g, '\n');

    let boundaryIndex = buffer.indexOf('\n\n');

    while (boundaryIndex !== -1) {
      const rawEvent = buffer.slice(0, boundaryIndex);

      buffer = buffer.slice(boundaryIndex + 2);

      const parsedEvent = parseSseEvent(rawEvent);

      if (parsedEvent) {
        onEvent(parsedEvent);
      }

      boundaryIndex = buffer.indexOf('\n\n');
    }
  }
}

function parseSseEvent(rawEvent: string): ChatSseEvent | null {
  const lines = rawEvent.split('\n');

  let eventName = '';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!eventName || dataLines.length === 0) {
    return null;
  }

  const data = JSON.parse(dataLines.join('\n'));

  switch (eventName) {
    case 'answer.delta':
    case 'citation.ready':
    case 'answer.withheld':
    case 'error':
    case 'done':
      return {
        type: eventName,
        data,
      } as ChatSseEvent;

    default:
      return null;
  }
}
