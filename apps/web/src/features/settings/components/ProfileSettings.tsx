import React, { useState, useTransition } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useGetProfile, useUpdateProfile } from '../../api/useUserQueries';

export const ProfileSettings = ({ onBack }: { onBack: () => void }) => {
  const { data: user } = useGetProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  
  const [name, setName] = useState(user.name);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile({ name });
        alert('프로필이 성공적으로 업데이트되었습니다.');
        onBack();
      } catch (err) {
        alert('프로필 업데이트에 실패했습니다.');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[16px] font-bold text-gray-900">내 정보 관리</h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-gray-600">이메일</label>
          <input 
            type="email" 
            value={user.email} 
            disabled
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] text-gray-500 font-medium cursor-not-allowed outline-none"
          />
          <p className="text-[11px] text-gray-400">이메일은 변경할 수 없습니다.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-gray-600">이름</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            placeholder="이름을 입력해주세요"
          />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button 
          onClick={handleSave}
          disabled={isPending || name === user.name || !name.trim()}
          className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[15px] font-bold rounded-2xl transition-colors disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
};
