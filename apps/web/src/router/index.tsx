import { lazy, Suspense, type FC } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

// 🚀 라우트 단위 코드 스플리팅 (Dynamic Import)
const Login = lazy(() =>
  import('../features/auth/components/Login').then((m) => ({ default: m.Login })),
);
const SignUp = lazy(() =>
  import('../features/auth/components/SignUp').then((m) => ({ default: m.SignUp })),
);
const Onboarding = lazy(() =>
  import('../features/auth/components/Onboarding').then((m) => ({ default: m.Onboarding })),
);
const PassVerification = lazy(() =>
  import('../features/auth/components/PassVerification').then((m) => ({ default: m.PassVerification })),
);
const OAuthCallbackPage = lazy(() =>
  import('../pages/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })),
);

const PageFallback: FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<PageFallback />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <Suspense fallback={<PageFallback />}>
        <Onboarding onComplete={() => (window.location.href = '/login')} />
      </Suspense>
    ),
  },
  {
    path: '/pass-verify',
    element: (
      <Suspense fallback={<PageFallback />}>
        <PassVerification onVerifySuccess={() => (window.location.href = '/')} />
      </Suspense>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <Suspense fallback={<PageFallback />}>
        <OAuthCallbackPage />
      </Suspense>
    ),
  },
]);
