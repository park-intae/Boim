import React from 'react';
import { useGetNotificationSettings, useUpdateNotificationSettings } from '../../../api/useUserQueries';

export const NotificationSettingsSection = ({ setActiveView }: { setActiveView: (view: 'menu' | 'profile' | 'password' | 'notificationTime') => void }) => {
  const { data: settings } = useGetNotificationSettings();
  const { mutate: updateSettings } = useUpdateNotificationSettings();

  const toggleSetting = (field: 'pushEnabled' | 'emailEnabled' | 'kakaoEnabled') => {
    updateSettings({ [field]: !settings[field] });
  };

  const getToggleClass = (isOn: boolean) => 
    `flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors ${isOn ? 'bg-indigo-600' : 'bg-gray-200'}`;
  
  const getKnobClass = (isOn: boolean) =>
    `h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`;

  return (
    <div className="flex flex-col space-y-5 bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <span>푸시 알림</span>
        <div className={getToggleClass(settings.pushEnabled)} onClick={() => toggleSetting('pushEnabled')}>
          <div className={getKnobClass(settings.pushEnabled)}></div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <span>이메일 알림</span>
        <div className={getToggleClass(settings.emailEnabled)} onClick={() => toggleSetting('emailEnabled')}>
          <div className={getKnobClass(settings.emailEnabled)}></div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[14px] text-gray-800">
        <span>카카오톡 알림</span>
        <div className={getToggleClass(settings.kakaoEnabled)} onClick={() => toggleSetting('kakaoEnabled')}>
          <div className={getKnobClass(settings.kakaoEnabled)}></div>
        </div>
      </div>
      <button 
        onClick={() => setActiveView('notificationTime')}
        className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors"
      >
        <span>방해 금지 시간 설정</span>
        <span className="text-gray-400 text-xs">
          {settings.quietHoursStart ? `${settings.quietHoursStart} ~ ${settings.quietHoursEnd}` : '설정 안 함'} &gt;
        </span>
      </button>
    </div>
  );
};
