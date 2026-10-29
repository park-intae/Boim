import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { Login } from '../features/auth/components/Login';
import { SignUp } from '../features/auth/components/SignUp';
import { Onboarding } from '../features/auth/components/Onboarding';
import { PassVerification } from '../features/auth/components/PassVerification';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

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
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/onboarding',
    element: <Onboarding onComplete={() => window.location.href = '/login'} />,
  },
  {
    path: '/pass-verify',
    element: <PassVerification onVerifySuccess={() => window.location.href = '/'} />,
  }
]);
