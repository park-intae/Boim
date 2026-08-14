import { CalendarDays, ShieldCheck, Activity, Bell, Settings } from 'lucide-react';

export function Sidebar() {
  const activeMenu = '보험 일정';

  const menuItems = [
    { name: '보험 일정', icon: CalendarDays },
    { name: '내 보험', icon: ShieldCheck },
    { name: '보험료 분석', icon: Activity },
    { name: '알림', icon: Bell },
    { name: '설정', icon: Settings },
  ];

  return (
    <aside className="w-[260px] h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      
      {/* 1. Logo Area */}
      <div className="h-[60px] flex items-center px-10 shrink-0">
        <h1 className="text-[24px] font-extrabold text-indigo-600 tracking-tight">Boim</h1>
      </div>
      
      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activeMenu;
          return (
            <div
              key={item.name}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-[20px] h-[20px] ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className="text-[15px]">{item.name}</span>
            </div>
          );
        })}
      </nav>

      {/* 3. Bottom Summary Panel */}
      <div className="p-8 pt-0 shrink-0">
        <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100/80 shadow-sm flex flex-col gap-4">
          
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-500">내 보험 요약</span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded-full">User</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-gray-500 font-medium">이번 달 총 납입액</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[20px] font-bold text-gray-900 tracking-tight">345,000</span>
              <span className="text-[14px] font-semibold text-gray-500">원</span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200/60" />

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-500 font-medium">유지 중인 보험</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[14px] font-bold text-gray-800">4</span>
              <span className="text-[12px] font-medium text-gray-500">건</span>
            </div>
          </div>

        </div>
      </div>
      
    </aside>
  );
}
