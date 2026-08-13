import { ChevronRight, Plus, X } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';

const fetchUpcomingMock = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([
    {
      id: 1,
      type: '납입',
      title: '삼성화재 건강보험',
      subtitle: '85,000원 · 월 보험료 납입일',
      status: '납입 완료',
    },
    {
      id: 2,
      type: '갱신',
      title: 'KB손해보험 운전자보험',
      subtitle: '갱신 예정 · 8월 20일',
      status: '상세 보기',
    }
  ]), 500));
};

export function UpcomingEvents() {
  const { data: events } = useSuspenseQuery({
    queryKey: ['insurance', 'upcoming'],
    queryFn: fetchUpcomingMock,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            8월 12일 (수)
          </h2>
          <p className="text-sm font-bold text-gray-900 mt-1">오늘의 일정 2건</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
            보험 등록
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Event Cards */}
      <div className="flex flex-col gap-3">
        {events.map((event: any) => (
          <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3">
            <span className={`text-xs font-bold ${event.type === '납입' ? 'text-blue-600' : 'text-amber-600'}`}>
              {event.type}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.subtitle}</p>
            </div>
            <div className="flex justify-end pt-1">
              {event.status === '납입 완료' ? (
                <span className="text-[13px] font-bold text-green-800 bg-green-50 px-2 py-1 rounded-md">
                  {event.status}
                </span>
              ) : (
                <span className="text-[13px] font-medium text-gray-600 flex items-center group">
                  {event.status}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group mt-2 pl-2">
        해당 날짜 일정 전체 보기
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
