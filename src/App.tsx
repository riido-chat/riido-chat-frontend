import FloatingChat from '@/components/chat/FloatingChat';
import { Button } from '@/components/common/button';
import { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { IoIosArrowBack } from 'react-icons/io';
import { FaStop } from 'react-icons/fa';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <main>
      <button onClick={() => setIsChatOpen((prev) => !prev)}>Open Chat</button>
      {isChatOpen && <FloatingChat onClose={() => setIsChatOpen((prev) => !prev)} />}
      <Button
        variant="default"
        size="default"
        onClick={() => console.log('Default button clicked')}
      >
        1:1 상담 연결하기
      </Button>

      <Button variant="icon" size="icon-lg" onClick={() => console.log('Icon button1 clicked')}>
        <IoSend className="size-icon-lg rotate-330" />
      </Button>

      <Button variant="icon" size="icon-lg" onClick={() => console.log('Icon button2 clicked')}>
        <FaStop className="size-icon-sm" />
      </Button>

      <Button variant="icon" size="icon-sm" onClick={() => console.log('Icon button3 clicked')}>
        <IoIosArrowBack className="size-icon-sm" />
      </Button>

      <Button variant="ghost" size="default" onClick={() => console.log('Ghost button clicked')}>
        Ghost Button
      </Button>
    </main>
  );
}

export default App;
