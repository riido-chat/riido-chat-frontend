import { CardHeader, CardTitle } from '@/components/common/card';
import { GoHome } from 'react-icons/go';
import { Button } from '@/components/common/button';
import { IoExitOutline as EndChatIcon } from 'react-icons/io5';

type NavBarProps = {
  children: React.ReactNode;
  onGoHome?: () => void;
  onEndChat?: () => void;
};

export default function NavBar({ children, onGoHome, onEndChat }: NavBarProps) {
  return (
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
        <Button
          onClick={onEndChat}
          aria-label="새 대화 시작하기"
          title="새 대화 시작하기"
          size="icon-md"
          variant="icon"
        >
          <EndChatIcon className="size-icon-md" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
    </CardHeader>
  );
}
