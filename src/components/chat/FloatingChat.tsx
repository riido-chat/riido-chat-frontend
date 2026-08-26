import { Card, CardContent, CardFooter } from '@/components/common/card';
import ChatInput from '@/components/chat/ChatInput';
import ChatTurn from '@/components/chat/ChatTurn';
import NavBar from '@/components/chat/NavBar';
import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { mockChatResponse } from '@/mocks/chat';
import { useState } from 'react';

type FloatingChatProps = {
  onClose: () => void;
};

type ChatView = 'recommendations' | 'chat';

type ChatTurnData = {
  id: number;
  question: string;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  const [view, setView] = useState<ChatView>('recommendations');
  const [chatTurns, setChatTurns] = useState<ChatTurnData[]>([]);

  const handleSubmit = (question: string) => {
    setChatTurns((currentTurns) => [...currentTurns, { id: currentTurns.length, question }]);
    setView('chat');
  };

  const handleBack = () => {
    setChatTurns([]);
    setView('recommendations');
  };
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
        {view === 'chat' && (
          <div className="flex flex-col gap-4">
            {chatTurns.map((turn) => (
              <ChatTurn
                key={turn.id}
                question={turn.question}
                answerMarkdown={mockChatResponse.answer.answerMarkdown}
                citations={mockChatResponse.citations}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <ChatInput onSubmit={handleSubmit} />
      </CardFooter>
    </Card>
  );
}
