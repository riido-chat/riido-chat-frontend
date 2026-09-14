import { Button } from '@/components/common/button';
import type { WithheldReasonCode } from '@/types/chat.types';
import { MdWarning } from 'react-icons/md';
import Caution from '@/assets/icons/caution.svg?react';

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
      '공식 이용가이드에서 충분하거나 신뢰할 수 있는 근거를 확인하지 못해 답변을 제공하기 어려워요.',
  },
  UNVERIFIABLE_ANSWER: {
    title: '답변 근거를 확인하기 어려워요',
    description:
      '공식 이용가이드에서 충분하거나 신뢰할 수 있는 근거를 확인하지 못해 답변을 제공하기 어려워요.',
  },
  AMBIGUOUS_QUESTION: {
    title: '질문의 의미를 정확히 파악하기 어려워요',
    description: '질문의 범위가 넓거나 의미가 모호해 정확한 답변을 드리기 어려워요.',
  },
  OUT_OF_SCOPE: {
    title: '현재 안내할 수 없는 질문이에요',
    description: '공식 이용가이드에서 제공하는 범위를 벗어난 질문은 답변하기 어려워요.',
  },
};

const INQUIRY_BUTTON_HINT =
  '더 자세한 도움이 필요하시면 아래 버튼을 클릭해 채널톡으로 문의해 주세요.';

export default function ChatWithheldBubble({ reasonCode }: ChatWithheldBubbleProps) {
  const { title, description } = withheldMessageByReasonCode[reasonCode];
  const hasRelatedDocs =
    reasonCode === 'INSUFFICIENT_EVIDENCE' || reasonCode === 'AMBIGUOUS_QUESTION';

  return (
    <div className="flex flex-col gap-1.5" data-reason-code={reasonCode}>
      <section className="flex gap-1.5">
        {hasRelatedDocs ? (
          <Caution className="size-icon-md text-rc-iris-200" />
        ) : (
          <MdWarning className="size-icon-md text-rc-iris-200" />
        )}
        <span className="text-body-2 text-label-normal font-semibold">{title}</span>
      </section>
      <section className="text-label text-label-alternative flex flex-col gap-1.5">
        <span>{description}</span>
        <span>{INQUIRY_BUTTON_HINT}</span>
      </section>
      <Button
        variant="default"
        size="inquiry"
        className="w-full"
        nativeButton={false}
        render={<a href="https://www.riido.io/" target="_blank" rel="noreferrer" />}
      >
        채널톡에서 1:1 문의하기
      </Button>
    </div>
  );
}
