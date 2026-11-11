import { Shield, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { MainCalendar } from '../components/calendar/MainCalendar';
import { useGetInsurances } from '../api/useInsuranceQueries';
import { useGetNotifications } from '../api/useNotificationQueries';
import { useAppStore } from '../store/useAppStore';
import { isSameMonth, parseISO } from 'date-fns';

export function HomePage() {
  const { data: insurances = [] } = useGetInsurances();
  const { data: notifications = [] } = useGetNotifications();
  const setPanelMode = useAppStore((state) => state.setPanelMode);

  const activeCount = insurances.length;
  const totalMonthlyPayment = insurances.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  // 갱신/만기 예정 (이번 달에 만기일이 있는 경우)
  const today = new Date();
  let renewalCount = 0;
  
  insurances.forEach((ins) => {
    if (ins.maturityDate) {
      const dateObj = typeof ins.maturityDate === 'string' ? parseISO(ins.maturityDate) : ins.maturityDate;
      if (isSameMonth(dateObj, today)) {
        renewalCount++;
      }
    }
  });

  // 읽지 않은 납입/미납 관련 알림 카운트
  const unpaidCount = notifications.filter(
    (n) => !n.isRead && (n.type === 'payment' || n.title.includes('미납') || n.title.includes('납부') || n.title.includes('납입'))
  ).length;

  const statCards = [
    {
      id: 1,
      title: '가입 보험',
      value: activeCount.toString(),
      unit: '건',
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      onClick: () => setPanelMode('my-insurance'),
    },
    {
      id: 2,
      title: '이번 달 납입',
      value: totalMonthlyPayment.toLocaleString(),
      unit: '원',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => setPanelMode('analysis'),
    },
    {
      id: 3,
      title: '이번 달 갱신/만기',
      value: renewalCount.toString(),
      unit: '건',
      icon: RefreshCw,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      onClick: () => setPanelMode('notifications'),
    },
    {
      id: 4,
      title: '미납 알림',
      value: unpaidCount.toString(),
      unit: '건',
      icon: AlertCircle,
      color: unpaidCount > 0 ? 'text-red-500' : 'text-gray-400',
      bg: unpaidCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      onClick: () => setPanelMode('notifications'),
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-4 lg:space-y-6 pt-2">
      {/* 4 Summary Cards Area */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 active:shadow-sm cursor-pointer flex flex-col gap-3 lg:gap-4"
            >
              <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center shrink-0 ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] lg:text-[12px] font-bold text-gray-500">{card.title}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[18px] lg:text-[22px] font-extrabold text-gray-900 tracking-tight truncate">{card.value}</span>
                  <span className="text-[11px] lg:text-[13px] font-bold text-gray-400 shrink-0">{card.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Calendar Area */}
      <div className="flex-1 min-h-0">
        <MainCalendar />
      </div>
    </div>
  );
}
