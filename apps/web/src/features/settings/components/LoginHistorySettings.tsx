import React, { Suspense } from 'react';
import { ChevronLeft, Monitor, Smartphone } from 'lucide-react';
import { useGetLoginHistory } from '../../../api/useUserQueries';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const LoginHistoryList = () => {
  const { data: history } = useGetLoginHistory();

  if (history.length === 0) {
    return <div className="text-sm text-gray-500 text-center py-10">로그인 기록이 없습니다.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {history.map((record) => (
        <div key={Number(record.id)} className="bg-gray-50 p-4 rounded-2xl flex items-start gap-4">
          <div className="bg-white p-2 rounded-full shadow-sm text-gray-600 shrink-0">
            {record.device.toLowerCase().includes('mac') || record.device.toLowerCase().includes('pc') ? (
              <Monitor className="w-5 h-5" />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[14px] font-bold text-gray-900 truncate">{record.device}</span>
            <span className="text-[12px] text-gray-500 mt-0.5 break-words">{record.location || '알 수 없는 위치'} • {record.ipAddress}</span>
            <span className="text-[11px] text-gray-400 mt-1.5">{format(new Date(record.loginAt), 'yyyy년 MM월 dd일 a h:mm', { locale: ko })}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoginHistorySettings = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[16px] font-bold text-gray-900">로그인 기록</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <Suspense fallback={<div className="text-sm text-gray-500 font-semibold animate-pulse text-center py-10">기록을 불러오는 중...</div>}>
          <LoginHistoryList />
        </Suspense>
      </div>
    </div>
  );
};
