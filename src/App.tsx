import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { ConsoleApiError } from '@/api/console';
import { TooltipProvider } from '@/components/common/tooltip';
import { consoleQueryKeys, consoleQueryStaleTime } from '@/lib/consoleQueryKeys';
import { router } from '@/routes/router';

const queryClient = new QueryClient();

queryClient.setQueryDefaults(consoleQueryKeys.all, {
  staleTime: consoleQueryStaleTime,
  retry: (failureCount, error) =>
    failureCount < 3 &&
    (!(error instanceof ConsoleApiError) || error.status === undefined || error.status >= 500),
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
