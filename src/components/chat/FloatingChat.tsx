import { Card, CardContent, CardFooter } from '@/components/common/card';
import ChatInput from '@/components/chat/ChatInput';
import ChatTurn from '@/components/chat/ChatTurn';
import NavBar from '@/components/chat/NavBar';
import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { cn } from '@/lib/utils';
import { mockChatResponse } from '@/mocks/chat';
import type { ChatTurnData } from '@/types/chat.types';
import { useEffect, useState } from 'react';
import {
  MessageScrollerProvider,
  MessageScrollerContent,
  MessageScrollerViewport,
  MessageScroller,
  MessageScrollerItem,
  useMessageScroller,
} from '@/components/common/message-scroller';

type FloatingChatProps = {
  onClose: () => void;
};

type ChatView = 'recommendations' | 'chat';

export default function FloatingChat({ onClose }: FloatingChatProps) {
  return (
    <MessageScrollerProvider autoScroll>
      <FloatingChatContent onClose={onClose} />
    </MessageScrollerProvider>
  );
}

function FloatingChatContent({ onClose }: FloatingChatProps) {
  const [view, setView] = useState<ChatView>('recommendations');
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurnData[]>([]);
  const { scrollToEnd } = useMessageScroller();

  useEffect(() => {
    if (chatTurns.length === 0) return;
    scrollToEnd({ behavior: 'smooth' });
  }, [chatTurns.length, scrollToEnd]);

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

      <MessageScroller className="flex-1">
        <MessageScrollerViewport className="flex flex-col scroll-smooth">
          <CardContent
            className={cn(
              'flex min-h-full flex-none flex-col overflow-visible',
              view === 'recommendations' && !isRecommendationExpanded && 'justify-end',
              isRecommendationExpanded && 'px-6',
            )}
          >
            <MessageScrollerContent>
              {view === 'recommendations' && (
                <MessageScrollerItem messageId="recommendations">
                  <RecommendedQuestionSection
                    onQuestionSelect={handleSubmit}
                    isExpanded={isRecommendationExpanded}
                    onExpand={() => setIsRecommendationExpanded(true)}
                  />
                </MessageScrollerItem>
              )}

              {view === 'chat' &&
                chatTurns.map((turn, index) => (
                  <MessageScrollerItem
                    key={`${turn.response.ragRunId}-${index}`}
                    messageId={`turn-${turn.response.ragRunId}-${index}`}
                  >
                    <ChatTurn question={turn.question} response={turn.response} />
                  </MessageScrollerItem>
                ))}
            </MessageScrollerContent>
          </CardContent>
        </MessageScrollerViewport>
      </MessageScroller>

      <CardFooter>
        <ChatInput onSubmit={handleSubmit} />
      </CardFooter>
    </Card>
  );
}
