import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';

export function MainCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const renderHeader = () => (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
          {format(currentDate, 'yyyy년 M월')}
        </h2>
      </div>
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
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
    // 1. 더미 데이터 생성 (날짜 문자열 기반)
    // 실제 환경에서는 서버에서 받아온 데이터를 이 형태로 가공하여 사용합니다.
    const mockEvents: Record<string, { type: 'payment' | 'renewal' | 'info', label: string }[]> = {
      [format(new Date(), 'yyyy-MM-dd')]: [{ type: 'payment', label: '실손보험 납입' }],
      [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: [{ type: 'renewal', label: '자동차보험 갱신' }],
      [format(addDays(new Date(), 5), 'yyyy-MM-dd')]: [
        { type: 'payment', label: '암보험 납입' },
        { type: 'info', label: '보장 분석 리포트' }
      ],
      [format(subMonths(new Date(), 0).setDate(15), 'yyyy-MM-dd')]: [{ type: 'payment', label: '종신보험 납입' }]
    };

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
        
        const dayEvents = mockEvents[dateKey] || [];
        
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
