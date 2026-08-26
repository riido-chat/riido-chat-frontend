import { Card, CardContent, CardFooter } from '@/components/common/card';
import NavBar from '@/components/chat/NavBar';
import ChatInput from '@/components/chat/ChatInput';
import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { useState } from 'react';

type FloatingChatProps = {
  onClose: () => void;
};

type ChatView = 'recommendations' | 'chat';

export default function FloatingChat({ onClose }: FloatingChatProps) {
  const [view, setView] = useState<ChatView>('recommendations');

  const handleSubmit = (message: string) => {
    console.log(message);
    setView('chat');
  };

  const handleBack = () => setView('recommendations');
  const isChatView = view === 'chat';

  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)]">
      <NavBar onBack={isChatView ? handleBack : undefined} onClose={onClose}>
        뤼이도 RAG 챗봇
      </NavBar>
      <CardContent className="flex flex-col">
        {view === 'recommendations' && (
          <RecommendedQuestionSection onQuestionSelect={handleSubmit} />
        )}
      </CardContent>
      <CardFooter>
        <ChatInput onSubmit={handleSubmit} />
      </CardFooter>
    </Card>
  );
}
