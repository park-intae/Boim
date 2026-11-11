import { X, ChevronUp } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { useGetInsurances } from '../../api/useInsuranceQueries';
import { DailyEventsView } from './DailyEventsView';
import { InsuranceForm } from './InsuranceForm';
import { MyInsuranceList } from './MyInsuranceList';
import { PremiumAnalysis } from './PremiumAnalysis';
import { AiDiagnosisReport } from './AiDiagnosisReport';
import { NotificationList } from './NotificationList';
import { SettingsPanel } from '../../features/settings/components/SettingsPanel';

export function RightPanel() {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const panelMode = useAppStore((state) => state.panelMode);
  const setPanelMode = useAppStore((state) => state.setPanelMode);
  const editingProductId = useAppStore((state) => state.editingProductId);
  const isMobileOpen = useAppStore((state) => state.isMobilePanelOpen);
  const setIsMobileOpen = useAppStore((state) => state.setIsMobilePanelOpen);

  const { data: insurances = [] } = useGetInsurances();
  const isToday = isSameDay(selectedDate, new Date());

  // 모바일 아코디언 토글 배지용 카운트
  const eventCount = insurances.filter(
    (product) =>
      (product.startDate && new Date(product.startDate).getDate() === selectedDate.getDate()) ||
      (product.maturityDate && isSameDay(new Date(product.maturityDate), selectedDate))
  ).length;

  return (
    <>
      {/* Mobile Accordion Toggle Button (Visible only when closed on mobile) */}
      {!isMobileOpen && (
        <div
          className="lg:hidden w-full bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.04)] p-4 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors rounded-t-3xl z-20 shrink-0 mt-auto print:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-gray-900">
              {panelMode === 'form'
                ? '새 보험 등록'
                : panelMode === 'settings'
                ? '설정 보기'
                : `${format(selectedDate, 'M월 d일')} 일정 보기`}
            </span>
            {eventCount > 0 && panelMode === 'view' && (
              <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {eventCount}
              </span>
            )}
          </div>
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Dimmed Background Overlay for Mobile Bottom Sheet */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 print:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Main Panel Content (Slide-up Bottom Sheet on Mobile, Static Aside on PC) */}
      <aside
        className={`
        fixed inset-x-0 bottom-0 z-50 h-[85vh] flex flex-col bg-white rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.12)]
        transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isMobileOpen ? 'translate-y-0' : 'translate-y-full'}
        
        lg:relative lg:inset-auto lg:transform-none lg:h-full lg:shadow-none lg:rounded-none lg:bg-transparent lg:w-[380px] lg:flex-shrink-0 lg:px-0 lg:pr-10 lg:pb-12 lg:z-30 lg:mt-0 lg:transition-none lg:translate-y-0
        print:static print:w-full print:max-w-full print:h-auto print:p-0 print:m-0 print:shadow-none print:transform-none print:overflow-visible print:block
      `}
      >
        {/* Handle for mobile sheet (visual only) */}
        <div className="lg:hidden w-full flex justify-center pt-3 pb-2 shrink-0 print:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="w-full h-full lg:bg-white lg:border lg:border-gray-100 lg:shadow-[0_2px_12px_rgba(0,0,0,0.05)] lg:rounded-3xl flex flex-col overflow-hidden relative print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none print:block">
          {/* Header */}
          <div
            className={`px-6 lg:px-7 pt-4 lg:pt-8 pb-5 flex items-center justify-between border-b border-gray-100/60 bg-white z-10 shrink-0 ${
              panelMode === 'ai-diagnosis' ? 'print:hidden' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] lg:text-[22px] font-extrabold text-gray-900 tracking-tight">
                {panelMode === 'form'
                  ? editingProductId
                    ? '보험 수정'
                    : '보험 등록'
                  : panelMode === 'settings'
                  ? '설정'
                  : panelMode === 'ai-diagnosis'
                  ? 'AI 종합 진단'
                  : format(selectedDate, 'M월 d일')}
              </h2>
              {isToday && panelMode === 'view' && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full uppercase tracking-widest">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {panelMode === 'form' && (
                <button
                  onClick={() => setPanelMode('view')}
                  className="text-[13px] font-bold text-gray-400 hover:text-gray-900 active:scale-95 transition-all"
                >
                  취소
                </button>
              )}
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content by Panel Mode */}
          {panelMode === 'view' ? (
            <DailyEventsView />
          ) : panelMode === 'my-insurance' ? (
            <MyInsuranceList />
          ) : panelMode === 'analysis' ? (
            <PremiumAnalysis />
          ) : panelMode === 'ai-diagnosis' ? (
            <AiDiagnosisReport />
          ) : panelMode === 'notifications' ? (
            <NotificationList />
          ) : panelMode === 'settings' ? (
            <SettingsPanel />
          ) : (
            <InsuranceForm />
          )}
        </div>
      </aside>
    </>
  );
}
