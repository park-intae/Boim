import { Bell, ChevronDown, Moon, Menu, X, CalendarDays, ShieldCheck, Activity, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      
      <div className="flex items-center justify-end gap-2 lg:gap-4 shrink-0">
        
        <button className="hidden lg:flex w-10 h-10 items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-full shrink-0">
          <Moon className="w-5 h-5" />
        </button>

        <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-full shrink-0">
          <Bell className="w-5 h-5" />
          <div className="absolute top-[8px] right-[10px] w-2 h-2 bg-amber-500 rounded-full ring-2 ring-gray-50" />
        </button>
        
        {/* User Profile Pill (Hidden on mobile to save space) */}
        <button className="hidden lg:flex items-center gap-2.5 cursor-pointer group hover:bg-gray-100 py-1.5 pl-1.5 pr-4 rounded-full transition-colors shrink-0 outline-none">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[14px] font-bold ring-1 ring-indigo-100/50 shadow-sm shrink-0">
            박
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">박인태님</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>

        {/* Mobile Hamburger Menu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
