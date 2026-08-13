import { useState } from 'react';
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
  addDays
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MainCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 0 }); // 일요일 시작
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 });

  const dateFormat = 'd';
  const rows = [];

  let days = [];
  let day = startDate;
  let formattedDate = '';

  // 캘린더 날짜 렌더링 루프
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      days.push(
        <div
          key={day.toString()}
          className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 flex flex-col ${
            !isSameMonth(day, monthStart)
              ? 'text-gray-300 bg-gray-50/50'
              : isSameDay(day, new Date())
              ? 'bg-brand-primary/5 text-brand-primary font-bold'
              : 'text-gray-700'
          }`}
        >
          <span className={`text-sm ml-1 mt-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}>
            {formattedDate}
          </span>
          {/* 일정/보험 뱃지가 들어갈 영역 */}
          <div className="flex-1 mt-2 space-y-1 overflow-y-auto">
             {/* 예시 더미 뱃지 (오늘 날짜에만 테스트 출력) */}
             {isSameDay(day, new Date()) && (
                <div className="text-xs bg-brand-primary/90 text-white px-2 py-1 rounded-md shadow-sm truncate">
                  보험료 납입일
                </div>
             )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 font-medium text-sm"
          >
            오늘
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {weekDays.map((wd, i) => (
          <div key={wd} className={`py-3 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {wd}
          </div>
        ))}
      </div>
      
      {/* 캘린더 바디 */}
      <div className="flex-1 overflow-y-auto">
        {rows}
      </div>
    </div>
  );
}
