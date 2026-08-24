import { Card, CardContent, CardFooter } from '@/components/common/card';
import NavBar from '@/components/chat/NavBar';
import { Textarea } from '@/components/common/textarea';
import { IoSend } from 'react-icons/io5';
import { Button } from '@/components/common/button';

type FloatingChatProps = {
  onClose: () => void;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)]">
      <NavBar onClose={onClose}>뤼이도 RAG 챗봇</NavBar>
      <CardContent className="flex flex-col"></CardContent>
      <CardFooter>
        <div className="bg-rc-gradation border-line-normal focus-within:ring-ring flex min-h-14 w-full items-center gap-4 rounded-md border-[1.2px] py-1.5 pr-1.5 pl-4 focus-within:ring-[1.6px]">
          <Textarea aria-label="메시지 입력" placeholder="어떤 것이 궁금하세요?" />
          <Button size="icon-lg" variant="icon" aria-label="Send">
            <IoSend className="size-icon-lg origin-center translate-x-0.5 -translate-y-0.5 rotate-330" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
