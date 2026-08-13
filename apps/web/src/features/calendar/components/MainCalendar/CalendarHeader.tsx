import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
      <h2 className="text-2xl font-bold text-gray-800">
        {format(currentDate, 'yyyy년 M월', { locale: ko })}
      </h2>
      <div className="flex gap-2">
        <button 
          onClick={onPrevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={onToday}
          className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 font-medium text-sm"
        >
          오늘
        </button>
        <button 
          onClick={onNextMonth}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
