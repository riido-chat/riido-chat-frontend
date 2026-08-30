import { CardHeader, CardTitle } from '@/components/common/card';
import { GoHome } from 'react-icons/go';
import { Button } from '@/components/common/button';
import { IoChatbubbleEllipsesOutline as ChatIcon } from 'react-icons/io5';

type NavBarProps = {
  children: React.ReactNode;
  onGoChat?: () => void;
  onGoHome?: () => void;
};

export default function NavBar({ children, onGoChat, onGoHome }: NavBarProps) {
  return (
    <CardHeader>
      {/* 현재 화면으로 이동하는 버튼은 숨기되, 제목이 가운데에 유지되도록 자리는 남긴다. */}
      {onGoHome ? (
        <Button onClick={onGoHome} aria-label="홈으로 돌아가기" size="icon-md" variant="icon">
          <GoHome className="size-icon-md" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
      <CardTitle>{children}</CardTitle>
      {onGoChat ? (
        <Button onClick={onGoChat} aria-label="채팅으로 이동하기" size="icon-md" variant="icon">
          <ChatIcon className="size-icon-md" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
    </CardHeader>
  );
}
