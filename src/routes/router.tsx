import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from '@/routes/RootLayout';
import ConsoleLayout from '@/routes/ConsoleLayout';
import HomePage from '@/pages/HomePage';
import GuidePage from '@/pages/GuidePage';
import DocumentGroupListPage from '@/pages/console/DocumentGroupListPage';
import DocumentGroupDetailPage from '@/pages/console/DocumentGroupDetailPage';
import QuestionLogDashboardPage from '@/pages/console/QuestionLogDashboardPage';

const ADMIN_HOSTNAME = 'admin.riido-chat.site';

const consolePages = [
  { path: 'document-groups', element: <DocumentGroupListPage /> },
  { path: 'document-groups/:groupId', element: <DocumentGroupDetailPage /> },
  { path: 'question-logs', element: <QuestionLogDashboardPage /> },
];

const consoleIndexRedirect = { index: true, element: <Navigate to="document-groups" replace /> };

const adminRoutes = [
  {
    element: <ConsoleLayout />,
    children: [consoleIndexRedirect, ...consolePages],
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

/**
 * 개발 서버에서 운영콘솔을 확인하기 위한 경로.
 * 콘솔 안의 링크는 운영 도메인을 기준으로 삼은 절대 경로이므로,
 * `/console` 아래와 루트 양쪽에 같은 화면을 두어야 이동이 끊기지 않는다.
 */
const devConsoleRoutes = [
  {
    path: 'console',
    element: <ConsoleLayout />,
    children: [consoleIndexRedirect, ...consolePages],
  },
  {
    element: <ConsoleLayout />,
    children: consolePages,
  },
];

export const router = createBrowserRouter(
  window.location.hostname === ADMIN_HOSTNAME
    ? adminRoutes
    : [...publicRoutes, ...(import.meta.env.DEV ? devConsoleRoutes : [])],
);
