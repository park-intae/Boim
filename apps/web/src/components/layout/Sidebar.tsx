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
    <aside className="w-[260px] h-full bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      
      {/* 1. Logo Area */}
      <div className="h-[84px] flex items-center px-8 shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[16px] shadow-sm">
            B
          </div>
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Boim</h1>
        </div>
      </div>
      
      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activeMenu;
          return (
            <div
              key={item.name}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-900'
              }`}
            >
              <Icon 
                className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {item.name}
              </span>
            </div>
          );
        })}
      </nav>

      {/* 3. Bottom Summary Panel */}
      <div className="p-5 shrink-0">
        <div className="w-full bg-gray-50/50 rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:bg-white cursor-pointer group">
          
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-600">내 보험 요약</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">User</span>
          </div>
          
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-gray-500 font-medium">이번 달 총 납입액</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-extrabold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">345,000</span>
              <span className="text-[14px] font-bold text-gray-500">원</span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200/50 my-1" />

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-500 font-medium">유지 중인 보험</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[14px] font-bold text-gray-800">4</span>
              <span className="text-[12px] font-medium text-gray-500">건</span>
            </div>
          </div>

        </div>
      </div>
      
    </aside>
  );
}
