import React, { useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOffline, wasOffline, clearReconnected } = useOnlineStatus();

  // 재연결 알림은 3.5초 후 자동 종료
  useEffect(() => {
    if (wasOffline) {
      const timer = setTimeout(() => {
        clearReconnected();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, clearReconnected]);

  if (!isOffline && !wasOffline) {
    return null;
  }

  // 1. 오프라인 상태일 때 배너
  if (isOffline) {
    return (
      <aside
        data-testid="offline-banner"
        role="status"
        aria-live="polite"
        className="w-full bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md transition-all duration-300 z-50 sticky top-0"
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center">
          <WifiOff className="w-4 h-4 text-slate-900 animate-pulse flex-shrink-0" />
          <span>
            현재 <strong>오프라인 상태</strong>입니다. 캐시된 화면을 표시하며 일부 서버 기능이 제한될 수 있습니다.
          </span>
        </div>
      </aside>
    );
  }

  // 2. 다시 온라인으로 복구되었을 때 배너
  return (
    <aside
      data-testid="reconnected-banner"
      role="status"
      aria-live="polite"
      className="w-full bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md transition-all duration-300 z-50 sticky top-0"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center">
        <Wifi className="w-4 h-4 text-white flex-shrink-0" />
        <span>네트워크 연결이 복구되었습니다. 최신 데이터를 동기화합니다.</span>
      </div>
      <button
        type="button"
        onClick={clearReconnected}
        className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
        aria-label="닫기"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
