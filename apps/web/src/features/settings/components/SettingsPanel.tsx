import React, { useState, Suspense } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { ProfileSettings } from './ProfileSettings';

export const SettingsPanel = () => {
  const [activeView, setActiveView] = useState<'menu' | 'profile'>('menu');

  if (activeView === 'profile') {
    return (
      <div className="flex-1 px-6 py-6 pb-20 flex flex-col h-full">
        <Suspense fallback={<div className="text-sm text-gray-500 font-semibold animate-pulse p-4">사용자 정보를 불러오는 중...</div>}>
          <ProfileSettings onBack={() => setActiveView('menu')} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
      {/* 1. 계정 설정 */}
      <section className="mb-8">
        <h3 className="mb-4 text-xs font-semibold text-gray-400">계정 설정</h3>
        <div className="flex flex-col space-y-5">
          <button 
            onClick={() => setActiveView('profile')}
            className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors"
          >
            <span>내 정보 관리</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>비밀번호 변경</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>로그인 기록</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        </div>
      </section>

      <hr className="my-6 border-gray-100" />

      {/* 2. 알림 설정 */}
      <section className="mb-8">
        <h3 className="mb-4 text-xs font-semibold text-gray-400">알림 설정</h3>
        <div className="flex flex-col space-y-5">
          <div className="flex items-center justify-between text-[14px] text-gray-800">
            <span>푸시 알림</span>
            {/* 임시 토글 스위치 UI (On) */}
            <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-indigo-600 p-0.5">
              <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[14px] text-gray-800">
            <span>이메일 알림</span>
            {/* 임시 토글 스위치 UI (Off) */}
            <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-gray-200 p-0.5">
              <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[14px] text-gray-800">
            <span>카카오톡 알림</span>
            {/* 임시 토글 스위치 UI (On) */}
            <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-indigo-600 p-0.5">
              <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform"></div>
            </div>
          </div>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>알림 시간 설정</span>
            <span className="text-gray-400 text-xs">오전 9시 &gt;</span>
          </button>
        </div>
      </section>

      <hr className="my-6 border-gray-100" />

      {/* 3. 데이터 관리 */}
      <section className="mb-8">
        <h3 className="mb-4 text-xs font-semibold text-gray-400">데이터 관리</h3>
        <div className="flex flex-col space-y-5">
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>데이터 내보내기</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>데이터 가져오기</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] font-medium text-red-500 hover:text-red-600 transition-colors">
            <span>계정 탈퇴</span>
            <span className="text-red-300">&gt;</span>
          </button>
        </div>
      </section>

      <hr className="my-6 border-gray-100" />

      {/* 4. 기타 */}
      <section>
        <h3 className="mb-4 text-xs font-semibold text-gray-400">기타</h3>
        <div className="flex flex-col space-y-5">
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>이용약관</span>
            <span className="text-gray-300">&gt;</span>
          </button>
          <button className="flex items-center justify-between text-left text-[14px] text-gray-800 hover:text-gray-900 transition-colors">
            <span>개인정보처리방침</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        </div>
      </section>
    </div>
  );
};
