import { Bell, User } from 'lucide-react';

export function UserProfile() {
  return (
    <header className="h-20 flex items-center justify-end px-6 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm group-hover:shadow transition-all">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
