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
        <div className={isChatOpen ? '' : 'hidden'}>
          <FloatingChat />
        </div>
        <Button
          variant="icon"
          size="icon-lg"
          className="bg-floating-icon-gradation text-rc-iris-100 active:text-rc-gray-100 transition-[all,--floating-icon-gradation-from,--floating-icon-gradation-to] hover:[--floating-icon-gradation-from:var(--color-rc-iris-500)] hover:[--floating-icon-gradation-to:var(--color-rc-iris-500)] active:[--floating-icon-gradation-from:var(--color-rc-iris-600)] active:[--floating-icon-gradation-to:var(--color-rc-iris-600)]"
          onClick={() => setIsChatOpen((prev) => !prev)}
          aria-label={isChatOpen ? '채팅창 접기' : '채팅창 펼치기'}
          aria-expanded={isChatOpen}
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
