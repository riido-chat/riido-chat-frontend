import FloatingChat from '@/components/chat/FloatingChat';
import { Outlet } from 'react-router';
import { useState } from 'react';
import { Button } from '@/components/common/button';
import { IoClose } from 'react-icons/io5';
import MessageIcon from '@/assets/icons/MessageIcon.svg?react';

export default function RootLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main>
      <Outlet />
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && <FloatingChat onClose={() => setIsChatOpen((prev) => !prev)} />}
        <Button
          variant="icon"
          size="icon-lg"
          className="bg-floating-icon-gradation text-rc-iris-100 hover:opacity-90"
          onClick={() => setIsChatOpen((prev) => !prev)}
        >
          {isChatOpen ? (
            <IoClose className="size-icon-lg" />
          ) : (
            <MessageIcon className="size-icon-lg p-0.5" />
          )}
        </Button>
      </div>
    </main>
  );
}
