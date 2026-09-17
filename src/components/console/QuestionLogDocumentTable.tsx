import { Link, useNavigate } from 'react-router';

import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { EMPTY_VALUE } from '@/lib/console';
import type { QuestionLogDocument } from '@/types/console.types';

const getDetailPath = (documentId: number) => `/question-logs/documents/${documentId}`;

/**
 * 질문 로그의 문서 목록 표. 대시보드 미리보기와 문서 목록 화면이 같은 네 열을 쓴다.
 * 문서명 열만 남는 폭을 차지하고 수치 세 열은 고정 폭이며, 비어 있으면 표기 규칙대로 하이픈 한 줄만 보인다.
 * 행은 항상 클릭할 수 있고 문서 상세로 이동한다.
 */
export default function QuestionLogDocumentTable({ items }: { items: QuestionLogDocument[] }) {
  const navigate = useNavigate();

  return (
    <ConsoleTable containerClassName="rounded-xl">
      <colgroup>
        <col />
        <col className="w-37.5" />
        <col className="w-37.5" />
        <col className="w-40.5" />
      </colgroup>
      <thead>
        <tr>
          <ConsoleTableHead>문서명</ConsoleTableHead>
          <ConsoleTableHead>질문 수</ConsoleTableHead>
          <ConsoleTableHead>보류 수</ConsoleTableHead>
          <ConsoleTableHead>세부 문제 개수</ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {items.length === 0 ? (
          <tr>
            <ConsoleTableCell colSpan={4} className="text-label-assistive">
              {EMPTY_VALUE}
            </ConsoleTableCell>
          </tr>
        ) : (
          items.map((document) => (
            <tr
              key={document.documentId}
              onClick={() => navigate(getDetailPath(document.documentId))}
              className="hover:bg-rc-gray-50 cursor-pointer transition-colors"
            >
              <ConsoleTableCell className="truncate">
                <Link
                  to={getDetailPath(document.documentId)}
                  title={document.documentTitle}
                  onClick={(event) => event.stopPropagation()}
                  className="focus-visible:ring-button-primary-enabled rounded-sm outline-none focus-visible:ring-2"
                >
                  {document.documentTitle}
                </Link>
              </ConsoleTableCell>
              <ConsoleTableCell>{document.questionCount}</ConsoleTableCell>
              <ConsoleTableCell>{document.withheldCount}</ConsoleTableCell>
              {/* 세부 문제가 없어도 없음 같은 문구 대신 0개로 적는다. */}
              <ConsoleTableCell className="text-label-assistive">
                {document.subproblemCount}개
              </ConsoleTableCell>
            </tr>
          ))
        )}
      </ConsoleTableBody>
    </ConsoleTable>
  );
}
