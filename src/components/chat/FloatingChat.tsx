import { Card, CardContent, CardFooter } from '@/components/common/card';
import ChatInput from '@/components/chat/ChatInput';
import ChatTurn from '@/components/chat/ChatTurn';
import NavBar from '@/components/chat/NavBar';
import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { cn } from '@/lib/utils';
import { mockChatResponse } from '@/mocks/chat';
import type { ChatTurnData } from '@/types/chat.types';
import { useState } from 'react';

type FloatingChatProps = {
  onClose: () => void;
};

type ChatView = 'recommendations' | 'chat';

export default function FloatingChat({ onClose }: FloatingChatProps) {
  const [view, setView] = useState<ChatView>('recommendations');
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurnData[]>([]);

  const handleSubmit = (question: string) => {
    const response = mockChatResponse;

    if (conversationId === null) {
      setConversationId(response.conversationId);
    }

    setChatTurns((currentTurns) => [...currentTurns, { question, response }]);
    setView('chat');
  };

  const handleBack = () => {
    if (view === 'recommendations' && isRecommendationExpanded) {
      setIsRecommendationExpanded(false);
      return;
    }

    setConversationId(null);
    setChatTurns([]);
    setIsRecommendationExpanded(false);
    setView('recommendations');
  };
  const isChatView = view === 'chat';
  const isBackButtonVisible = isChatView || isRecommendationExpanded;

  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)]">
      <NavBar onBack={isBackButtonVisible ? handleBack : undefined} onClose={onClose}>
        뤼이도 RAG 챗봇
      </NavBar>
      <CardContent className={cn('flex flex-col', isRecommendationExpanded && 'px-6')}>
        {view === 'recommendations' && (
          <RecommendedQuestionSection
            onQuestionSelect={handleSubmit}
            isExpanded={isRecommendationExpanded}
            onExpand={() => setIsRecommendationExpanded(true)}
          />
        )}
        {view === 'chat' && (
          <div className="flex flex-col gap-4">
            {chatTurns.map((turn, index) => (
              <ChatTurn
                key={`${turn.response.ragRunId}-${index}`}
                question={turn.question}
                response={turn.response}
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
