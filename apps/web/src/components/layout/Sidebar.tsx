import { Calendar, Shield, PieChart, Bell, Settings, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SummaryCard } from './SummaryCard';

export function Sidebar() {
  const menuItems = [
    { name: '보험 일정', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: '내 보험', path: '/insurance', icon: <Shield className="w-5 h-5" /> },
    { name: '보험료 분석', path: '/analysis', icon: <PieChart className="w-5 h-5" /> },
    { name: '알림', path: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: '설정', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-[247px] bg-white h-screen flex flex-col shrink-0 border-r border-brand-gray-100 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      <div className="pt-[48px] px-7 flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-brand-gray-900" />
        <span className="text-[21px] font-bold text-brand-gray-900 tracking-tight">보험 관리</span>
      </div>
      
      <nav className="mt-[72px] px-4 space-y-[1px] flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 h-[58px] rounded-2xl transition-colors duration-200 font-medium text-[15px] ${
                isActive
                  ? 'bg-brand-50 text-brand-800 font-bold'
                  : 'text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-gray-900'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* SummaryCard placed at the bottom inside the sidebar */}
      <div className="px-4 pb-[40px] mt-auto">
        <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-500 rounded-2xl">오류</div>}>
          <Suspense fallback={<div className="h-[170px] bg-brand-gray-50 animate-pulse rounded-2xl" />}>
            <SummaryCard />
          </Suspense>
        </ErrorBoundary>
      </div>
    </aside>
  );
}
