import { Button } from '@/components/common/button';

/** 조회 중 한 줄. 피그마에 조회 중 화면이 없어 문구만 두고 깜빡임으로 진행 중임을 나타낸다. */
export function ConsoleLoading({ message }: { message: string }) {
  return (
    <p className="text-label text-label-alternative animate-pulse" aria-live="polite">
      {message}
    </p>
  );
}

type ConsoleFetchErrorProps = {
  /** 서버가 내려준 message 그대로 */
  message: string;
  onRetry: () => void;
};

/** 조회 실패 한 줄과 다시 시도 버튼. 문구는 고르지 않고 응답의 message 를 그대로 보인다. */
export function ConsoleFetchError({ message, onRetry }: ConsoleFetchErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3" role="alert">
      <p className="text-label text-label-normal">{message}</p>
      <Button variant="console-secondary" size="md" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}
