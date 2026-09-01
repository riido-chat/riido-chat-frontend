export type Citation = {
  citationNumber: number;
  documentTitle: string;
  sectionPath: string[];
  sourceUrl: string;
};

export type ChatRequest = {
  question: string;
  conversationId: string | null;
};

export type CompletedChatResponse = {
  status: 'COMPLETED';
  conversationId: string;
  ragRunId: string;
  answer: {
    answerMarkdown: string;
  };
  citations: Citation[];
};

export type WithheldReasonCode =
  'INSUFFICIENT_EVIDENCE' | 'AMBIGUOUS_QUESTION' | 'OUT_OF_SCOPE' | 'UNVERIFIABLE_ANSWER';

export type WithheldChatResponse = {
  status: 'WITHHELD';
  conversationId: string;
  ragRunId: string;
  answer: null;
  withheld: {
    reasonCode: WithheldReasonCode;
    message: string;
  };
  citations: Citation[];
};

export type ErrorChatResponse = {
  status: 'ERROR';
  conversationId: string | null;
  ragRunId: string | null;
  answer: null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
  citations: Citation[];
};

export type ChatResponse = CompletedChatResponse | WithheldChatResponse | ErrorChatResponse;

// 사용자가 중단 버튼으로 답변 생성을 멈췄을 때 클라이언트에서만 생성되는 응답
export type AbortedChatResponse = {
  status: 'ABORTED';
};

// 채팅 턴에 표시할 수 있는 응답: 서버 응답에 클라이언트 전용 중단 상태를 더한 것
export type ChatTurnResponse = ChatResponse | AbortedChatResponse;

export type ChatTurnData = {
  id: string;
  question: string;
  response: ChatTurnResponse | null; // null이면 응답 대기 중
  rating: FeedbackRating | null;
};

export type FeedbackRating = 'GOOD' | 'BAD';

export type FeedbackResponse = {
  ragRunId: string;
  rating: FeedbackRating | null;
};
