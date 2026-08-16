import React, { useState } from 'react';
import { Lock, X, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../../api/client';

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export const ReAuthModal: React.FC<ReAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = '보안을 위해 비밀번호를 다시 입력해주세요',
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>('/auth/reauth', { password });
      
      if (response.success) {
        onSuccess();
        setPassword('');
      } else {
        setError(response.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (err: any) {
      setError(err?.error?.message || '재인증 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold">
            <Lock size={18} className="text-blue-600" />
            <span>재인증 필요</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="flex items-start space-x-3 bg-amber-50 text-amber-700 p-3 rounded-xl mb-5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              증권번호 원문 열람, 계약 상세내역 조회 등 <strong className="font-semibold">민감 정보 접근</strong> 시 안전을 위해 한 번 더 인증을 진행합니다.
            </p>
          </div>

          <h3 className="text-sm font-medium text-slate-800 mb-4">{title}</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm mb-2"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            
            <div className="flex space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                {isLoading ? '확인 중...' : '확인'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
