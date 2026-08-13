import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { InsurancePage } from '../pages/InsurancePage';
import { HomePage } from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'insurance',
        element: <InsurancePage />,
      }
    ]
  },
  {
    path: '/login',
    element: <div className="p-4">로그인 페이지</div>,
  }
]);
