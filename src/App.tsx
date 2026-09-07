import { RouterProvider } from 'react-router';

import { TooltipProvider } from '@/components/common/tooltip';
import { router } from '@/routes/router';

function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}

export default App;
