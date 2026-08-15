import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useGetNotificationSettings, useUpdateNotificationSettings } from '../../../api/useUserQueries';

export const NotificationTimeSettings = ({ onBack }: { onBack: () => void }) => {
  const { data: settings } = useGetNotificationSettings();
  const { mutate: updateSettings } = useUpdateNotificationSettings();

  const [start, setStart] = useState(settings.quietHoursStart || '22:00');
  const [end, setEnd] = useState(settings.quietHoursEnd || '08:00');
  
  // 방해 금지 모드 활성화 여부 (값이 둘 다 없으면 비활성)
  const isEnabled = settings.quietHoursStart !== null && settings.quietHoursEnd !== null;

  const toggleEnabled = () => {
    if (isEnabled) {
      updateSettings({ quietHoursStart: null, quietHoursEnd: null });
    } else {
      updateSettings({ quietHoursStart: start, quietHoursEnd: end });
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStart(value);
      if (isEnabled) updateSettings({ quietHoursStart: value });
    } else {
      setEnd(value);
      if (isEnabled) updateSettings({ quietHoursEnd: value });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[16px] font-bold text-gray-900">방해 금지 시간 설정</h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-gray-800">방해 금지 모드 켜기</div>
            <div className="text-[12px] text-gray-500 mt-1">설정한 시간 동안에는 푸시 알림이 울리지 않습니다.</div>
          </div>
          <div 
            onClick={toggleEnabled}
            className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </div>

        {isEnabled && (
          <div className="bg-gray-50 p-5 rounded-2xl flex flex-col gap-5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-gray-700">시작 시간</span>
              <input 
                type="time" 
                value={start}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="bg-transparent text-[15px] font-semibold text-gray-900 outline-none text-right w-24 sm:w-32"
              />
            </div>
            <div className="h-[1px] bg-gray-200/60 w-full"></div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-gray-700">종료 시간</span>
              <input 
                type="time" 
                value={end}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                className="bg-transparent text-[15px] font-semibold text-gray-900 outline-none text-right w-24 sm:w-32"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
