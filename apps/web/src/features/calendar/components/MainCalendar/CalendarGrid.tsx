import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  addDays
} from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
}

export function CalendarGrid({ currentDate }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 0 }); // 일요일 시작
  const endDate = endOfWeek(monthEnd, { weekStarts: 0 });

  const dateFormat = 'd';
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, dateFormat);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      
      days.push(
        <div
          key={day.toString()}
          className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 flex flex-col ${
            !isCurrentMonth
              ? 'text-gray-300 bg-gray-50/50'
              : isToday
              ? 'bg-brand-primary/5 text-brand-primary font-bold'
              : 'text-gray-700'
          }`}
        >
          <span className={`text-sm ml-1 mt-1 ${!isCurrentMonth ? '' : i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}>
            {formattedDate}
          </span>
          <div className="flex-1 mt-2 space-y-1 overflow-y-auto">
             {/* 예시 더미 뱃지 */}
             {isToday && (
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

  return (
    <div className="flex-1 overflow-y-auto">
      {rows}
    </div>
  );
}
