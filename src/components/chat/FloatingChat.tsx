import { Card, CardContent, CardFooter } from '@/components/common/card';
import NavBar from '@/components/chat/NavBar';
import ChatInput from '@/components/chat/ChatInput';

type FloatingChatProps = {
  onClose: () => void;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  const handleSubmit = (message: string) => {
    console.log(message);
  };
  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)]">
      <NavBar onClose={onClose}>뤼이도 RAG 챗봇</NavBar>
      <CardContent className="flex flex-col"></CardContent>
      <CardFooter>
        <ChatInput onSubmit={handleSubmit} />
      </CardFooter>
    </Card>
  );
}
