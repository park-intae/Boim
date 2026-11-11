import { useState } from 'react';
import { useGetNotificationSettings, useUpdateNotificationSettings } from '../../../api/useUserQueries';
import {
  isNotificationSupported,
  requestNotificationPermission,
  showDesktopNotification,
  getNotificationPermission,
} from '../../../shared/utils/webNotification';

export const NotificationSettingsSection = ({ setActiveView }: { setActiveView: (view: 'menu' | 'profile' | 'password' | 'notificationTime') => void }) => {
  const { data: settings } = useGetNotificationSettings();
  const { mutate: updateSettings } = useUpdateNotificationSettings();
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const handlePushToggle = async () => {
    const nextState = !settings.pushEnabled;

    if (nextState) {
      if (!isNotificationSupported()) {
        setPermissionNotice('현재 브라우저는 데스크톱 알림을 지원하지 않습니다.');
        return;
      }

      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setPermissionNotice(null);
        updateSettings({ pushEnabled: true });
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
      updateSettings({ pushEnabled: false });
    }
  };

  const toggleSetting = (field: 'emailEnabled' | 'kakaoEnabled') => {
    updateSettings({ [field]: !settings[field] });
  };

  const getToggleClass = (isOn: boolean) => 
    `flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors ${isOn ? 'bg-indigo-600' : 'bg-gray-200'}`;
  
  const getKnobClass = (isOn: boolean) =>
    `h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`;

  const currentPermission = getNotificationPermission();

  return (
    <div className="flex flex-col space-y-5 bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
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
            aria-checked={settings.pushEnabled}
            aria-label="푸시 알림 토글"
            className={getToggleClass(settings.pushEnabled)}
            onClick={handlePushToggle}
          >
            <div className={getKnobClass(settings.pushEnabled)}></div>
          </button>
        </div>
        {permissionNotice && (
          <p className="mt-2 text-xs text-rose-500 font-medium bg-rose-50 p-2 rounded-lg" role="alert">
            {permissionNotice}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <span className="font-medium">이메일 알림</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.emailEnabled}
          aria-label="이메일 알림 토글"
          className={getToggleClass(settings.emailEnabled)}
          onClick={() => toggleSetting('emailEnabled')}
        >
          <div className={getKnobClass(settings.emailEnabled)}></div>
        </button>
      </div>

      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <span className="font-medium">카카오톡 알림</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.kakaoEnabled}
          aria-label="카카오톡 알림 토글"
          className={getToggleClass(settings.kakaoEnabled)}
          onClick={() => toggleSetting('kakaoEnabled')}
        >
          <div className={getKnobClass(settings.kakaoEnabled)}></div>
        </button>
      </div>

      <button 
        type="button"
        onClick={() => setActiveView('notificationTime')}
        className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors pt-2 border-t border-gray-100"
      >
        <span>방해 금지 시간 설정</span>
        <span className="text-gray-400 text-xs">
          {settings.quietHoursStart ? `${settings.quietHoursStart} ~ ${settings.quietHoursEnd}` : '설정 안 함'} &gt;
        </span>
      </button>
    </div>
  );
};
