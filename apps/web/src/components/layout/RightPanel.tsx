import { Plus, Umbrella, ShieldCheck, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function RightPanel() {
  const isToday = true;
  const selectedDate = new Date();

  // 더미 이벤트 데이터
  const mockEvents = [
    { 
      id: 1, 
      type: 'payment', 
      title: '무배당 실손의료비보험', 
      company: '삼성화재', 
      amount: '125,000', 
      status: '납입 예정',
      icon: Umbrella
    },
    { 
      id: 2, 
      type: 'renewal', 
      title: '다이렉트 자동차보험', 
      company: '현대해상', 
      amount: '850,000', 
      status: '갱신 D-30',
      icon: ShieldCheck
    }
  ];

  return (
    <aside className="w-[380px] flex-shrink-0 pr-10 pb-12 flex flex-col h-full">
      <div className="w-full h-full bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* 1. Header */}
        <div className="px-7 pt-8 pb-5 flex items-center justify-between border-b border-gray-100/60 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              {format(selectedDate, 'M월 d일')}
            </h2>
            {isToday && (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full uppercase tracking-widest">
                Today
              </span>
            )}
          </div>
        </div>

        {/* 2. Event List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {mockEvents.length > 0 ? (
            mockEvents.map((evt) => {
              const Icon = evt.icon;
              return (
                <div 
                  key={evt.id} 
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md
                      ${evt.type === 'payment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
                    `}>
                      {evt.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-gray-500" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-gray-500">{evt.company}</span>
                      <span className="text-[15px] font-bold text-gray-900 line-clamp-1">{evt.title}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-end gap-1 mt-1 pt-3 border-t border-gray-50">
                    <span className="text-[20px] font-extrabold text-gray-900 tracking-tight">{evt.amount}</span>
                    <span className="text-[13px] font-bold text-gray-500">원</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-[14px] font-bold text-gray-500">예정된 일정이 없습니다</p>
              <p className="text-[12px] text-gray-400">평화로운 하루네요!</p>
            </div>
          )}
        </div>

        {/* 3. Bottom Sticky Action Button */}
        <div className="p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent shrink-0">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            새로운 보험 등록
          </button>
        </div>

      </div>
    </aside>
  );
}
