import React, { useState, Suspense } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { ProfileSettings } from './ProfileSettings';
import { PasswordSettings } from './PasswordSettings';
import { NotificationSettingsSection } from './NotificationSettingsSection';
import { NotificationTimeSettings } from './NotificationTimeSettings';
import { PolicyViewer } from './PolicyViewer';
import { useExportData, useImportData, useDeleteAccount } from '../../../api/useUserQueries';

export const SettingsPanel = () => {
  const [activeView, setActiveView] = useState<'menu' | 'profile' | 'password' | 'notificationTime' | 'terms' | 'privacy'>('menu');
  const { mutateAsync: exportData } = useExportData();
  const { mutateAsync: importData } = useImportData();
  const { mutateAsync: deleteAccount } = useDeleteAccount();

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boim_backup.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('데이터 내보내기에 실패했습니다.');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          await importData(parsed);
          alert('데이터 가져오기가 완료되었습니다.');
        } catch (err) {
          alert('올바른 파일 형식이 아닙니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('정말 계정을 탈퇴하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      try {
        await deleteAccount();
        alert('계정이 탈퇴되었습니다.');
        // 실제로 로그아웃 처리 및 라우팅이 필요하지만 생략
        window.location.reload();
      } catch (e) {
        alert('계정 탈퇴에 실패했습니다.');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      alert('로그아웃 되었습니다.');
      window.location.reload();
    }
  };

  if (activeView === 'profile') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <Suspense fallback={<div className="text-sm text-gray-500 font-semibold animate-pulse p-4">사용자 정보를 불러오는 중...</div>}>
          <ProfileSettings onBack={() => setActiveView('menu')} />
        </Suspense>
      </div>
    );
  }

  if (activeView === 'password') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <PasswordSettings onBack={() => setActiveView('menu')} />
      </div>
    );
  }

  if (activeView === 'notificationTime') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <NotificationTimeSettings onBack={() => setActiveView('menu')} />
      </div>
    );
  }

  if (activeView === 'terms') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <PolicyViewer type="terms" onBack={() => setActiveView('menu')} />
      </div>
    );
  }

  if (activeView === 'privacy') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <PolicyViewer type="privacy" onBack={() => setActiveView('menu')} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
      {/* 1. 계정 설정 */}
      <div className="mb-8">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 px-2">계정 설정</h2>
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
          <button 
            onClick={() => setActiveView('profile')}
            className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors"
          >
            <span>내 정보 관리</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button 
            onClick={() => setActiveView('password')}
            className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors"
          >
            <span>비밀번호 변경</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>로그인 기록</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 2. 알림 설정 */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-semibold text-gray-400">알림 설정</h3>
        <Suspense fallback={<div className="text-sm text-gray-500 font-semibold animate-pulse">알림 설정을 불러오는 중...</div>}>
          <NotificationSettingsSection setActiveView={setActiveView} />
        </Suspense>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 3. 데이터 관리 */}
      <section className="mb-8">
        <h3 className="mb-4 text-xs font-semibold text-gray-400">데이터 관리</h3>
        <div className="flex flex-col space-y-5">
          <button onClick={handleExport} className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>데이터 내보내기</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button onClick={handleImport} className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>데이터 가져오기</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button onClick={handleDeleteAccount} className="flex items-center justify-between text-left text-[14px] font-medium text-red-500 hover:text-red-600 transition-colors">
            <span>계정 탈퇴</span>
            <span className="text-red-300">&gt;</span>
          </button>
          <button onClick={handleLogout} className="flex items-center justify-between text-left text-[14px] font-medium text-gray-800 hover:text-gray-900 transition-colors">
            <span>로그아웃</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        </div>
      </section>

      <hr className="my-6 border-gray-100" />

      {/* 4. 기타 */}
      <section>
        <h3 className="mb-4 text-xs font-semibold text-gray-400">기타</h3>
        <div className="flex flex-col space-y-5">
          <button onClick={() => setActiveView('terms')} className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>이용약관</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button onClick={() => setActiveView('privacy')} className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>개인정보처리방침</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        </div>
      </section>
    </div>
  );
};
