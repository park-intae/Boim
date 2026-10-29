import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';

interface SocialAccountStatus {
  linked: boolean;
  email: string | null;
}

interface SocialStatusResponse {
  kakao: SocialAccountStatus;
  naver: SocialAccountStatus;
}

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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'kakao' | 'naver' | null>(null);
  const [socialStatus, setSocialStatus] = useState<SocialStatusResponse>({
    kakao: { linked: false, email: null },
    naver: { linked: false, email: null },
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
  }, []);

  const handleLink = async (provider: 'kakao' | 'naver') => {
    /* -------------------------------------------------------------------------
     * 🚀 [PROD 전용 실제 OAuth2 연동 전환 가이드]
     * 실제 카카오/네이버 공식 OAuth 계정 연동을 도입할 경우 아래 코드로 대체/삽입하십시오:
     * 
     * 방법 1 (백엔드 OAuth 리다이렉트 방식):
     *   const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
     *   window.location.href = `${baseUrl}/auth/${provider}?mode=link`;
     *   return;
     * 
     * 방법 2 (공식 Javascript SDK / 팝업 로그인 컴포넌트 삽입 시):
     *   // window.Kakao.Auth.login({ success: (res) => linkWithToken(res.access_token) });
     *   // <NaverLoginButton onSuccess={handleNaverSuccess} />
     * ------------------------------------------------------------------------- */

    // 🛠️ 현재 모드: 개발 및 로컬 테스트용 간이(Mock) 연동
    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    if (!window.confirm(`${providerName} 계정을 간이(Mock)로 연동하시겠습니까?\n(실제 외부 인증 없이 테스트 계정이 즉시 연동됩니다)`)) {
      return;
    }

    try {
      setActionLoading(provider);
      await apiClient.post('/auth/social/mock-link', { provider });
      alert(`${providerName} 계정이 성공적으로 연동되었습니다.`);
      await fetchStatus();
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      alert(apiError?.error?.message || apiError?.message || `${providerName} 계정 연동에 실패했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async (provider: 'kakao' | 'naver') => {
    /* -------------------------------------------------------------------------
     * 🚀 [PROD 전용 실제 OAuth2 연동 해제 전환 가이드]
     * 실제 카카오/네이버 연동 해제 시:
     *   - 백엔드에서 카카오 `https://kapi.kakao.com/v1/user/unlink` 또는 
     *     네이버 `https://nid.naver.com/oauth2.0/token?grant_type=delete` 호출 API 트리거
     *   await apiClient.post(`/auth/social/unlink`, { provider });
     * ------------------------------------------------------------------------- */

    // 🛠️ 현재 모드: 개발 및 로컬 테스트용 간이(Mock) 연동 해제
    const providerName = provider === 'kakao' ? '카카오' : '네이버';
    if (!window.confirm(`정말 ${providerName} 계정 연동을 해제하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(provider);
      await apiClient.post('/auth/social/mock-unlink', { provider });
      alert(`${providerName} 계정 연동이 해제되었습니다.`);
      await fetchStatus();
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      alert(apiError?.error?.message || apiError?.message || `${providerName} 계정 연동 해제에 실패했습니다.`);
    } finally {
      setActionLoading(null);
    }
  };

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

      {/* Mock Mode Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5 shrink-0">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            현재 <strong>간이(Mock) 연동 모드</strong>로 작동 중입니다. 복잡한 외부 소셜 창 없이 원클릭으로 간편하게 연동 및 해제를 테스트할 수 있습니다.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-xs">연동 상태를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* 카카오 연동 카드 */}
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-all">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Icon & Info */}
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

              {/* Right: Action Button */}
              <div className="shrink-0">
                {/* 
                  * 💡 [실제 공식 카카오 로그인 컴포넌트 삽입 영역 예시]:
                  * {!socialStatus.kakao.linked && <KakaoLoginButton onSuccess={handleKakaoOAuth} />}
                  */}
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
              {/* Left: Icon & Info */}
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

              {/* Right: Action Button */}
              <div className="shrink-0">
                {/* 
                  * 💡 [실제 공식 네이버 로그인 컴포넌트 삽입 영역 예시]:
                  * {!socialStatus.naver.linked && <NaverLoginButton onSuccess={handleNaverOAuth} />}
                  */}
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
      )}
    </div>
  );
};
