import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/card';

type FloatingChatProps = {
  onClose: () => void;
};

export default function FloatingChat({ onClose }: FloatingChatProps) {
  return (
    <Card className="fixed top-6 right-6 h-200 w-md shadow-lg">
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center">
        <button
          onClick={onClose}
          aria-label="채팅 닫기"
          className="size-10 rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
        >
          {`<`}
        </button>
        <CardTitle className="text-center text-lg font-bold">Floating Chat</CardTitle>
        <span className="size-10" aria-hidden />
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto"></CardContent>
      <CardFooter>
        <input placeholder="Type a message..." className="w-full border p-2" />
      </CardFooter>
    </Card>
  );
}
