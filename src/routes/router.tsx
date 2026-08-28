import { createBrowserRouter } from 'react-router';
import RootLayout from '@/routes/RootLayout';
import HomePage from '@/pages/HomePage';
import GuidePage from '@/pages/GuidePage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'guide/:sectionId', element: <GuidePage /> },
    ],
  },
]);
