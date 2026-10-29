import { useAuthStore } from '../store/authStore';

export const logAuthEvent = (event: string, details?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  const badgeStyle = 'background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;';
  const textStyle = 'color: #1e293b; font-weight: bold; font-size: 12px;';
  if (details) {
    console.log(`%cBoim Auth%c ${event}`, badgeStyle, textStyle, details);
  } else {
    console.log(`%cBoim Auth%c ${event}`, badgeStyle, textStyle);
  }
};

declare global {
  interface Window {
    boimAuth?: {
      check: () => void;
      getState: () => ReturnType<typeof useAuthStore.getState>;
    };
  }
}

export const initAuthConsoleDebugger = () => {
  if (typeof window === 'undefined') return;

  const check = () => {
    const state = useAuthStore.getState();
    const local = localStorage.getItem('boim-auth-storage');
    const session = sessionStorage.getItem('boim-auth-storage');

    let storageType = '없음 (인증되지 않음)';
    if (local && session) storageType = '⚠️ 양쪽 모두 존재 (비정상)';
    else if (local) storageType = '💾 localStorage (기기 기억 ON - 영구 보관)';
    else if (session) storageType = '⏱️ sessionStorage (기기 기억 OFF - 새로고침 유지, 창 닫으면 만료)';

    console.group('%c🔍 [Boim Auth Debugger] 현재 인증 & 스토리지 상태 점검', 'color: #2563eb; font-weight: bold; font-size: 13px;');
    console.table({
      '인증 여부 (isAuthenticated)': state.isAuthenticated ? '✅ 로그인됨' : '❌ 비인가',
      '계정 이메일 (user.email)': state.user?.email || '(없음)',
      '사용자 이름 (user.name)': state.user?.name || '(없음 - fallback 사용자)',
      'PASS 본인인증 여부': state.user?.isPassVerified ? '✅ 완료' : '❌ 미완료',
      '기기 기억하기 (rememberMe)': state.rememberMe ? '✅ ON (localStorage)' : '❌ OFF (sessionStorage)',
      '토큰 보관 저장소 (Storage)': storageType,
      '액세스 토큰 (AccessToken)': state.accessToken ? `✅ 존재 (${state.accessToken.slice(0, 15)}...)` : '❌ 없음',
    });
    console.log('📌 전체 User State:', state.user);
    console.groupEnd();

    return {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      rememberMe: state.rememberMe,
      storageType,
      hasToken: !!state.accessToken,
    };
  };

  window.boimAuth = {
    check,
    getState: () => useAuthStore.getState(),
  };

  console.log(
    '%cBoim Auth%c 콘솔 디버거가 준비되었습니다. 콘솔창에 %cboimAuth.check()%c 를 입력하시면 언제든지 실시간 인증 상태를 확인하실 수 있습니다.',
    'background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;',
    'color: #1e293b; font-weight: bold; font-size: 12px;',
    'background: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 12px;',
    'color: #1e293b; font-weight: bold; font-size: 12px;'
  );
};
