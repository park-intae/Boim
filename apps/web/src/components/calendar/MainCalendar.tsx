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
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[120px] p-2 border-r border-b border-gray-100 transition-colors cursor-pointer group hover:bg-gray-50
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
            {/* Event dots will go here later */}
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
