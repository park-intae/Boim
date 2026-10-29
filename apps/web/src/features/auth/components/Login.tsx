import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ApiResponse } from '@boim/shared-types';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../../api/client';

const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
  password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const setRememberMe = useAuthStore((state) => state.setRememberMe);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // 소셜 로그인 후 리다이렉트 된 경우
      // 임시 소셜 사용자 정보 세팅
      login({ id: 'social_user', email: 'social@example.com', isPassVerified: false }, token);
      navigate('/', { replace: true });
    }
  }, [searchParams, login, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setRememberMe(!!data.rememberMe);
      const response = (await apiClient.post(
        '/auth/login',
        data
      )) as unknown as ApiResponse<{ accessToken: string; refreshToken?: string }> | { accessToken: string; refreshToken?: string };
      
      const resObj = response as Record<string, unknown>;
      const nestedData = resObj?.data as Record<string, unknown> | undefined;
      const token =
        (typeof nestedData?.accessToken === 'string' ? nestedData.accessToken : undefined) ||
        (typeof (nestedData?.data as Record<string, unknown> | undefined)?.accessToken === 'string'
          ? (nestedData?.data as Record<string, unknown>).accessToken as string
          : undefined) ||
        (typeof resObj?.accessToken === 'string' ? resObj.accessToken : undefined);

      if (token) {
        login({ id: 'user_id', email: data.email, isPassVerified: false }, token);
        navigate('/', { replace: true });
      } else {
        alert('로그인 처리에 실패했습니다. 서버 응답 형식을 확인해주세요.');
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const apiError = error as { error?: { message?: string }; message?: string } | undefined;
      const errorMessage =
        apiError?.error?.message ||
        apiError?.message ||
        '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      alert(errorMessage);
    }
  };

  const handleSocialLogin = (provider: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    window.location.href = `${baseUrl}/auth/${provider}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Boim 로그인</h1>
          <p className="text-slate-500 text-xs mt-1">내 보험을 안전하게 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                autoComplete="username"
                {...register('email')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="example@boim.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 font-medium">로그인 기기 기억하기</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">간편 로그인</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className="flex items-center justify-center py-2 px-3 bg-[#FEE500] text-[#191919] font-medium rounded-xl text-xs hover:bg-[#FDD835] transition-colors"
          >
            카카오 로그인
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('naver')}
            className="flex items-center justify-center py-2 px-3 bg-[#03C75A] text-white font-medium rounded-xl text-xs hover:bg-[#02b351] transition-colors"
          >
            네이버 로그인
          </button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate('/pass-verify')}
            className="text-xs text-slate-500 hover:text-blue-600 font-medium"
          >
            처음이신가요? 본인인증으로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
