import type { DocumentGroupDetail, DocumentGroupSummary } from '@/types/console.types';

export const documentGroupDetails: DocumentGroupDetail[] = [
  {
    group: {
      groupId: 1,
      groupKey: 'HELP_CHATBOT',
      name: '도움말 챗봇 이용가이드',
      consumerKey: 'HELP_CHATBOT',
    },
    sources: [
      {
        groupSourceId: 1,
        provider: 'GITBOOK',
        rootUrl: 'https://docs.riido.io',
        enabled: true,
        documentCount: 1,
      },
    ],
    summary: {
      activeIndexVersion: { indexVersionId: 57, versionNo: 12 },
      pendingCount: 2,
      searchStatus: 'REINDEX_REQUIRED',
    },
    documents: [
      {
        documentId: 101,
        documentKey: 'upload/이용가이드',
        title: '이용가이드',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 4,
        appliedVersionNo: 3,
        appliedStatus: 'UNAPPLIED',
      },
      {
        documentId: 102,
        documentKey: 'upload/자주-묻는-질문',
        title: '자주 묻는 질문',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 2,
        appliedVersionNo: 2,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 7,
        documentKey: 'policies/service-policy',
        title: '서비스 정책 안내',
        sourceType: 'GITBOOK',
        groupSourceId: 1,
        documentVersionNo: 1,
        appliedVersionNo: 1,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 104,
        documentKey: 'upload/2026-상반기-릴리즈-노트',
        title: '2026년 상반기 기능 업데이트 및 릴리즈 노트 모음 (v1 개정판, 운영팀 검수 완료본)',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 4,
        appliedVersionNo: 3,
        appliedStatus: 'UNAPPLIED',
      },
    ],
    jobInProgress: false,
  },
  {
    group: {
      groupId: 2,
      groupKey: 'POLICY_CHATBOT',
      name: '서비스 정책 안내',
      consumerKey: 'POLICY_CHATBOT',
    },
    sources: [],
    summary: {
      activeIndexVersion: { indexVersionId: 41, versionNo: 8 },
      pendingCount: 0,
      searchStatus: 'UP_TO_DATE',
    },
    documents: [
      {
        documentId: 201,
        documentKey: 'upload/이용약관',
        title: '이용약관',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 3,
        appliedVersionNo: 3,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 202,
        documentKey: 'upload/개인정보-처리방침',
        title: '개인정보 처리방침',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 2,
        appliedVersionNo: 2,
        appliedStatus: 'APPLIED',
      },
      {
        documentId: 203,
        documentKey: 'upload/환불-및-취소-정책',
        title: '환불 및 취소 정책',
        sourceType: 'UPLOAD',
        groupSourceId: null,
        documentVersionNo: 1,
        appliedVersionNo: 1,
        appliedStatus: 'APPLIED',
      },
    ],
    jobInProgress: false,
  },
];

/**
 * 목록 조회는 별도의 API이지만, 목 데이터끼리 어긋나지 않도록 상세 목 데이터에서 만들어 낸다.
 * 상세의 문서 표에는 목록의 문서 수와 같은 기준으로 걸러진 문서만 들어 있다.
 */
export const documentGroups: DocumentGroupSummary[] = documentGroupDetails.map((detail) => ({
  ...detail.group,
  documentCount: detail.documents.length,
  activeIndexVersionNo: detail.summary.activeIndexVersion?.versionNo ?? null,
  searchStatus: detail.summary.searchStatus,
}));

// 주소 표시줄에서 받은 값은 문자열이므로 숫자로 바꾸어 문서 그룹을 찾는다.
export const findDocumentGroupDetail = (groupId: string | undefined) => {
  const parsedGroupId = Number(groupId);

  if (groupId === undefined || !Number.isInteger(parsedGroupId)) {
    return null;
  }

  return documentGroupDetails.find((detail) => detail.group.groupId === parsedGroupId) ?? null;
};
