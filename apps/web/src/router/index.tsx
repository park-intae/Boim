import { lazy, Suspense, type FC } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { useAuthStore } from '../features/auth/store/authStore';
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary';

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
const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
);

const PageFallback: FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// 🌐 루트(/) 진입점: 로그인 상태면 대시보드, 비로그인이면 공개 랜딩 페이지를 기본 화면으로 렌더링
const RootRoute: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (isAuthenticated && accessToken) {
    return (
      <AppLayout>
        <HomePage />
      </AppLayout>
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <LandingPage />
    </Suspense>
  );
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootRoute />,
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <AppLayout>
            <HomePage />
          </AppLayout>
        </ProtectedRoute>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/login',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Login />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/signup',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <SignUp />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/onboarding',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Onboarding onComplete={() => (window.location.href = `${import.meta.env.BASE_URL}login`)} />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/pass-verify',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <PassVerification onVerifySuccess={() => (window.location.href = `${import.meta.env.BASE_URL}`)} />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/auth/callback',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <OAuthCallbackPage />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
    {
      path: '/landing',
      element: (
        <RouteErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <LandingPage />
          </Suspense>
        </RouteErrorBoundary>
      ),
      errorElement: (
        <RouteErrorBoundary>
          <div />
        </RouteErrorBoundary>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL || '/',
  },
);
