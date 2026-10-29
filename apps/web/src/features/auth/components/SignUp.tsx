import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { ApiResponse } from '@boim/shared-types';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../../api/client';

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: '이름은 최소 2자 이상 입력해주세요.' }),
    email: z.string().email({ message: '올바른 이메일 형식을 입력해주세요.' }),
    password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const response = (await apiClient.post(
        '/auth/register',
        {
          name: data.name,
          email: data.email,
          password: data.password,
        }
      )) as unknown as ApiResponse<{
        accessToken: string;
        refreshToken?: string;
        user?: { id: string; email: string; name?: string; isPassVerified: boolean };
      }>;

      const resObj = response as Record<string, unknown>;
      const dataLevel1 = resObj?.data as Record<string, unknown> | undefined;
      const dataLevel2 = dataLevel1?.data as Record<string, unknown> | undefined;

      const token =
        (typeof dataLevel1?.accessToken === 'string' ? dataLevel1.accessToken : undefined) ||
        (typeof dataLevel2?.accessToken === 'string' ? dataLevel2.accessToken : undefined) ||
        (typeof resObj?.accessToken === 'string' ? resObj.accessToken : undefined);

      const rawUser =
        (dataLevel1?.user as Record<string, unknown> | undefined) ||
        (dataLevel2?.user as Record<string, unknown> | undefined) ||
        (resObj?.user as Record<string, unknown> | undefined);

      const userInfo = {
        id: typeof rawUser?.id === 'string' ? rawUser.id : 'user_id',
        email: typeof rawUser?.email === 'string' ? rawUser.email : data.email,
        name: typeof rawUser?.name === 'string' ? rawUser.name : data.name,
        isPassVerified: typeof rawUser?.isPassVerified === 'boolean' ? rawUser.isPassVerified : false,
      };

      if (token) {
        login(userInfo, token);
        // 회원가입 직후 필수 본인인증(/pass-verify)으로 이동
        navigate('/pass-verify', { replace: true });
      } else {
        alert('회원가입 처리에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const apiError = error as { error?: { message?: string }; message?: string } | undefined;
      const errorMessage =
        apiError?.error?.message ||
        apiError?.message ||
        '회원가입에 실패했습니다. 입력 정보를 확인해주세요.';
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Boim 회원가입</h1>
          <p className="text-slate-500 text-xs mt-1">간편하게 가입하고 내 보험을 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">이름</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                autoComplete="name"
                {...register('name')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="홍길동"
              />
            </div>
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

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
                autoComplete="new-password"
                {...register('password')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? '가입 진행 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
