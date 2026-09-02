import { Button } from '@/components/common/button';
import { CardHeader, CardTitle } from '@/components/common/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/dialog';
import { GoHome } from 'react-icons/go';
import { IoExitOutline as EndChatIcon } from 'react-icons/io5';

type NavBarProps = {
  children: React.ReactNode;
  onGoHome?: () => void;
  onEndChat?: () => void;
  dialogContainer?: React.RefObject<HTMLElement | ShadowRoot | null>;
};

export default function NavBar({ children, onGoHome, onEndChat, dialogContainer }: NavBarProps) {
  return (
    <Dialog>
      <CardHeader>
        {onGoHome ? (
          <Button
            onClick={onGoHome}
            aria-label="홈으로 돌아가기"
            title="홈으로 돌아가기"
            size="icon-md"
            variant="icon"
          >
            <GoHome className="size-icon-md" />
          </Button>
        ) : (
          <div className="size-10" />
        )}
        <CardTitle>{children}</CardTitle>
        {onEndChat ? (
          <DialogTrigger
            render={
              <Button
                aria-label="새 대화 시작하기"
                title="새 대화 시작하기"
                size="icon-md"
                variant="icon"
              >
                <EndChatIcon className="size-icon-md" />
              </Button>
            }
          />
        ) : (
          <div className="size-10" />
        )}
      </CardHeader>

      <DialogContent showCloseButton={false} portalContainer={dialogContainer}>
        <DialogHeader>
          <DialogTitle>대화를 종료하고 홈으로 돌아가시겠어요?</DialogTitle>
          <DialogDescription>한 번 종료된 대화는 다시 복구되지 않아요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                size="md"
                className="bg-rc-slate-200 hover:bg-rc-gray-300 active:bg-rc-gray-400 active:text-label-normal text-label-alternative active:font-bold"
              />
            }
          >
            계속 질문할래요
          </DialogClose>
          <DialogClose
            render={
              <Button
                onClick={onEndChat}
                size="md"
                className="bg-button-primary-enabled text-rc-gray-0"
              />
            }
          >
            대화를 종료할래요
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
