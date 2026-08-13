import { ChevronRight, Plus } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';

const fetchEventsMock = async () => {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 1, type: '납입', title: '삼성화재 건강보험', subtitle: '85,000원 · 월 보험료 납입일', status: '납입 완료' },
    { id: 2, type: '갱신', title: 'KB손해보험 운전자보험', subtitle: '갱신 예정 · 8월 20일', status: '상세 보기' },
  ]), 500));
};

export function UpcomingEvents() {
  const { data: events } = useSuspenseQuery({
    queryKey: ['insurance', 'events'],
    queryFn: fetchEventsMock,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-[20px] p-6 border border-brand-gray-200 shadow-sm flex flex-col gap-[28px]">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[18px] font-bold text-brand-gray-900 flex items-center gap-2 tracking-tight">
              8월 12일 (수)
            </h2>
            <p className="text-[15px] font-bold text-brand-gray-900 mt-2">
              오늘의 일정 <span className="text-brand-gray-500">2건</span>
            </p>
          </div>
          <button className="text-[12px] font-medium text-brand-gray-700 hover:text-brand-gray-900 flex items-center gap-1 bg-white border border-brand-gray-300 rounded-lg px-[12px] py-[6px] transition-colors">
            + 보험 등록
          </button>
        </div>

        {/* Event Cards */}
        <div className="flex flex-col gap-4">
          {events.map((event: any) => {
            const isPayment = event.type === '납입';
            const bgClass = isPayment ? 'bg-[#F8FAFF]' : 'bg-[#FFFAF5]';
            const borderClass = isPayment ? 'border-[#DDE5FF]' : 'border-[#FDE3C2]';
            
            return (
              <div key={event.id} className={`${bgClass} rounded-2xl p-[18px] border ${borderClass} flex flex-col gap-[10px] cursor-pointer hover:shadow-md transition-all`}>
                <span className={`text-[12px] font-bold ${isPayment ? 'text-status-info-text' : 'text-status-warning-text'}`}>
                  {event.type}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-bold text-brand-gray-900">{event.title}</h3>
                  <p className="text-[13px] text-brand-gray-600">{event.subtitle}</p>
                </div>
                <div className="flex justify-end pt-1">
                  {event.status === '납입 완료' ? (
                    <span className="text-[11px] font-bold text-status-success-text bg-status-success-bg px-2 py-1 rounded-[6px]">
                      {event.status}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-brand-gray-600 flex items-center group">
                      {event.status}
                      <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Links as Block Buttons */}
      <button className="w-full h-[52px] bg-white border border-brand-gray-200 rounded-[12px] flex items-center justify-center text-[13px] font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors group">
        해당 날짜 일정 전체 보기
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
      <button className="w-full h-[52px] bg-white border border-brand-gray-200 rounded-[12px] flex items-center justify-center text-[13px] font-medium text-brand-gray-700 hover:bg-brand-gray-50 transition-colors group">
        내 보험 전체 보기
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
