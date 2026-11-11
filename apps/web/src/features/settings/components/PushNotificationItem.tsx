import { useState } from 'react';
import {
  isNotificationSupported,
  requestNotificationPermission,
  showDesktopNotification,
  getNotificationPermission,
} from '../../../shared/utils/webNotification';

interface PushNotificationItemProps {
  enabled: boolean;
  onToggle: (nextState: boolean) => void;
}

export const PushNotificationItem = ({ enabled, onToggle }: PushNotificationItemProps) => {
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const handleToggle = async () => {
    const nextState = !enabled;

    if (nextState) {
      if (!isNotificationSupported()) {
        setPermissionNotice('현재 브라우저는 데스크톱 알림을 지원하지 않습니다.');
        return;
      }

      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setPermissionNotice(null);
        onToggle(true);
        showDesktopNotification('Boim 알림 활성화', {
          body: '이제 중요한 보험 납입일과 만기 알림을 실시간으로 받아보실 수 있습니다.',
        });
      } else if (permission === 'denied') {
        setPermissionNotice('브라우저 설정에서 알림 권한이 차단되어 있습니다.');
      } else {
        setPermissionNotice('알림 권한 요청이 취소되었습니다.');
      }
    } else {
      setPermissionNotice(null);
      onToggle(false);
    }
  };

  const currentPermission = getNotificationPermission();

  return (
    <div>
      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <div className="flex flex-col">
          <span className="font-medium">푸시 알림</span>
          <span className="text-xs text-gray-400">
            {currentPermission === 'denied' ? '브라우저 권한 차단됨' : '웹 브라우저 데스크톱 알림'}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="푸시 알림 토글"
          className={`flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          onClick={handleToggle}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {permissionNotice && (
        <p className="mt-2 text-xs text-rose-500 font-medium bg-rose-50 p-2 rounded-lg" role="alert">
          {permissionNotice}
        </p>
      )}
    </div>
  );
};
