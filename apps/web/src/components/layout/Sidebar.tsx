import { Calendar, Shield, PieChart, Bell, Settings, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const menuItems = [
    { name: '보험 일정', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: '내 보험', path: '/insurance', icon: <Shield className="w-5 h-5" /> },
    { name: '보험료 분석', path: '/analysis', icon: <PieChart className="w-5 h-5" /> },
    { name: '알림', path: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: '설정', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-[247px] bg-white h-screen flex flex-col shrink-0 border-r border-gray-100">
      <div className="pt-10 pb-10 px-8 flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-gray-900" />
        <span className="text-[21px] font-bold text-gray-900 tracking-tight">보험 관리</span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 font-medium text-[15px] ${
                isActive
                  ? 'bg-indigo-50 text-indigo-800 font-bold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
