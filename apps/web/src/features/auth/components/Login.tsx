import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
  password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
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

  const onSubmit = async (data: LoginFormValues) => {
    // API 연동 전 콘솔 로그 테스트
    console.log('Login Data:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 모의 로딩
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Social Login with ${provider}`);
    // 소셜 로그인 처리 로직 연동 예정
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Boim 로그인</h1>
          <p className="text-slate-500 text-sm mt-2">내 보험을 안전하게 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="example@boim.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                로그인 기기 기억
              </span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              비밀번호 찾기
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">또는 다음으로 로그인</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full py-3.5 bg-[#FEE500] hover:bg-[#F4DC00] text-[#000000] font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>카카오로 계속하기</span>
            </button>
            <button
              onClick={() => handleSocialLogin('naver')}
              className="w-full py-3.5 bg-[#03C75A] hover:bg-[#02B350] text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>네이버로 계속하기</span>
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mt-8">
        아직 계정이 없으신가요?{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4">
          회원가입
        </a>
      </p>
    </div>
  );
};
