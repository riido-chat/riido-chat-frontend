import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { TooltipProvider } from '@/components/common/tooltip';
import { consoleQueryKeys, consoleQueryStaleTime } from '@/lib/consoleQueryKeys';
import { router } from '@/routes/router';

const queryClient = new QueryClient();

queryClient.setQueryDefaults(consoleQueryKeys.all, {
  staleTime: consoleQueryStaleTime,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
