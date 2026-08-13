import { Calendar, Home, FileText, Settings, ShieldAlert } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const menuItems = [
    { name: '대시보드', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: '보험 캘린더', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: '가입 현황', path: '/insurance', icon: <ShieldAlert className="w-5 h-5" /> },
    { name: '청구 서류', path: '/documents', icon: <FileText className="w-5 h-5" /> },
    { name: '설정', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-brand-dark text-white h-screen flex flex-col shrink-0">
      <div className="p-6 text-2xl font-bold border-b border-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-primary rounded-lg"></div>
        Boim
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                isActive ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
