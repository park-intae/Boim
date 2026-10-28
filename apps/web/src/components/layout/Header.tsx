import { Bell, ChevronDown, Settings as SettingsIcon, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useLogout } from '../../features/auth/hooks/useLogout';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(true);

  const user = useAuthStore((state) => state.user);
  const { logout } = useLogout();
  const setPanelMode = useAppStore((state) => state.setPanelMode);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : '사용자');
  const initial = displayName.slice(0, 1).toUpperCase();

  const handleLogoutClick = async () => {
    setIsProfileMenuOpen(false);
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      await logout();
    }
  };

  const handleOpenSettings = () => {
    setIsProfileMenuOpen(false);
    setPanelMode('settings');
  };

  return (
    <header className="relative h-[60px] flex-shrink-0 flex items-center justify-end px-4 lg:px-10 border-b border-transparent z-40">
      <h2 className="absolute left-1/2 lg:left-[calc(50%-190px)] top-1/2 -translate-x-1/2 -translate-y-1/2 text-[18px] lg:text-[20px] font-bold text-gray-900 tracking-tight">
        보험 일정
      </h2>
      
      {/* Right Icons (Mobile & PC) */}
      <div className="flex items-center gap-1.5 lg:gap-3">
        {/* 1. 알림 버튼 및 팝오버 */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileMenuOpen(false);
              setHasNewNotification(false);
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 active:bg-gray-100 rounded-full transition-all duration-200 relative"
            aria-label="알림"
          >
            <Bell className="w-5 h-5" />
            {hasNewNotification && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notification Popover */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden transform transition-all">
              <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="font-extrabold text-[15px] text-gray-900">새로운 알림</span>
                <span 
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-[12px] font-bold text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                >
                  닫기
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md">납입 안내</span>
                    <span className="text-[11px] font-semibold text-gray-400">1시간 전</span>
                  </div>
                  <p className="text-[14px] font-bold text-gray-800 mt-2 group-hover:text-indigo-600 transition-colors">삼성화재 실손의료비 납입일</p>
                  <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">오늘이 자동이체 예정일입니다. 통장 잔고를 확인해주세요.</p>
                </div>
                <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-md">만기/갱신</span>
                    <span className="text-[11px] font-semibold text-gray-400">어제</span>
                  </div>
                  <p className="text-[14px] font-bold text-gray-800 mt-2 group-hover:text-indigo-600 transition-colors">DB손해보험 다이렉트 자동차</p>
                  <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">자동차 보험이 30일 뒤 만기됩니다. 갱신 조건을 확인해보세요.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 2. 사용자 프로필 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity outline-none"
            aria-label="사용자 메뉴"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-[13px] select-none">
              {initial}
            </div>
            <span className="hidden lg:inline text-[14px] font-bold text-gray-700 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {displayName}
                  </span>
                  {user?.isPassVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      인증완료
                    </span>
                  )}
                </div>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <button
                  onClick={handleOpenSettings}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-gray-500" />
                  환경 설정
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
