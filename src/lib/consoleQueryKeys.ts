import type { QuestionLogQuery } from '@/types/console.types';

export const consoleQueryStaleTime = 2 * 60_000;

/** 콘솔 조회와 변경 후 갱신에서 같은 캐시 범위를 사용한다. */
export const consoleQueryKeys = {
  all: ['console'] as const,
  documentGroups: () => ['console', 'document-groups'] as const,
  documentGroup: (groupId: number) => ['console', 'document-groups', groupId] as const,
  questionLogs: () => ['console', 'question-logs'] as const,
  questionLogDashboard: () => ['console', 'question-logs', 'dashboard'] as const,
  questionLogDocuments: () => ['console', 'question-logs', 'documents'] as const,
  questionLogDocument: (documentId: number) =>
    ['console', 'question-logs', 'documents', documentId] as const,
  questionListSetup: () => ['console', 'question-logs', 'question-list-setup'] as const,
  questions: (groupId: number, query: QuestionLogQuery) =>
    ['console', 'question-logs', 'questions', groupId, query] as const,
};
