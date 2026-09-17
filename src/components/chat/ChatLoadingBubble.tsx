import ChatBubble from '@/components/chat/ChatBubble';
import { useEffect, useState } from 'react';
import loadingSpinner from '@/assets/animations/loading-spinner.webp';

const LOADING_MESSAGES = ['관련 내용 확인 중...', '답변 생성 중...', '답변 정리 중...'];

export default function LoadingBubble() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % LOADING_MESSAGES.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <ChatBubble role="assistant">
      <div className="flex items-center gap-2">
        <img src={loadingSpinner} alt="" className="size-icon-md" />
        <p className="text-label-assistive text-body-2 animate-pulse font-semibold">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </ChatBubble>
  );
}
