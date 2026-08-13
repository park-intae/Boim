import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="text-brand-primary p-4 text-2xl font-bold">Boim 캘린더 & 대시보드 홈 (Phase 01)</div>,
  },
  {
    path: '/login',
    element: <div className="p-4">로그인 페이지</div>,
  }
]);
