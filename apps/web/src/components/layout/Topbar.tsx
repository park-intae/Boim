import { Bell, User } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
      <div className="text-xl font-semibold text-gray-800">
        환영합니다, 사용자님 👋
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 bg-brand-tertiary rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity">
          <User className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
