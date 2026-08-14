import { Bell, AlertCircle, CalendarDays, CheckCircle2, X } from 'lucide-react';
import { useGetNotifications, useMarkNotificationRead, useDeleteNotification } from '../../api/useNotificationQueries';

export function NotificationList() {
  const { data: notifications = [] } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'renewal': return <CalendarDays className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleRead = (id: string) => {
    markAsRead(id);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
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
                <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-red-500" />
              )}
              
              <button 
                onClick={(e) => handleRemove(e, notif.id)}
                className="absolute top-3 right-3 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                aria-label="알림 제거"
              >
                <X className="w-4 h-4" />
              </button>
              
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
