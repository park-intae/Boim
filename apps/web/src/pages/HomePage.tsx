export function HomePage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 4 Summary Cards Area Placeholder */}
      <div className="w-full h-[100px] border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-400 font-medium">
        상단 요약 카드 4개 영역
      </div>
      
      {/* Calendar Area Placeholder */}
      <div className="flex-1 min-h-0 border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-400 font-medium bg-white">
        메인 캘린더 영역
      </div>
    </div>
  );
}
