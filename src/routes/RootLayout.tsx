import FloatingChat from '@/components/chat/FloatingChat';
import { Outlet } from 'react-router';
import { useState } from 'react';
import { Button } from '@/components/common/button';

export default function RootLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main>
      <Button onClick={() => setIsChatOpen((prev) => !prev)}>Open Chat</Button>
      <Outlet />
      {isChatOpen && <FloatingChat onClose={() => setIsChatOpen((prev) => !prev)} />}
    </main>
  );
}
