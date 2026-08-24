import FloatingChat from '@/components/chat/FloatingChat';
import { useState } from 'react';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <main>
      <button onClick={() => setIsChatOpen((prev) => !prev)}>Open Chat</button>
      {isChatOpen && <FloatingChat onClose={() => setIsChatOpen((prev) => !prev)} />}
    </main>
  );
}

export default App;
