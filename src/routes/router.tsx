import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from '@/routes/RootLayout';
import ConsoleLayout from '@/routes/ConsoleLayout';
import HomePage from '@/pages/HomePage';
import GuidePage from '@/pages/GuidePage';
import DocumentGroupListPage from '@/pages/console/DocumentGroupListPage';
import DocumentGroupDetailPage from '@/pages/console/DocumentGroupDetailPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'guide/:sectionId', element: <GuidePage /> },
    ],
  },
  {
    path: 'console',
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <Navigate to="document-groups" replace /> },
      { path: 'document-groups', element: <DocumentGroupListPage /> },
      { path: 'document-groups/:groupId', element: <DocumentGroupDetailPage /> },
    ],
  },
]);
