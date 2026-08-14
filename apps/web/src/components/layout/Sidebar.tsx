export function Sidebar() {
  return (
    <aside className="w-[260px] h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo Area */}
      <div className="p-8 pb-4">
        <h1 className="text-[20px] font-bold text-gray-900">보험 관리</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold cursor-pointer">
          보험 일정
        </div>
        <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium cursor-pointer">
          내 보험
        </div>
        <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium cursor-pointer">
          보험료 분석
        </div>
        <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium cursor-pointer">
          알림
        </div>
        <div className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium cursor-pointer">
          설정
        </div>
      </nav>

      {/* Bottom Summary Placeholder */}
      <div className="p-6">
        <div className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
          내 보험 요약 영역
        </div>
      </div>
    </aside>
  );
}
