import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/card';

type FloatingChatProps = {
  onClose: () => void;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  return (
    <Card className="fixed top-6 right-6 h-200 max-h-[calc(100dvh-3rem)] w-md max-w-[calc(100vw-3rem)]">
      <CardHeader>
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="size-6 rounded bg-gray-200 hover:bg-gray-300"
        >
          {`<`}
        </button>
        <CardTitle>뤼이도 RAG 챗봇</CardTitle>
        <span className="size-6" aria-hidden />
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto"></CardContent>
      <CardFooter>
        <input placeholder="Type a message..." className="w-full border p-2" />
      </CardFooter>
    </Card>
  );
}
