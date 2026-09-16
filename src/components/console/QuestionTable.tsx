import {
  ConsoleTable,
  ConsoleTableBody,
  ConsoleTableCell,
  ConsoleTableHead,
} from '@/components/console/ConsoleTable';
import { AnswerStatusBadge } from '@/components/console/StatusBadge';
import { EMPTY_VALUE, formatAbsoluteTime, formatRelativeTime } from '@/lib/console';
import type { QuestionLogItem } from '@/types/console.types';

/**
 * 질문 목록 표. 대시보드 미리보기와 질문 목록 화면이 같은 다섯 열을 쓴다.
 * 질문 원문 열만 남는 폭을 차지하고 나머지는 고정 폭이며, 한 행에 상태 뱃지는 하나만 붙는다.
 * 비어 있으면 표기 규칙대로 하이픈 한 줄만 보인다.
 */
export default function QuestionTable({ items }: { items: QuestionLogItem[] }) {
  return (
    <ConsoleTable containerClassName="rounded-xl">
      <colgroup>
        <col />
        <col className="w-45" />
        <col className="w-45" />
        <col className="w-21" />
        <col className="w-40" />
      </colgroup>
      <thead>
        <tr>
          <ConsoleTableHead>질문 원문</ConsoleTableHead>
          <ConsoleTableHead>문서</ConsoleTableHead>
          <ConsoleTableHead>세부 문제</ConsoleTableHead>
          <ConsoleTableHead>시각</ConsoleTableHead>
          <ConsoleTableHead>답변 상태</ConsoleTableHead>
        </tr>
      </thead>
      <ConsoleTableBody>
        {items.length === 0 ? (
          <tr>
            <ConsoleTableCell colSpan={5} className="text-label-assistive h-15">
              {EMPTY_VALUE}
            </ConsoleTableCell>
          </tr>
        ) : (
          items.map((item) => (
            <tr key={item.ragRunId}>
              <ConsoleTableCell className="text-body-2 h-15 truncate" title={item.question}>
                {item.question}
              </ConsoleTableCell>
              <ConsoleTableCell className="h-15 truncate" title={item.documentTitle ?? undefined}>
                {item.documentTitle ?? EMPTY_VALUE}
              </ConsoleTableCell>
              <ConsoleTableCell
                className="text-label-assistive h-15 truncate"
                title={item.subproblemName ?? undefined}
              >
                {item.subproblemName ?? EMPTY_VALUE}
              </ConsoleTableCell>
              <ConsoleTableCell
                className="text-label-assistive h-15 truncate"
                title={formatAbsoluteTime(item.askedAt)}
              >
                {formatRelativeTime(item.askedAt)}
              </ConsoleTableCell>
              <ConsoleTableCell className="h-15">
                <AnswerStatusBadge
                  answerStatus={item.answerStatus}
                  withheldReason={item.withheldReason}
                />
              </ConsoleTableCell>
            </tr>
          ))
        )}
      </ConsoleTableBody>
    </ConsoleTable>
  );
}
