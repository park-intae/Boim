import { Bell, ChevronDown, Moon, Menu, X, CalendarDays, ShieldCheck, Activity, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const panelMode = useAppStore(state => state.panelMode);
  const setPanelMode = useAppStore(state => state.setPanelMode);
  const activeMenu = panelMode === 'my-insurance' ? '내 보험' : panelMode === 'analysis' ? '보험료 분석' : panelMode === 'notifications' ? '알림' : panelMode === 'settings' ? '설정' : '보험 일정';

  const menuItems = [
    { name: '보험 일정', icon: CalendarDays, action: () => setPanelMode('view') },
    { name: '내 보험', icon: ShieldCheck, action: () => setPanelMode('my-insurance') },
    { name: '보험료 분석', icon: Activity, action: () => setPanelMode('analysis') },
    { name: '알림', icon: Bell, action: () => setPanelMode('notifications') },
    { name: '설정', icon: Settings, action: () => setPanelMode('settings') },
  ];

  const handleMenuClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="relative h-[60px] flex-shrink-0 flex items-center justify-between px-4 lg:px-10 border-b border-transparent z-40">
      <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">보험 일정</h2>
      
      <nav className="hidden lg:flex items-center gap-6 text-[14px] font-bold text-gray-500">
        <a href="#" className="text-gray-900 transition-colors">캘린더</a>
        <a href="#" className="hover:text-gray-900 transition-colors">내 보험</a>
        <a href="#" className="hover:text-gray-900 transition-colors">청구 내역</a>
      </nav>

      {/* Right Icons (Mobile & PC) */}
      <div className="flex items-center gap-1.5 lg:gap-3">
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setHasNewNotification(false);
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 active:bg-gray-100 rounded-full transition-all duration-200 relative"
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
        
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-[13px]">
            박
          </div>
          <span className="text-[14px] font-bold text-gray-700">박인태</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 active:bg-gray-100 rounded-full transition-all duration-200"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Accordion Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-white border-b border-gray-100 shadow-lg lg:hidden px-4 py-2 flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.name === activeMenu;
            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.action)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
