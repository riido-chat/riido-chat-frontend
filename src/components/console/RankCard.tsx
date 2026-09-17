import { EMPTY_VALUE } from '@/lib/console';
import { cn } from '@/lib/utils';

export type RankRow = {
  key: string;
  title: string;
  /** 제목 아래에 붙는 소속. 없으면 줄을 두지 않는다. */
  subtitle?: string;
  /** 오른쪽 끝에 붙는 수치 문구 */
  value: string;
};

type RankCardProps = {
  title: string;
  /** 서버가 정렬해 내려준 순서를 그대로 쓴다. 비어 있으면 하이픈 한 줄을 보인다. */
  rows: RankRow[];
};

/**
 * 대시보드의 순위 카드. 자주 묻는 세부 문제와 답변 보류가 많은 문서가 같은 골격을 쓴다.
 * 행은 최대 5개이고 순위 번호와 증감 표시는 두지 않는다.
 */
export default function RankCard({ title, rows }: RankCardProps) {
  return (
    <section
      aria-label={title}
      className="border-line-normal bg-background-default flex min-w-0 flex-1 flex-col rounded-xl border px-5 pt-5 pb-3"
    >
      <h2 className="text-headline text-label-strong pb-3 font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-body-2 text-label-assistive flex min-h-13.5 items-center">
          {EMPTY_VALUE}
        </p>
      ) : (
        <ul>
          {rows.map((row, index) => (
            <li
              key={row.key}
              className={cn(
                'border-line-normal flex min-h-13.5 items-center justify-between gap-4 py-1.5',
                index < rows.length - 1 && 'border-b',
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-body-2 text-label-normal truncate" title={row.title}>
                  {row.title}
                </p>
                {row.subtitle && (
                  <p className="text-caption text-label-assistive truncate">{row.subtitle}</p>
                )}
              </div>
              <p className="text-caption text-label-assistive shrink-0 whitespace-nowrap">
                {row.value}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
