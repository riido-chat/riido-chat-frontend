export type Citation = {
  citationNumber: number;
  documentTitle: string;
  sectionPath: string[];
  sourceUrl: string;
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

export type ChatTurnData = {
  question: string;
  response: CompletedChatResponse;
};
