import { useRef, useState } from 'react';
import { streamChat } from '@/api/chat/streamChat';
import type { Citation } from '@/api/chat/chat.types';

export function useChat() {
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);

  const [conversationId, setConversationId] = useState<string>();

  const [ragRunId, setRagRunId] = useState<string>();

  const [isStreaming, setIsStreaming] = useState(false);

  const [withheldMessage, setWithheldMessage] = useState<string>();

  const [errorMessage, setErrorMessage] = useState<string>();

  const [retryable, setRetryable] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);

  const sendQuestion = async (question: string) => {
    setAnswer('');
    setCitations([]);
    setWithheldMessage(undefined);
    setErrorMessage(undefined);
    setRetryable(false);
    setIsStreaming(true);

    const controller = new AbortController();

    controllerRef.current = controller;

    try {
      await streamChat(
        {
          question,

          ...(conversationId && {
            conversationId,
          }),
        },
        {
          signal: controller.signal,

          onEvent: (event) => {
            switch (event.type) {
              case 'answer.delta':
                setAnswer((prev) => prev + event.data.delta);
                break;

              case 'citation.ready':
                setCitations(event.data.citations);
                break;

              case 'answer.withheld':
                setWithheldMessage(event.data.message);
                break;

              case 'error':
                setErrorMessage(event.data.message);
                setRetryable(event.data.retryable);
                break;

              case 'done':
                setConversationId(event.data.conversationId);
                setRagRunId(event.data.ragRunId);
                break;
            }
          },
        },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setIsStreaming(false);
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : '질문 요청 중 문제가 발생했습니다.');
    } finally {
      setIsStreaming(false);
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
  };

  return {
    answer,
    citations,
    conversationId,
    ragRunId,

    isStreaming,

    withheldMessage,
    errorMessage,
    retryable,

    sendQuestion,
    cancel,
  };
}
