import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  User as UserIcon,
  Check,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../auth/store/authStore';
import type {
  SocialStatusResponse,
  UpdateSocialPriorityDto,
} from '@boim/shared-types';

interface SocialAccountsSettingsProps {
  onBack: () => void;
}

// 🟡 카카오 공식 벡터 SVG 아이콘
const KakaoLogo: React.FC = () => (
  <svg className="w-5 h-5 fill-[#3C1E1E]" viewBox="0 0 24 24">
    <path d="M12 3C6.477 3 2 6.477 2 10.764c0 2.766 1.875 5.187 4.708 6.554-.207.76-.75 2.756-.86 3.18-.135.531.194.524.41.38.169-.113 2.695-1.83 3.79-2.576.634.093 1.285.142 1.952.142 5.523 0 10-3.477 10-7.764C22 6.477 17.523 3 12 3z" />
  </svg>
);

// 🟢 네이버 공식 벡터 SVG 아이콘
const NaverLogo: React.FC = () => (
  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
  </svg>
);

export const SocialAccountsSettings: React.FC<SocialAccountsSettingsProps> = ({ onBack }) => {
  const { user: currentUser, login, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'kakao' | 'naver' | null>(null);
  const [prioritySaving, setPrioritySaving] = useState(false);
  const [primarySaving, setPrimarySaving] = useState(false);
  const [socialStatus, setSocialStatus] = useState<SocialStatusResponse>({
    primaryAccountProvider: 'local',
    localAccount: { email: null, nickname: null },
    kakao: { linked: false, email: null, nickname: null, profileImage: null },
    naver: { linked: false, email: null, nickname: null, profileImage: null },
    preferredImageProvider: 'kakao',
    preferredNameProvider: 'kakao',
  });

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get('/auth/social/status')) as Record<string, unknown>;
      const data = (res?.data || res) as SocialStatusResponse;
      if (data?.kakao && data?.naver) {
        setSocialStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch social link status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // 소셜 연동 OAuth 리다이렉트 콜백 파라미터 감지
    const searchParams = new URLSearchParams(window.location.search);
    const successProvider = searchParams.get('social_link_success');
    const linkError = searchParams.get('social_link_error');

    if (successProvider) {
      const name = successProvider === 'kakao' ? '카카오' : '네이버';
      alert(`${name} 계정이 성공적으로 연동되었습니다!`);
      searchParams.delete('social_link_success');
      const newQuery = searchParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
      window.history.replaceState({}, document.title, newUrl);
      fetchStatus();
    } else if (linkError) {
      alert(`소셜 계정 연동 실패: ${decodeURIComponent(linkError)}`);
      searchParams.delete('social_link_error');
      const newQuery = searchParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // 대표 본계정(Primary Identity) 전환
  const handlePrimaryAccountChange = async (provider: 'local' | 'kakao' | 'naver') => {
    if (socialStatus.primaryAccountProvider === provider) return;

    const providerNames: Record<string, string> = {
      local: '기본 가입 계정',
      kakao: '카카오 계정',
      naver: '네이버 계정',
    };

    if (
      !window.confirm(
        `[${providerNames[provider]}]을(를) 서비스 대표 본계정으로 지정하시겠습니까?\n헤더의 대표 프로필 정보가 해당 계정으로 자동 동기화됩니다.`,
      )
    ) {
      return;
    }

    try {
      setPrimarySaving(true);
      const res = (await apiClient.patch('/auth/social/primary-account', {
        primaryAccountProvider: provider,
      })) as Record<string, unknown>;

      const updatedUser = (res?.data || res) as {
        id: string;
        email?: string;
        name?: string;
        profileImage?: string | null;
        primaryAccountProvider?: 'local' | 'kakao' | 'naver';
        preferredImageProvider?: 'kakao' | 'naver' | 'default';
        preferredNameProvider?: 'kakao' | 'naver' | 'custom';
      };

      setSocialStatus((prev) => ({
        ...prev,
        primaryAccountProvider: provider,
        preferredImageProvider: updatedUser.preferredImageProvider ?? prev.preferredImageProvider,
        preferredNameProvider: updatedUser.preferredNameProvider ?? prev.preferredNameProvider,
      }));

      // authStore 및 글로벌 헤더 상태 실시간 동기화
      if (currentUser && accessToken) {
        login(
          {
            ...currentUser,
            name: updatedUser.name ?? currentUser.name,
            profileImage: updatedUser.profileImage ?? null,
          },
          accessToken,
        );
      }
      alert(`대표 본계정이 [${providerNames[provider]}](으)로 성공적으로 변경되었습니다.`);
    } catch (e: unknown) {
      console.error('Failed to update primary account:', e);
      const apiErr = e as { error?: { message?: string }; message?: string };
      alert(apiErr?.error?.message || apiErr?.message || '대표 본계정 변경에 실패했습니다.');
    } finally {
      setPrimarySaving(false);
    }
  };

  const handlePriorityChange = async (updates: UpdateSocialPriorityDto) => {
    try {
      setPrioritySaving(true);
      const res = (await apiClient.patch('/auth/social/priority', updates)) as Record<string, unknown>;
      const updatedUser = (res?.data || res) as {
        id: string;
        email?: string;
        name?: string;
        profileImage?: string | null;
        preferredImageProvider?: 'kakao' | 'naver' | 'default';
        preferredNameProvider?: 'kakao' | 'naver' | 'custom';
      };

      setSocialStatus((prev) => ({
        ...prev,
        preferredImageProvider: updates.preferredImageProvider ?? prev.preferredImageProvider,
        preferredNameProvider: updates.preferredNameProvider ?? prev.preferredNameProvider,
      }));

      // authStore 및 글로벌 헤더 상태 동기화
      if (currentUser && accessToken) {
        login(
          {
            ...currentUser,
            name: updatedUser.name ?? currentUser.name,
            profileImage: updatedUser.profileImage ?? null,
          },
          accessToken,
        );
      }
    } catch (e) {
      console.error('Failed to update social priority:', e);
      alert('프로필 우선순위 설정 변경에 실패했습니다.');
    } finally {
      setPrioritySaving(false);
    }
  };

  const handleLink = (provider: 'kakao' | 'naver') => {
    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    if (
      !window.confirm(
        `[${providerName} 계정 연동]\n${providerName} 로그인 및 정보 제공 동의 화면으로 이동합니다.\n동의 완료 후 본 서비스 계정과 즉시 연동됩니다.`,
      )
    ) {
      return;
    }

    if (!accessToken) {
      alert('로그인 인증 세션이 만료되었습니다. 다시 로그인한 후 시도해주세요.');
      return;
    }

    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (window.location.port === '5173' ? 'http://localhost:4000/api' : '/api');

    window.location.href = `${baseUrl}/auth/social/link/${provider}?token=${encodeURIComponent(accessToken)}`;
  };

  const handleUnlink = async (provider: 'kakao' | 'naver') => {
    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    if (!window.confirm(`정말 ${providerName} 계정 연동을 해제하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(provider);
      // 백엔드 실계정 연동 해제 엔드포인트 호출
      await apiClient.post(`/auth/${provider}/unlink`);
      alert(`${providerName} 계정 연동이 해제되었습니다.`);
      await fetchStatus();

      // 연동 해제에 따른 헤더 프로필 갱신 동기화
      if (currentUser && accessToken) {
        try {
          const res = (await apiClient.get('/users/me')) as Record<string, unknown>;
          const dataLevel1 = res?.data as Record<string, unknown> | undefined;
          const dataLevel2 = dataLevel1?.data as Record<string, unknown> | undefined;
          const rawUser = dataLevel2?.id ? dataLevel2 : (dataLevel1?.id ? dataLevel1 : res);
          if (rawUser?.name) {
            login(
              {
                ...currentUser,
                name: String(rawUser.name),
                profileImage: (rawUser.profileImage as string) || null,
              },
              accessToken,
            );
          }
        } catch {
          // ignore
        }
      }
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      alert(apiError?.error?.message || apiError?.message || `${providerName} 계정 연동 해제에 실패했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

  // 카카오와 네이버 둘 다 연동되어 있는지 여부
  const isMultiSocialLinked = socialStatus.kakao.linked && socialStatus.naver.linked;

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base lg:text-lg font-bold text-gray-900">소셜 계정 연동</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-xs">연동 상태를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 👑 대표 본계정(Primary Identity) 설정 섹션 */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border border-indigo-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-gray-900">대표 본계정(Primary Account)</h4>
              {primarySaving && <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin ml-auto" />}
            </div>
            <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
              회원가입 시 생성된 계정이 <strong>기본 본계정</strong>으로 작동합니다. 연동된 SNS가 있다면 원하는 소셜 계정을 선택하여 본계정으로 지정할 수 있습니다.
            </p>

            <div className="space-y-2">
              {/* 1. 기본 가입 계정 (local) */}
              <div
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  socialStatus.primaryAccountProvider === 'local'
                    ? 'border-indigo-500 bg-white shadow-xs ring-1 ring-indigo-400'
                    : 'border-gray-200 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">기본 가입 계정</span>
                      {socialStatus.primaryAccountProvider === 'local' && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                          <Star className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                          현재 본계정
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">
                      {socialStatus.localAccount?.email || currentUser?.email || '이메일 가입 계정'}
                    </p>
                  </div>
                </div>

                {socialStatus.primaryAccountProvider !== 'local' && (
                  <button
                    type="button"
                    onClick={() => handlePrimaryAccountChange('local')}
                    disabled={primarySaving}
                    className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    본계정으로 지정
                  </button>
                )}
              </div>

              {/* 2. 카카오 계정 (연동 시 활성화) */}
              {socialStatus.kakao.linked && (
                <div
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    socialStatus.primaryAccountProvider === 'kakao'
                      ? 'border-indigo-500 bg-white shadow-xs ring-1 ring-indigo-400'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FEE500] flex items-center justify-center shrink-0">
                      <KakaoLogo />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">카카오 계정</span>
                        {socialStatus.primaryAccountProvider === 'kakao' && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                            현재 본계정
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">
                        {socialStatus.kakao.nickname || socialStatus.kakao.email || '연동 완료'}
                      </p>
                    </div>
                  </div>

                  {socialStatus.primaryAccountProvider !== 'kakao' && (
                    <button
                      type="button"
                      onClick={() => handlePrimaryAccountChange('kakao')}
                      disabled={primarySaving}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                    >
                      본계정으로 지정
                    </button>
                  )}
                </div>
              )}

              {/* 3. 네이버 계정 (연동 시 활성화) */}
              {socialStatus.naver.linked && (
                <div
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    socialStatus.primaryAccountProvider === 'naver'
                      ? 'border-indigo-500 bg-white shadow-xs ring-1 ring-indigo-400'
                      : 'border-gray-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#03C75A] flex items-center justify-center shrink-0">
                      <NaverLogo />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">네이버 계정</span>
                        {socialStatus.primaryAccountProvider === 'naver' && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                            현재 본계정
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">
                        {socialStatus.naver.nickname || socialStatus.naver.email || '연동 완료'}
                      </p>
                    </div>
                  </div>

                  {socialStatus.primaryAccountProvider !== 'naver' && (
                    <button
                      type="button"
                      onClick={() => handlePrimaryAccountChange('naver')}
                      disabled={primarySaving}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                    >
                      본계정으로 지정
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 소셜 계정 연동 목록 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 px-1">소셜 계정 연동 상태</h4>

            {/* 카카오 연동 카드 */}
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE500] shrink-0 flex items-center justify-center shadow-xs">
                    <KakaoLogo />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 shrink-0">카카오</span>
                      {socialStatus.kakao.linked ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          연동됨
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                          미연동
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {socialStatus.kakao.linked
                        ? socialStatus.kakao.email || '연동 완료'
                        : '간편 로그인 및 알림 연동'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {socialStatus.kakao.linked ? (
                    <button
                      onClick={() => handleUnlink('kakao')}
                      disabled={actionLoading === 'kakao'}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'kakao' ? '처리 중...' : '해제'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLink('kakao')}
                      disabled={actionLoading === 'kakao'}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-900 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                    >
                      {actionLoading === 'kakao' ? '연동 중...' : '연동하기'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 네이버 연동 카드 */}
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#03C75A] shrink-0 flex items-center justify-center shadow-xs">
                    <NaverLogo />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 shrink-0">네이버</span>
                      {socialStatus.naver.linked ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          연동됨
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                          미연동
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {socialStatus.naver.linked
                        ? socialStatus.naver.email || '연동 완료'
                        : '간편 로그인 및 알림 연동'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {socialStatus.naver.linked ? (
                    <button
                      onClick={() => handleUnlink('naver')}
                      disabled={actionLoading === 'naver'}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'naver' ? '처리 중...' : '해제'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLink('naver')}
                      disabled={actionLoading === 'naver'}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#03C75A] hover:bg-[#02b351] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                    >
                      {actionLoading === 'naver' ? '연동 중...' : '연동하기'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 대표 프로필 정보 세부 우선순위 설정 카드 (카카오 + 네이버 동시 연동 시 표시) */}
          {isMultiSocialLinked && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100 rounded-2xl shadow-xs mt-4">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-900">대표 프로필 세부 우선순위</h4>
                {prioritySaving && <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin ml-auto" />}
              </div>
              <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
                헤더 및 마이페이지에 표시될 프로필 사진과 이름을 플랫폼별로 세부 커스텀할 수 있습니다.
              </p>

              {/* 1. 대표 프로필 사진 선택 */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-gray-700 block mb-2">대표 프로필 사진</span>
                <div className="grid grid-cols-3 gap-2">
                  {/* 카카오 사진 */}
                  <button
                    type="button"
                    onClick={() => handlePriorityChange({ preferredImageProvider: 'kakao' })}
                    disabled={prioritySaving}
                    className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center relative ${
                      socialStatus.preferredImageProvider === 'kakao'
                        ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    {socialStatus.preferredImageProvider === 'kakao' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden mb-1.5 border border-amber-200">
                      {socialStatus.kakao.profileImage ? (
                        <img
                          src={socialStatus.kakao.profileImage}
                          alt="카카오 프로필"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <KakaoLogo />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">카카오</span>
                    <span className="text-[9px] text-gray-400">프로필 사진</span>
                  </button>

                  {/* 네이버 사진 */}
                  <button
                    type="button"
                    onClick={() => handlePriorityChange({ preferredImageProvider: 'naver' })}
                    disabled={prioritySaving}
                    className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center relative ${
                      socialStatus.preferredImageProvider === 'naver'
                        ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    {socialStatus.preferredImageProvider === 'naver' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden mb-1.5 border border-emerald-200">
                      {socialStatus.naver.profileImage ? (
                        <img
                          src={socialStatus.naver.profileImage}
                          alt="네이버 프로필"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#03C75A] flex items-center justify-center">
                          <NaverLogo />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">네이버</span>
                    <span className="text-[9px] text-gray-400">프로필 사진</span>
                  </button>

                  {/* 기본 이니셜 */}
                  <button
                    type="button"
                    onClick={() => handlePriorityChange({ preferredImageProvider: 'default' })}
                    disabled={prioritySaving}
                    className={`flex flex-col items-center p-2.5 rounded-xl border transition-all text-center relative ${
                      socialStatus.preferredImageProvider === 'default'
                        ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    {socialStatus.preferredImageProvider === 'default' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mb-1.5 border border-slate-200 text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">기본</span>
                    <span className="text-[9px] text-gray-400">이니셜 아바타</span>
                  </button>
                </div>
              </div>

              {/* 2. 대표 이름/닉네임 선택 */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-2">대표 표시 이름</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePriorityChange({ preferredNameProvider: 'kakao' })}
                    disabled={prioritySaving}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left relative ${
                      socialStatus.preferredNameProvider === 'kakao'
                        ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#FEE500] flex items-center justify-center shrink-0">
                      <KakaoLogo />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-400">카카오 닉네임</p>
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {socialStatus.kakao.nickname || '카카오 사용자'}
                      </p>
                    </div>
                    {socialStatus.preferredNameProvider === 'kakao' && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePriorityChange({ preferredNameProvider: 'naver' })}
                    disabled={prioritySaving}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left relative ${
                      socialStatus.preferredNameProvider === 'naver'
                        ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#03C75A] flex items-center justify-center shrink-0">
                      <NaverLogo />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-400">네이버 이름</p>
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {socialStatus.naver.nickname || '네이버 사용자'}
                      </p>
                    </div>
                    {socialStatus.preferredNameProvider === 'naver' && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
