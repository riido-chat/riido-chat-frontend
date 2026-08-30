import { Button } from '@/components/common/button';
import type { WithheldReasonCode } from '@/types/chat.types';
import { MdWarning } from 'react-icons/md';

type ChatWithheldBubbleProps = {
  reasonCode: WithheldReasonCode;
};

const withheldMessageByReasonCode: Record<
  WithheldReasonCode,
  { title: string; description: string }
> = {
  INSUFFICIENT_EVIDENCE: {
    title: '답변 근거를 확인하기 어려워요',
    description:
      '공식 이용가이드에서 충분하거나 신뢰할 수 있는 근거를 확인하지 못해 답변을 제공하기 어려워요.\n질문을 조금 더 구체적으로 입력해 주세요.',
  },
  UNVERIFIABLE_ANSWER: {
    title: '답변 근거를 확인하기 어려워요',
    description:
      '공식 이용가이드에서 충분하거나 신뢰할 수 있는 근거를 확인하지 못해 답변을 제공하기 어려워요.\n질문을 조금 더 구체적으로 입력해 주세요.',
  },
  AMBIGUOUS_QUESTION: {
    title: '질문의 의미를 정확히 파악하기 어려워요',
    description:
      '질문의 범위가 넓거나 의미가 모호해 정확한 답변을 드리기 어려워요. 궁금한 내용을 조금 더 구체적으로 질문해주세요.',
  },
  OUT_OF_SCOPE: {
    title: '현재 안내할 수 없는 질문이에요',
    description:
      '공식 이용가이드에서 제공하는 범위를 벗어난 질문이라 답변하기 어려워요.\n서비스 이용과 관련된 내용으로 질문해 주세요.',
  },
};

export default function ChatWithheldBubble({ reasonCode }: ChatWithheldBubbleProps) {
  const { title, description } = withheldMessageByReasonCode[reasonCode];

  return (
    <div className="flex flex-col items-center gap-5" data-reason-code={reasonCode}>
      <section className="flex flex-col items-center gap-2.5">
        <MdWarning className="size-icon-xl text-rc-iris-200" />

        <div className="flex flex-col gap-1.5">
          <span className="text-body-2 text-label-normal self-center font-bold">{title}</span>
          <span className="text-label text-label-alternative text-center whitespace-pre-line">
            {description}
          </span>
        </div>
      </section>
      <Button
        variant="default"
        size="inquiry"
        className="w-full"
        nativeButton={false}
        render={<a href="https://www.riido.io/" target="_blank" rel="noreferrer" />}
      >
        상담원에게 1:1 문의하기
      </Button>
    </div>
  );
}
