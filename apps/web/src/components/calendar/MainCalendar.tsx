import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { useGetInsurances } from '../../api/useInsuranceQueries';

export function MainCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedDate = useAppStore(state => state.selectedDate);
  const setSelectedDate = useAppStore(state => state.setSelectedDate);
  const setPanelMode = useAppStore(state => state.setPanelMode);

  const { data: insurances = [] } = useGetInsurances();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextYear = () => setCurrentDate(addYears(currentDate, 1));
  const prevYear = () => setCurrentDate(subYears(currentDate, 1));
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setPanelMode('view');
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-100 gap-3 sm:gap-0">
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <h2 className="text-[20px] lg:text-[22px] font-extrabold text-gray-900 tracking-tight">
          {format(currentDate, 'yyyy년 M월')}
        </h2>
        {/* 모바일 전용 추가 버튼 */}
        <button
          onClick={() => setPanelMode('form')}
          className="sm:hidden flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2">
        {/* PC 전용 추가 버튼 */}
        <button
          onClick={() => setPanelMode('form')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
        <div className="flex items-center justify-between w-full sm:w-auto gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
          <button
            onClick={prevYear}
            title="이전 연도"
            className="flex-1 sm:flex-none flex justify-center p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={prevMonth}
            title="이전 달"
            className="flex-1 sm:flex-none flex justify-center p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            title="다음 달"
            className="flex-1 sm:flex-none flex justify-center p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={nextYear}
            title="다음 연도"
            className="flex-1 sm:flex-none flex justify-center p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
      {weekDays.map((day, i) => (
        <div
          key={i}
          className={`py-3 text-center text-[13px] font-bold ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  );

  const renderCells = () => {
    // API 데이터를 순회하며 현재 달력 범위(startDate ~ endDate)에 해당하는 이벤트를 매핑합니다.
    const apiEvents: Record<string, { type: 'payment' | 'renewal' | 'info', label: string }[]> = {};
    
    insurances.forEach(product => {
      // 1. 매월 납입일 (startDate의 '일' 기준)
      if (product.startDate) {
        const paymentDay = new Date(product.startDate).getDate();
        // 현재 보여지는 달력의 각 달력 일자들과 비교하여 납입일 매핑 (보통 한 달력 뷰에 1~2개의 같은 날짜가 존재)
        let tempDay = startDate;
        while (tempDay <= endDate) {
          if (tempDay.getDate() === paymentDay) {
            const dKey = format(tempDay, 'yyyy-MM-dd');
            if (!apiEvents[dKey]) apiEvents[dKey] = [];
            apiEvents[dKey].push({ type: 'payment', label: `${product.name} 납입` });
          }
          tempDay = addDays(tempDay, 1);
        }
      }
      // 2. 만기/갱신일
      if (product.maturityDate) {
        const mDate = new Date(product.maturityDate);
        if (mDate >= startDate && mDate <= endDate) {
          const dKey = format(mDate, 'yyyy-MM-dd');
          if (!apiEvents[dKey]) apiEvents[dKey] = [];
          apiEvents[dKey].push({ type: 'renewal', label: `${product.name} 만기` });
        }
      }
    });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        
        const dayEvents = apiEvents[dateKey] || [];
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors cursor-pointer group hover:bg-gray-50 flex flex-col gap-1.5
              ${!isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'}
              ${i === 6 ? 'border-r-0' : ''}
            `}
          >
            <div className="flex justify-between items-start">
              <span
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-[14px] font-semibold
                  ${!isCurrentMonth ? 'text-gray-300' : i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'}
                  ${isToday ? 'bg-indigo-50 text-indigo-700' : ''}
                  ${isSelected ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1' : ''}
                `}
              >
                {formattedDate}
              </span>
            </div>
            
            {/* 2. Event Badges Area */}
            <div className="flex flex-col gap-1 mt-1 px-1">
              {dayEvents.map((evt, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold truncate transition-all
                    ${evt.type === 'payment' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : ''}
                    ${evt.type === 'renewal' ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : ''}
                    ${evt.type === 'info' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' : ''}
                  `}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0
                    ${evt.type === 'payment' ? 'bg-emerald-500' : ''}
                    ${evt.type === 'renewal' ? 'bg-amber-500' : ''}
                    ${evt.type === 'info' ? 'bg-indigo-500' : ''}
                  `} />
                  <span className="truncate">{evt.label}</span>
                </div>
              ))}
            </div>

          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex-1 overflow-y-auto">{rows}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-3xl overflow-hidden">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
