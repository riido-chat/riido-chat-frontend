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
  };
  citations: Citation[];
};

export type ChatResponse = CompletedChatResponse | WithheldChatResponse | ErrorChatResponse;

export type ChatTurnData = {
  id: string;
  question: string;
  response: ChatResponse | null; // null이면 응답 대기 중
};
