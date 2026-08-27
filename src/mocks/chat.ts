import type { CompletedChatResponse } from '@/types/chat.types';

export const mockChatResponse: CompletedChatResponse = {
  status: 'COMPLETED',
  conversationId: '6b401388-b1ca-410a-9430-dd9beee85460',
  ragRunId: 'd49dc6fb-25f1-4782-a1db-659fe1c55892',
  answer: {
    answerMarkdown:
      '진행하기로 결정한 작업은 **승인** 버튼을 클릭해 백로그나 작업으로 전환할 수 있습니다. [1]',
  },
  citations: [
    {
      citationNumber: 1,
      documentTitle: '계획: 대기 작업',
      sectionPath: ['작업 처리'],
      sourceUrl: 'https://docs.riido.io/issues/intake.md',
    },
  ],
};
