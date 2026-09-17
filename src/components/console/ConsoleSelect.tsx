import CaretDown from '@/assets/icons/CaretDown.svg?react';
import { cn } from '@/lib/utils';

export type ConsoleSelectOption = {
  value: string;
  label: string;
};

type ConsoleSelectProps = Omit<React.ComponentProps<'select'>, 'value' | 'onChange'> & {
  /** 현재 값. 빈 문자열이면 아무것도 고르지 않은 상태라 placeholder 를 옅게 보인다. */
  value: string;
  /** 고르지 않았을 때 보이는 문구. 첫 옵션으로도 들어가서 다시 전체로 되돌릴 수 있다. */
  placeholder: string;
  options: ConsoleSelectOption[];
  onValueChange: (value: string) => void;
};

/**
 * 운영콘솔 필터 셀렉트. 브라우저 기본 셀렉트를 입력란과 같은 높이 40, 모서리 8 로 맞추고 오른쪽에 캐럿을 둔다.
 * 고른 값이 없으면 placeholder 를 옅은 색으로 보이고, 값이 있으면 본문 색으로 보인다.
 */
export default function ConsoleSelect({
  value,
  placeholder,
  options,
  onValueChange,
  className,
  ...props
}: ConsoleSelectProps) {
  return (
    <div className={cn('relative w-65', className)}>
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          'text-body-2 border-line-normal bg-background-default h-10 w-full cursor-pointer appearance-none rounded-lg border py-0 pr-8 pl-3 transition-colors outline-none',
          'focus-visible:border-rc-iris-200 focus-visible:ring-rc-iris-200 focus-visible:ring-[0.6px]',
          value === '' ? 'text-label-assistive' : 'text-label-normal',
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown
        aria-hidden
        className="text-label-assistive pointer-events-none absolute top-1/2 right-3 h-1.25 w-2 -translate-y-1/2"
      />
    </div>
  );
}
