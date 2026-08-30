import { CardHeader, CardTitle } from '@/components/common/card';
import { IoIosArrowBack } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { Button } from '@/components/common/button';

type NavBarProps = {
  children: React.ReactNode;
  onClose: () => void;
  onBack?: () => void;
};

export default function NavBar({ children, onClose, onBack }: NavBarProps) {
  return (
    <CardHeader>
      {onBack ? (
        <Button onClick={onBack} aria-label="추천 질문으로 돌아가기" size="icon-md" variant="icon">
          <IoIosArrowBack className="size-icon-md" />
        </Button>
      ) : (
        <div className="size-10" />
      )}
      <CardTitle>{children}</CardTitle>
      <Button onClick={onClose} aria-label="채팅 닫기" size="icon-md" variant="icon">
        <IoClose className="size-icon-md" />
      </Button>
    </CardHeader>
  );
}
