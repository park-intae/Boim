import { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDays } from './CalendarDays';
import { CalendarGrid } from './CalendarGrid';

export function MainCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <CalendarHeader 
        currentDate={currentDate} 
        onPrevMonth={prevMonth} 
        onNextMonth={nextMonth} 
        onToday={today} 
      />
      <CalendarDays />
      <CalendarGrid currentDate={currentDate} />
    </div>
  );
}
