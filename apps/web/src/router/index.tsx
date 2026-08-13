import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { InsurancePage } from '../pages/InsurancePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <div className="text-gray-800 text-2xl font-bold">대시보드 컨텐츠 영역</div>,
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
