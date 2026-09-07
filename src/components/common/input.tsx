import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

/**
 * 모달과 폼에서 쓰는 입력 필드. 높이 40 을 고정하고 라벨과 도움말 문구는 필드 바깥에 둔다.
 * 상태는 네 가지다. 미입력과 입력 완료는 문구 색만 다르고, 검증 실패는 aria-invalid 로,
 * 읽기 전용 표시와 처리 중 입력 차단은 disabled 로 나타낸다.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'text-label border-line-normal bg-background-default text-label-normal placeholder:text-label-assistive h-10 w-full min-w-0 rounded-lg border px-3 transition-colors outline-none',
        'aria-invalid:border-rc-rose-500',
        'disabled:border-rc-gray-200 disabled:text-label-assistive disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100',
        'focus-visible:border-rc-iris-200 focus-visible:ring-rc-iris-200 focus-visible:ring-[0.6px]',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
