import { Card, CardContent, CardFooter } from '@/components/common/card';
import ChatInput from '@/components/chat/ChatInput';
import ChatTurn from '@/components/chat/ChatTurn';
import NavBar from '@/components/chat/NavBar';
import RecommendedQuestionSection from '@/components/chat/RecommendedQuestionSection';
import { cn } from '@/lib/utils';
import { createClientErrorChatResponse, postChat } from '@/api/chat';
import type { ChatTurnData, FeedbackRating } from '@/types/chat.types';
import { useEffect, useRef, useState } from 'react';
import {
  MessageScrollerProvider,
  MessageScrollerContent,
  MessageScrollerViewport,
  MessageScroller,
  MessageScrollerItem,
  useMessageScroller,
} from '@/components/common/message-scroller';

type ChatView = 'home' | 'home-expanded' | 'chat';

export default function FloatingChat() {
  return (
    <MessageScrollerProvider autoScroll>
      <FloatingChatContent />
    </MessageScrollerProvider>
  );
}

function FloatingChatContent() {
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurnData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { scrollToEnd } = useMessageScroller();

  const view: ChatView =
    chatTurns.length > 0 ? 'chat' : isRecommendationExpanded ? 'home-expanded' : 'home';

  useEffect(() => {
    if (chatTurns.length === 0) return;
    scrollToEnd({ behavior: 'smooth' });
  }, [chatTurns.length, scrollToEnd]);

  const requestChat = async (turnId: string, question: string) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSubmitting(true);

    try {
      const response = await postChat({ question, conversationId }, controller.signal);

      // 서버가 식별자를 내려주지 않은 경우에는 진행 중인 대화 식별자를 유지한다.
      setConversationId((currentId) => response.conversationId ?? currentId);
      setChatTurns((currentTurns) =>
        currentTurns.map((turn) => (turn.id === turnId ? { ...turn, response } : turn)),
      );
    } catch {
      // 중단 버튼이나 대화 종료로 멈춘 요청은 답을 받을 수 없으므로 중단 안내 버블로 전환한다.
      if (controller.signal.aborted) {
        setChatTurns((currentTurns) =>
          currentTurns.map((turn) =>
            turn.id === turnId ? { ...turn, response: { status: 'ABORTED' } } : turn,
          ),
        );
        return;
      }
      setChatTurns((currentTurns) =>
        currentTurns.map((turn) =>
          turn.id === turnId ? { ...turn, response: createClientErrorChatResponse() } : turn,
        ),
      );
    } finally {
      setIsSubmitting(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSubmit = async (question: string) => {
    if (isSubmitting) return;

    const turnId = crypto.randomUUID();
    setChatTurns((currentTurns) => [
      ...currentTurns,
      { id: turnId, question, response: null, rating: null },
    ]);

    await requestChat(turnId, question);
  };

  const handleRetry = async (turnId: string, question: string) => {
    if (isSubmitting) return;

    setChatTurns((currentTurns) =>
      currentTurns.map((turn) => (turn.id === turnId ? { ...turn, response: null } : turn)),
    );
    // 턴 개수가 유지되어 자동스크롤 X -> ScrollToEnd 추가
    scrollToEnd({ behavior: 'smooth' });

    await requestChat(turnId, question);
  };

  const handleStopResponse = () => {
    abortControllerRef.current?.abort();
  };

  const handleRatingChange = (turnId: string, rating: FeedbackRating | null) => {
    setChatTurns((currentTurns) =>
      currentTurns.map((turn) => (turn.id === turnId ? { ...turn, rating } : turn)),
    );
  };

  // 진행 중인 요청을 중단하고 대화 세션을 폐기한 뒤 홈 화면으로 돌아간다.
  const handleEndChat = () => {
    abortControllerRef.current?.abort();
    setChatTurns([]);
    setConversationId(null);
    setIsRecommendationExpanded(false);
  };

  const handleGoHome = () => {
    setIsRecommendationExpanded(false);
  };

  return (
    <Card
      ref={chatContainerRef}
      className="h-200 max-h-[calc(100dvh-6rem)] w-md max-w-[calc(100vw-3rem)]"
    >
      <NavBar
        onGoHome={view === 'home-expanded' ? handleGoHome : undefined}
        onEndChat={view === 'chat' ? handleEndChat : undefined}
        dialogContainer={chatContainerRef}
      >
        뤼이도 RAG 챗봇
      </NavBar>

      <MessageScroller className="flex-1">
        <MessageScrollerViewport className="flex flex-col scroll-smooth">
          <CardContent
            className={cn(
              'flex min-h-full flex-none flex-col overflow-visible',
              view === 'home' && 'justify-end',
              view !== 'home' && 'px-6',
            )}
          >
            <MessageScrollerContent>
              {view !== 'chat' && (
                <MessageScrollerItem
                  messageId="recommendations"
                  className={cn(view === 'home' && 'mt-auto')}
                >
                  <RecommendedQuestionSection
                    onQuestionSelect={handleSubmit}
                    isExpanded={isRecommendationExpanded}
                    onExpand={() => setIsRecommendationExpanded(true)}
                  />
                </MessageScrollerItem>
              )}

              {chatTurns.map((turn, index) => (
                <MessageScrollerItem key={turn.id} messageId={`turn-${turn.id}`}>
                  <ChatTurn
                    turn={turn}
                    onRatingChange={(rating) => handleRatingChange(turn.id, rating)}
                    // 마지막 턴이 아닌 질문을 재시도하면 서버가 인식하는 대화 순서가 어긋나므로,
                    // 재시도는 마지막 턴에서만 허용한다.
                    onRetry={
                      index === chatTurns.length - 1
                        ? () => handleRetry(turn.id, turn.question)
                        : undefined
                    }
                  />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </CardContent>
        </MessageScrollerViewport>
      </MessageScroller>

      <CardFooter>
        <ChatInput
          onSubmit={handleSubmit}
          onStop={handleStopResponse}
          isSubmitting={isSubmitting}
        />
      </CardFooter>
    </Card>
  );
}
