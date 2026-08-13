import { MainCalendar } from '../features/calendar/components/MainCalendar';

export function HomePage() {
  return (
    <div className="h-full flex flex-col p-8 bg-gray-50/30">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">내 보험 캘린더</h1>
      </div>
      <div className="flex-1 min-h-0">
        <MainCalendar />
      </div>
    </div>
  );
}
