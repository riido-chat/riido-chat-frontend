import type { DocumentGroupDetail } from '@/types/console.types';

export const documentGroups: DocumentGroupDetail[] = [
  {
    id: 'help-chatbot-guide',
    name: '도움말 챗봇 이용가이드',
    description: 'HELP_CHATBOT 기능이 사용하는 문서 그룹',
    feature: 'HELP_CHATBOT',
    documentCount: 4,
    searchIndexStatus: 'REINDEX_REQUIRED',
    searchIndexVersion: 12,
    documents: [
      {
        id: 'doc-usage-guide',
        name: '이용가이드',
        documentVersion: 4,
        indexedVersion: 3,
        processStatus: 'READY',
      },
      {
        id: 'doc-faq',
        name: '자주 묻는 질문',
        documentVersion: 2,
        indexedVersion: 2,
        processStatus: 'READY',
      },
      {
        id: 'doc-service-policy',
        name: '서비스 정책 안내',
        documentVersion: 1,
        indexedVersion: 1,
        processStatus: 'READY',
      },
      {
        id: 'doc-release-note-2026h1',
        name: '2026년 상반기 기능 업데이트 및 릴리즈 노트 모음 (v1 개정판, 운영팀 검수 완료본)',
        documentVersion: 4,
        indexedVersion: 3,
        processStatus: 'READY',
      },
    ],
  },
  {
    id: 'service-policy-guide',
    name: '서비스 정책 안내',
    description: 'POLICY_CHATBOT 기능이 사용하는 문서 그룹',
    feature: 'POLICY_CHATBOT',
    documentCount: 3,
    searchIndexStatus: 'UP_TO_DATE',
    searchIndexVersion: 8,
    documents: [
      {
        id: 'doc-terms',
        name: '이용약관',
        documentVersion: 3,
        indexedVersion: 3,
        processStatus: 'READY',
      },
      {
        id: 'doc-privacy',
        name: '개인정보 처리방침',
        documentVersion: 2,
        indexedVersion: 2,
        processStatus: 'READY',
      },
      {
        id: 'doc-refund',
        name: '환불 및 취소 정책',
        documentVersion: 1,
        indexedVersion: 1,
        processStatus: 'READY',
      },
    ],
  },
];

export const findDocumentGroup = (groupId: string | undefined) =>
  documentGroups.find((group) => group.id === groupId) ?? null;
