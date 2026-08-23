import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/card';
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import ReactMarkdown from 'react-markdown';
import { submitFeedback } from '@/api/chat/submitFeedback';
import { FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';

type FloatingChatProps = {
  onClose: () => void;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  const [question, setQuestion] = useState('');

  const {
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
  } = useChat();

  const handleSubmit = async () => {
    if (!question.trim()) return;

    await sendQuestion(question);

    setQuestion('');
  };

  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)] shadow-lg">
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center">
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="size-10 rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
        >
          {`<`}
        </button>

        <CardTitle className="text-center text-lg font-bold">Floating Chat</CardTitle>

        <span className="size-10" aria-hidden />
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <p>[answer]</p>
        <ReactMarkdown>{answer}</ReactMarkdown>

        <p>[citations]</p>
        <pre>{JSON.stringify(citations, null, 2)}</pre>

        <p>[conversationId] {conversationId ?? '-'}</p>
        <p>[ragRunId] {ragRunId ?? '-'}</p>
        <p>[streaming] {String(isStreaming)}</p>
        <p>[retryable] {String(retryable)}</p>

        <p>[withheldMessage] {withheldMessage ?? '-'}</p>
        <p>[errorMessage] {errorMessage ?? '-'}</p>

        <div className="flex items-center gap-2">
          <p>[Feedback]</p>
          <button
            onClick={async () => {
              if (!ragRunId) return;
              const result = await submitFeedback(ragRunId, 'HELPFUL');
              console.log('feedback:', result);
            }}
          >
            <FaRegThumbsUp />
          </button>
          <button
            onClick={async () => {
              if (!ragRunId) return;
              const result = await submitFeedback(ragRunId, 'NOT_HELPFUL');
              console.log('feedback:', result);
            }}
          >
            <FaRegThumbsDown />
          </button>
        </div>
      </CardContent>

      <CardFooter>
        <input
          placeholder="Type a message..."
          className="w-full border p-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {isStreaming ? (
          <button onClick={cancel}>취소</button>
        ) : (
          <button className="w-10" onClick={handleSubmit}>
            전송
          </button>
        )}
      </CardFooter>
    </Card>
  );
}
