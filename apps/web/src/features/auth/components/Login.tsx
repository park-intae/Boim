import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      // TODO: 백엔드에서 user 정보를 받아오는 API(예: /users/me) 호출 필요, 일단 임시 유저 사용
      login({ id: 'social_user', email: 'social@example.com', isPassVerified: false }, token);
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, login, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setRememberMe(!!data.rememberMe);
      const response = await apiClient.post('/auth/login', data);
      
      if (response.success && response.data?.accessToken) {
        // 임시로 이메일 정보를 유저 객체에 넣음
        login({ id: 'user_id', email: data.email, isPassVerified: false }, response.data.accessToken);
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error?.error?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
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
                {...register('password')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                로그인 기기 기억
              </span>
            </label>
            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
              비밀번호 찾기
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">간편 로그인</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full py-2.5 bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              카카오
            </button>
            <button
              onClick={() => handleSocialLogin('naver')}
              className="w-full py-2.5 bg-[#03C75A] hover:bg-[#02B350] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              네이버
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 mt-6">
        아직 계정이 없으신가요?{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4">
          회원가입
        </a>
      </p>
    </div>
  );
};
