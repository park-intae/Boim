import {
  Bell,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  X,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useTriggerBatch,
} from '../../api/useNotificationQueries';

export function NotificationList() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: triggerBatch, isPending: isBatchRunning } = useTriggerBatch();

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'maturity':
      case 'renewal':
        return <CalendarDays className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
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

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight">
            알림
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[11px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => triggerBatch(undefined)}
            disabled={isBatchRunning}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="스케줄러 알림 즉시 동기화"
          >
            <RefreshCw
              className={`w-4 h-4 ${isBatchRunning ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="text-[12px] font-semibold text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              모두 읽음
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            알림을 불러오는 중...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
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
                <span
                  className={`text-[14px] font-bold mb-1 ${
                    notif.isRead ? 'text-gray-700' : 'text-gray-900'
                  }`}
                >
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
            <p className="text-[14px] font-bold text-gray-500">
              새로운 알림이 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
