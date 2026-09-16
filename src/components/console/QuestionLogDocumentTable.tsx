import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { EMPTY_VALUE } from '@/lib/console';
import type { QuestionLogDocument } from '@/types/console.types';

/**
 * 질문 로그의 문서 목록 표. 대시보드 미리보기와 문서 목록 화면이 같은 네 열을 쓴다.
 * 문서명 열만 남는 폭을 차지하고 수치 세 열은 고정 폭이며, 비어 있으면 표기 규칙대로 하이픈 한 줄만 보인다.
 */
export default function QuestionLogDocumentTable({ items }: { items: QuestionLogDocument[] }) {
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
            <tr key={document.documentId}>
              <ConsoleTableCell className="truncate" title={document.documentTitle}>
                {document.documentTitle}
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
