import { cn } from '@/lib/utils';

type ConsoleTableProps = React.ComponentProps<'table'> & {
  containerClassName?: string;
};

/**
 * 운영콘솔 표 공통 골격.
 * 콘텐츠 폭이 최소치 아래로 줄면 표 영역만 가로 스크롤하고, 표 안에는 세로 스크롤을 두지 않는다.
 */
export function ConsoleTable({ className, containerClassName, ...props }: ConsoleTableProps) {
  return (
    <div
      className={cn(
        'border-line-normal w-full overflow-x-auto rounded-lg border',
        containerClassName,
      )}
    >
      <table className={cn('w-full min-w-250 table-fixed border-collapse', className)} {...props} />
    </div>
  );
}

export function ConsoleTableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  // 마지막 행의 아래 선은 표 테두리와 겹치므로 지운다.
  return <tbody className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />;
}

export function ConsoleTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn(
        'border-line-normal bg-rc-gray-50 text-caption text-label-alternative h-10 truncate border-b px-3.5 text-left font-medium',
        className,
      )}
      {...props}
    />
  );
}

export function ConsoleTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'border-line-normal text-label text-label-normal h-13 border-b px-3.5',
        className,
      )}
      {...props}
    />
  );
}
