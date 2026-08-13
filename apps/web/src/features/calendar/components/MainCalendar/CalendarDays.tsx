export function CalendarDays() {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  return (
    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 shrink-0">
      {weekDays.map((wd, i) => (
        <div key={wd} className={`py-3 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
          {wd}
        </div>
      ))}
    </div>
  );
}
