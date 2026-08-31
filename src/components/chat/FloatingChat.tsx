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

type ChatView = 'recommendations' | 'chat';

export default function FloatingChat() {
  return (
    <MessageScrollerProvider autoScroll>
      <FloatingChatContent />
    </MessageScrollerProvider>
  );
}

function FloatingChatContent() {
  const [view, setView] = useState<ChatView>('recommendations');
  const [isRecommendationExpanded, setIsRecommendationExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurnData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { scrollToEnd } = useMessageScroller();

  useEffect(() => {
    if (chatTurns.length === 0) return;
    scrollToEnd({ behavior: 'smooth' });
  }, [chatTurns.length, scrollToEnd]);

  const handleSubmit = async (question: string) => {
    if (isSubmitting) return;

    const turnId = crypto.randomUUID();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 홈에서 보낸 질문(직접 입력, 추천 질문 선택)은 이전 세션을 폐기하고 새 대화를 시작한다.
    // 이전 대화를 이어가려면 NavBar의 채팅 버튼으로 채팅 화면에 들어와서 보내야 한다.
    const isNewConversation = view === 'recommendations';
    const requestConversationId = isNewConversation ? null : conversationId;

    if (isNewConversation) {
      setConversationId(null);
      setChatTurns([{ id: turnId, question, response: null, rating: null }]);
    } else {
      setChatTurns((currentTurns) => [
        ...currentTurns,
        { id: turnId, question, response: null, rating: null },
      ]);
    }
    setView('chat');
    setIsSubmitting(true);

    try {
      const response = await postChat(
        { question, conversationId: requestConversationId },
        controller.signal,
      );

      // 서버가 식별자를 내려주지 않은 경우에는 진행 중인 대화 식별자를 유지한다.
      if (response.status !== 'ERROR') {
        setConversationId((currentId) => response.conversationId ?? currentId);
      }
      setChatTurns((currentTurns) =>
        currentTurns.map((turn) => (turn.id === turnId ? { ...turn, response } : turn)),
      );
    } catch {
      // 중단 버튼이나 홈 이동으로 멈춘 요청은 답을 받을 수 없으므로,
      // 질문 턴을 유지한 채 중단 안내 버블로 전환한다.
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
    }
  };

  const handleStopResponse = () => {
    abortControllerRef.current?.abort();
  };

  const handleRatingChange = (turnId: string, rating: FeedbackRating | null) => {
    setChatTurns((currentTurns) =>
      currentTurns.map((turn) => (turn.id === turnId ? { ...turn, rating } : turn)),
    );
  };

  // 진행 중인 요청만 중단하고, 대화 세션(대화 내용과 식별자)은 유지한다.
  const handleGoHome = () => {
    if (view === 'recommendations' && isRecommendationExpanded) {
      setIsRecommendationExpanded(false);
      return;
    }

    abortControllerRef.current?.abort();
    setIsRecommendationExpanded(false);
    setView('recommendations');
  };

  // 이전 세션이 남아 있으면 이어서 보여 주고, 없으면 빈 채팅창이 된다.
  const handleGoChat = () => {
    setView('chat');
  };

  const isChatView = view === 'chat';
  // 현재 보고 있는 화면으로 이동하는 버튼은 표시하지 않는다.
  const isHomeButtonVisible = isChatView || isRecommendationExpanded;
  const isChatButtonVisible = !isChatView;

  return (
    <Card className="h-200 max-h-[calc(100dvh-6rem)] w-md max-w-[calc(100vw-3rem)]">
      <NavBar
        onGoHome={isHomeButtonVisible ? handleGoHome : undefined}
        onGoChat={isChatButtonVisible ? handleGoChat : undefined}
      >
        뤼이도 RAG 챗봇
      </NavBar>

      <MessageScroller className="flex-1">
        <MessageScrollerViewport className="flex flex-col scroll-smooth">
          <CardContent
            className={cn(
              'flex min-h-full flex-none flex-col overflow-visible',
              view === 'recommendations' && !isRecommendationExpanded && 'justify-end',
              view === 'chat' && 'px-6',
              isRecommendationExpanded && 'px-6',
            )}
          >
            <MessageScrollerContent>
              {view === 'recommendations' && (
                <MessageScrollerItem
                  messageId="recommendations"
                  className={cn(!isRecommendationExpanded && 'mt-auto')}
                >
                  <RecommendedQuestionSection
                    onQuestionSelect={handleSubmit}
                    isExpanded={isRecommendationExpanded}
                    onExpand={() => setIsRecommendationExpanded(true)}
                  />
                </MessageScrollerItem>
              )}

              {view === 'chat' &&
                chatTurns.map((turn) => (
                  <MessageScrollerItem key={turn.id} messageId={`turn-${turn.id}`}>
                    <ChatTurn
                      turn={turn}
                      onRatingChange={(rating) => handleRatingChange(turn.id, rating)}
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
