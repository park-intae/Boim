import { Bell, AlertCircle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

// 향후 API나 전역 스토어로 대체될 임시 타입과 데이터
export interface Notification {
  id: string;
  type: 'payment' | 'renewal' | 'info';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: '보험료 납입일 안내',
    message: '내일은 (무)무배당 실손의료보험의 납입일입니다. (예상 금액: 35,000원)',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    isRead: false,
  },
  {
    id: '2',
    type: 'renewal',
    title: '자동차 보험 갱신 안내',
    message: '가입하신 다이렉트 자동차보험의 만기가 한 달 남았습니다. 갱신을 준비해주세요.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2일 전
    isRead: true,
  },
  {
    id: '3',
    type: 'info',
    title: 'Boim 업데이트 안내',
    message: '보험료 분석 기능이 새롭게 추가되었습니다. 지금 바로 확인해보세요!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5일 전
    isRead: true,
  }
];

export function NotificationList({ initialNotifications = dummyNotifications }: { initialNotifications?: Notification[] }) {
  // 컴포넌트 내부에서 임시로 상태 관리 (추후 Zustand 등으로 이동 예정)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'renewal': return <CalendarDays className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      <div className="px-7 py-6 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight">알림</h3>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full">
            {notifications.filter(n => !n.isRead).length}개의 새로운 알림
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => handleRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex gap-4 ${
                notif.isRead 
                  ? 'bg-white border-gray-100 opacity-70 hover:opacity-100' 
                  : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
              }`}
            >
              {!notif.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500" />
              )}
              
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                {getIcon(notif.type)}
              </div>
              
              <div className="flex flex-col flex-1 pr-4">
                <span className={`text-[14px] font-bold mb-1 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notif.title}
                </span>
                <span className="text-[13px] text-gray-500 leading-relaxed mb-2">
                  {notif.message}
                </span>
                <span className="text-[11px] font-semibold text-gray-400">
                  {formatTimeAgo(notif.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 mt-10">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-500">새로운 알림이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
