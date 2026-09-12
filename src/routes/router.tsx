import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from '@/routes/RootLayout';
import ConsoleLayout from '@/routes/ConsoleLayout';
import HomePage from '@/pages/HomePage';
import GuidePage from '@/pages/GuidePage';
import DocumentGroupListPage from '@/pages/console/DocumentGroupListPage';
import DocumentGroupDetailPage from '@/pages/console/DocumentGroupDetailPage';

const ADMIN_HOSTNAME = 'admin.riido-chat.site';

const adminRoutes = [
  {
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <Navigate to="document-groups" replace /> },
      { path: 'document-groups', element: <DocumentGroupListPage /> },
      { path: 'document-groups/:groupId', element: <DocumentGroupDetailPage /> },
    ],
  },
];

const publicRoutes = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'guide/:sectionId', element: <GuidePage /> },
    ],
  },
];

export const router = createBrowserRouter(
  window.location.hostname === ADMIN_HOSTNAME ? adminRoutes : publicRoutes,
);
