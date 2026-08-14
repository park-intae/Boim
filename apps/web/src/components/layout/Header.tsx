import { Bell, ChevronDown, Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-10 border-b border-transparent">
      <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">보험 일정</h2>
      
      <div className="flex items-center justify-between w-[200px] shrink-0">
        
        {/* Icons Group */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-full shrink-0">
            <Moon className="w-5 h-5" />
          </button>

          <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors rounded-full shrink-0">
            <Bell className="w-5 h-5" />
            <div className="absolute top-[8px] right-[10px] w-2 h-2 bg-amber-500 rounded-full ring-2 ring-gray-50" />
          </button>
        </div>
        
        {/* Vertical Divider */}
        <div className="h-5 w-px bg-gray-200 shrink-0" />
        
        {/* User Profile Pill */}
        <button className="flex items-center gap-2.5 cursor-pointer group hover:bg-gray-100 py-1.5 pl-1.5 pr-4 rounded-full transition-colors shrink-0 outline-none">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[14px] font-bold ring-1 ring-indigo-100/50 shadow-sm shrink-0">
            박
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[14px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">박인태님</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>
        
      </div>
    </header>
  );
}
