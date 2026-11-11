import { useGetNotificationSettings, useUpdateNotificationSettings } from '../../../api/useUserQueries';
import { PushNotificationItem } from './PushNotificationItem';
import { EmailNotificationItem } from './EmailNotificationItem';

export const NotificationSettingsSection = ({
  setActiveView,
}: {
  setActiveView: (view: 'menu' | 'profile' | 'password' | 'notificationTime') => void;
}) => {
  const { data: settings } = useGetNotificationSettings();
  const { mutate: updateSettings } = useUpdateNotificationSettings();

  const handlePushToggle = (nextState: boolean) => {
    updateSettings({ pushEnabled: nextState });
  };

  const handleEmailToggle = () => {
    updateSettings({ emailEnabled: !settings.emailEnabled });
  };

  const handleKakaoToggle = () => {
    updateSettings({ kakaoEnabled: !settings.kakaoEnabled });
  };

  return (
    <div className="flex flex-col space-y-5 bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* 1. 웹 브라우저 데스크톱 푸시 알림 (탈착형) */}
      <PushNotificationItem
        enabled={settings.pushEnabled}
        onToggle={handlePushToggle}
      />

      {/* 2. 이메일 알림 (탈착형 컴포넌트: 기능 비활성화 시 이 줄만 주석/제거 가능) */}
      <EmailNotificationItem
        enabled={settings.emailEnabled}
        onToggle={handleEmailToggle}
      />

      {/* 3. 카카오톡 알림 */}
      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <div className="flex flex-col">
          <span className="font-medium">카카오톡 알림</span>
          <span className="text-xs text-gray-400">카카오 알림톡으로 알림 수신</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.kakaoEnabled}
          aria-label="카카오톡 알림 토글"
          className={`flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
            settings.kakaoEnabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          onClick={handleKakaoToggle}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              settings.kakaoEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 4. 방해 금지 시간 설정 */}
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
