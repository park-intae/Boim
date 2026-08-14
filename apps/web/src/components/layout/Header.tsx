import { Bell, ChevronDown, Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-10 border-b border-transparent">
      <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">보험 일정</h2>
      
      <div className="flex items-center">
        {/* Icons Area (Moon, Bell) */}
        <div className="flex items-center gap-2 pr-6 border-r border-gray-200 mr-6">
          <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-full">
            <Moon className="w-5 h-5" />
          </button>

          <div className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all rounded-full cursor-pointer">
            <Bell className="w-5 h-5" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#F9FAFB]" />
          </div>
        </div>
        
        {/* User Profile Area */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-gray-100 py-1.5 px-3 rounded-2xl transition-all -ml-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[15px] font-bold ring-1 ring-indigo-100 shadow-sm">
            박
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">박인태님</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
