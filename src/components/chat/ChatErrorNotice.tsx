import { Separator } from '@/components/common/separator';
import { IoAlertCircle } from 'react-icons/io5';

export default function ChatErrorNotice() {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3">
        <Separator className="h-px w-auto flex-1" />
        <IoAlertCircle className="text-label-assistive size-10" />
        <Separator className="h-px w-auto flex-1" />
      </div>

      <div className="text-label-assistive flex flex-col items-center gap-1 text-center">
        <p className="text-body-2 font-medium">답변 제공에 실패했어요</p>
        <p className="text-label font-normal whitespace-pre-line">
          {'시스템 오류로 인해 답변을 제공할 수 없어요.\n다시 질문해주세요.'}
        </p>
      </div>
    </div>
  );
}
