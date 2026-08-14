import { Bell, ChevronDown, Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-10 border-b border-transparent">
      <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">보험 일정</h2>
      
      <div className="flex items-center flex-shrink-0">
        {/* Icons Area (Moon, Bell) */}
        <div className="flex items-center gap-4 pr-8 border-r border-gray-200">
          <button className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-full flex-shrink-0">
            <Moon className="w-5 h-5" />
          </button>

          <button className="relative w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-full flex-shrink-0">
            <Bell className="w-5 h-5" />
            {/* Notification Dot (Bottom Right) */}
            <div className="absolute bottom-[10px] right-[10px] w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-gray-50" />
          </button>
        </div>
        
        {/* User Profile Area */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-gray-100 py-2 px-5 rounded-full transition-all ml-4 flex-shrink-0 whitespace-nowrap border border-transparent hover:border-gray-200">
          <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[15px] font-bold ring-2 ring-indigo-100 shadow-sm flex-shrink-0">
            박
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[15px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">박인태님</span>
            <ChevronDown className="w-[18px] h-[18px] text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
