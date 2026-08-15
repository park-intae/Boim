import React, { useState, useTransition } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useUpdatePassword } from '../../../api/useUserQueries';

export const PasswordSettings = ({ onBack }: { onBack: () => void }) => {
  const { mutateAsync: updatePassword } = useUpdatePassword();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isPending, startTransition] = useTransition();

  const isFormValid = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8;

  const handleSave = () => {
    if (!isFormValid) return;

    startTransition(async () => {
      try {
        await updatePassword({ currentPassword, newPassword });
        alert('비밀번호가 성공적으로 변경되었습니다.');
        onBack();
      } catch (err) {
        alert('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
      }
    });
  };

  const toggleShow = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[16px] font-bold text-gray-900">비밀번호 변경</h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-gray-600">현재 비밀번호</label>
          <div className="relative">
            <input 
              type={showPassword.current ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all pr-12"
              placeholder="현재 비밀번호를 입력해주세요"
            />
            <button 
              type="button"
              onClick={() => toggleShow('current')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-gray-600">새 비밀번호</label>
          <div className="relative">
            <input 
              type={showPassword.new ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all pr-12"
              placeholder="영문, 숫자, 특수문자 조합 8자 이상"
            />
            <button 
              type="button"
              onClick={() => toggleShow('new')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-gray-600">새 비밀번호 확인</label>
          <div className="relative">
            <input 
              type={showPassword.confirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] font-medium outline-none transition-all pr-12
                ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900' : 'border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900'}`}
              placeholder="새 비밀번호를 다시 입력해주세요"
            />
            <button 
              type="button"
              onClick={() => toggleShow('confirm')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[12px] font-medium text-red-500">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button 
          onClick={handleSave}
          disabled={isPending || !isFormValid}
          className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[15px] font-bold rounded-2xl transition-colors disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isPending ? '변경 중...' : '비밀번호 변경하기'}
        </button>
      </div>
    </div>
  );
};
