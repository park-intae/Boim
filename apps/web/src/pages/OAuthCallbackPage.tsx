import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../features/auth/store/authStore';
import { apiClient } from '../api/client';
import type { ApiResponse, UserDto } from '@boim/shared-types';

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 1. 에러 파라미터 확인 (인가 거부 또는 취소 시)
      const errorDesc = searchParams.get('error_description');
      const errorParam = errorDesc ? errorDesc.replace(/\+/g, ' ') : searchParams.get('error');
      if (errorParam) {
        setErrorMessage(decodeURIComponent(errorParam));
        return;
      }

      // 2. 백엔드 리다이렉트로부터 토큰이 직접 전달된 경우
      const token = searchParams.get('token');
      if (token) {
        try {
          // 토큰 임시 설정 후 내 프로필 정보 조회
          localStorage.setItem('temp_token', token);
          const response = await apiClient.get<ApiResponse<UserDto>>('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = response.data?.data;
          const user = {
            id: userData?.id ? String(userData.id) : 'social_user',
            email: userData?.email || 'social@boim.internal',
            name: userData?.name || '소셜 사용자',
            isPassVerified: userData?.isPassVerified ?? false,
          };

          login(user, token);
          navigate('/', { replace: true });
          return;
        } catch {
          // 프로필 조회 실패 시에도 기본 정보로 로그인 처리
          login(
            { id: 'social_user', email: 'social@boim.internal', isPassVerified: false },
            token,
          );
          navigate('/', { replace: true });
          return;
        }
      }

      // 3. 인가 코드(code)로 직접 전달된 경우
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = searchParams.get('provider') || (state ? 'naver' : 'kakao');

      if (code) {
        try {
          const endpoint = provider === 'naver' ? '/auth/naver/login' : '/auth/kakao/login';
          const payload = provider === 'naver' ? { code, state: state || 'mock_state' } : { code };

          interface SocialLoginResponse {
            user?: { id: string; email?: string; name?: string; isPassVerified?: boolean };
            tokens?: { accessToken: string; refreshToken?: string };
          }

          const res = await apiClient.post<ApiResponse<SocialLoginResponse>>(endpoint, payload);
          const authData = res.data?.data;

          if (authData?.tokens?.accessToken && authData.user) {
            login(
              {
                id: String(authData.user.id),
                email: authData.user.email || 'social@boim.internal',
                name: authData.user.name,
                isPassVerified: !!authData.user.isPassVerified,
              },
              authData.tokens.accessToken,
            );
            navigate('/', { replace: true });
            return;
          } else {
            throw new Error('인증 토큰을 수신하지 못했습니다.');
          }
        } catch (e: unknown) {
          const apiErr = e as { error?: { message?: string }; message?: string };
          setErrorMessage(apiErr?.error?.message || apiErr?.message || '소셜 로그인 처리에 실패했습니다.');
          return;
        }
      }

      // 파라미터가 전혀 없는 비정상 접근
      setErrorMessage('유효한 소셜 인증 정보가 전달되지 않았습니다.');
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">소셜 로그인 실패</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 로그인 화면으로 복귀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800 mb-1">소셜 로그인 확인 중</h2>
        <p className="text-xs text-slate-400">
          소셜 계정 인증 정보를 안전하게 확인하고 있습니다. 잠시만 기다려주세요...
        </p>
      </div>
    </div>
  );
};
