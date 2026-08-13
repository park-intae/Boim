import { Bell, User } from 'lucide-react';

export function RightSidebar() {
  return (
    <aside className="w-80 bg-gray-50 h-screen flex flex-col border-l border-gray-200 shrink-0">
      <header className="h-20 flex items-center justify-end px-6 border-b border-gray-200 bg-white">
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
      
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="font-bold text-gray-800 text-lg mb-4">요약 정보</h3>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 transition-transform hover:-translate-y-1">
          <p className="text-sm text-gray-500 mb-1">이번 달 총 납입액</p>
          <p className="text-2xl font-bold text-brand-primary">0<span className="text-lg font-medium text-gray-600 ml-1">원</span></p>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-4 mt-8">다가오는 일정</h3>
        <div className="text-sm text-gray-500 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          등록된 일정이 없습니다.
        </div>
      </div>
    </aside>
  );
}
