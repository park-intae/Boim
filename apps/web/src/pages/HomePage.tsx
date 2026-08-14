import { Shield, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';

const statCards = [
  { id: 1, title: '가입 보험', value: '4', unit: '건', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 2, title: '이번 달 납입', value: '345,000', unit: '원', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 3, title: '갱신 예정', value: '1', unit: '건', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 4, title: '만기 예정', value: '0', unit: '건', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export function HomePage() {
  return (
    <div className="flex flex-col h-full space-y-6 pt-2">
      {/* 4 Summary Cards Area */}
      <div className="grid grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-gray-500">{card.title}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-extrabold text-gray-900 tracking-tight">{card.value}</span>
                <span className="text-[15px] font-bold text-gray-400">{card.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Calendar Area Placeholder */}
      <div className="flex-1 min-h-0 bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] rounded-3xl flex items-center justify-center text-gray-400 font-medium">
        메인 캘린더 영역 (추후 구현)
      </div>
    </div>
  );
}
