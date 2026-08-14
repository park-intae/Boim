import { Plus, Umbrella, ShieldCheck, ChevronRight, Car, Activity, HeartPulse, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { useGetInsurances, useDeleteInsurance } from '../../api/useInsuranceQueries';
import { InsuranceForm } from './InsuranceForm';
import { MyInsuranceList } from './MyInsuranceList';
import { PremiumAnalysis } from './PremiumAnalysis';
import { NotificationList } from './NotificationList';

export function RightPanel() {
  const selectedDate = useAppStore(state => state.selectedDate);
  const panelMode = useAppStore(state => state.panelMode);
  const setPanelMode = useAppStore(state => state.setPanelMode);
  
  const { data: insurances = [] } = useGetInsurances();
  const { mutate: deleteInsurance } = useDeleteInsurance();
  const isToday = isSameDay(selectedDate, new Date());

  // 카테고리별 아이콘 매핑
  const getCategoryIcon = (category: string) => {
    if (category.includes('실비') || category.includes('의료')) return Umbrella;
    if (category.includes('자동차')) return Car;
    if (category.includes('암') || category.includes('건강')) return Activity;
    if (category.includes('종신')) return HeartPulse;
    return ShieldCheck;
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (window.confirm('정말 이 보험 일정을 삭제하시겠습니까?')) {
      deleteInsurance(id);
    }
  };

  // 선택된 날짜에 해당하는 실제 데이터 필터링
  const dayEvents = insurances.flatMap(product => {
    const events = [];
    if (product.startDate && new Date(product.startDate).getDate() === selectedDate.getDate()) {
      events.push({
        id: product.id.toString(), // DB PK
        eventId: `payment-${product.id}`,
        type: 'payment',
        title: product.name,
        company: product.institution,
        amount: product.monthlyPayment,
        status: '납입 예정',
        icon: getCategoryIcon(product.category)
      });
    }
    if (product.maturityDate && isSameDay(new Date(product.maturityDate), selectedDate)) {
      events.push({
        id: product.id.toString(), // DB PK
        eventId: `renewal-${product.id}`,
        type: 'renewal',
        title: product.name,
        company: product.institution,
        amount: product.monthlyPayment,
        status: '만기/갱신',
        icon: getCategoryIcon(product.category)
      });
    }
    return events;
  });

  return (
    <aside className="w-[380px] flex-shrink-0 pr-10 pb-12 flex flex-col h-full">
      <div className="w-full h-full bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* 1. Header */}
        <div className="px-7 pt-8 pb-5 flex items-center justify-between border-b border-gray-100/60 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              {panelMode === 'form' ? '보험 등록' : format(selectedDate, 'M월 d일')}
            </h2>
            {isToday && panelMode === 'view' && (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full uppercase tracking-widest">
                Today
              </span>
            )}
          </div>
          {panelMode === 'form' && (
            <button 
              onClick={() => setPanelMode('view')}
              className="text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              취소
            </button>
          )}
        </div>

        {/* 2. Content & Bottom Area */}
        {panelMode === 'view' ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {dayEvents.length > 0 ? (
                dayEvents.map((evt) => {
                  const Icon = evt.icon;
                  return (
                    <div 
                      key={evt.eventId} 
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 relative"
                      onClick={() => {
                        // 향후 편집 모드 진입용
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md
                          ${evt.type === 'payment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
                        `}>
                          {evt.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            aria-label="삭제"
                            onClick={(e) => handleDelete(e, evt.id)}
                            className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
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
                        <span className="text-[20px] font-extrabold text-gray-900 tracking-tight">
                          {evt.amount.toLocaleString()}
                        </span>
                        <span className="text-[13px] font-bold text-gray-500">원</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-[14px] font-bold text-gray-500">예정된 일정이 없습니다</p>
                  <p className="text-[12px] text-gray-400 mb-4">새로운 보험을 등록해보세요!</p>
                  <button 
                    onClick={() => setPanelMode('form')}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-bold rounded-lg transition-colors"
                  >
                    새 보험 등록
                  </button>
                </div>
              )}
            </div>
            
            {/* 3. Bottom Sticky Action Button */}
            <div className="p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent shrink-0">
              <button 
                onClick={() => setPanelMode('form')}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                새로운 보험 등록
              </button>
            </div>
          </>
        ) : panelMode === 'my-insurance' ? (
          <MyInsuranceList />
        ) : panelMode === 'analysis' ? (
          <PremiumAnalysis />
        ) : panelMode === 'notifications' ? (
          <NotificationList />
        ) : (
          <InsuranceForm />
        )}

      </div>
    </aside>
  );
}
