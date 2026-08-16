import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../store/authStore';

interface PassVerificationProps {
  onVerifySuccess: () => void;
}

export const PassVerification: React.FC<PassVerificationProps> = ({ onVerifySuccess }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  const setPassVerified = useAuthStore((state) => state.setPassVerified);

  const handleRequest = async () => {
    if (!phoneNumber) return alert('휴대폰 번호를 입력해주세요.');
    setStatus('loading');
    try {
      const res = await apiClient.post<{ success: boolean; data?: { transactionId: string }; message?: string }>('/auth/pass/request', { phoneNumber });
      if (res.success && res.data) {
        setTransactionId(res.data.transactionId);
        setStep('verify');
      } else {
        alert(res.message || '인증 요청 실패');
      }
    } catch (e: any) {
      alert(e?.error?.message || '인증 요청 중 오류가 발생했습니다.');
    } finally {
      setStatus('idle');
    }
  };

  const handleVerify = async () => {
    if (!code) return alert('인증번호를 입력해주세요.');
    setStatus('loading');
    try {
      const res = await apiClient.post<{ success: boolean; message?: string }>('/auth/pass/verify', { transactionId, code });
      if (res.success) {
        setStep('success');
        setPassVerified(true);
        setTimeout(() => {
          onVerifySuccess();
        }, 1000);
      } else {
        alert(res.message || '인증 실패');
      }
    } catch (e: any) {
      alert(e?.error?.message || '인증 검증 중 오류가 발생했습니다.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        
        {/* 아이콘 영역 */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${
          step === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {step === 'request' && <Smartphone size={32} />}
          {step === 'verify' && <KeyRound size={32} />}
          {step === 'success' && <CheckCircle2 size={32} />}
        </div>

        {/* 텍스트 영역 */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {step === 'request' && '휴대폰 본인인증'}
          {step === 'verify' && '인증번호 입력'}
          {step === 'success' && '인증이 완료되었습니다!'}
        </h2>
        
        <p className="text-sm text-slate-500 mb-6 px-4 leading-relaxed">
          {step === 'request' && '안전한 보험 정보 조회를 위해 최초 1회 PASS 본인인증이 필요합니다.'}
          {step === 'verify' && 'SMS로 발송된 6자리 인증번호(000000)를 입력해주세요.'}
          {step === 'success' && '이제 다음 단계로 이동합니다.'}
        </p>

        {/* 입력 및 버튼 영역 */}
        {step === 'request' && (
          <div className="w-full space-y-4">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center"
              disabled={status === 'loading'}
            />
            <button
              onClick={handleRequest}
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-all"
            >
              {status === 'loading' ? '요청 중...' : '인증 요청하기'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="w-full space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg font-mono"
              disabled={status === 'loading'}
            />
            <button
              onClick={handleVerify}
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-all"
            >
              {status === 'loading' ? '검증 중...' : '인증 완료하기'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="w-full space-y-4 flex justify-center">
            <Loader2 className="animate-spin text-green-500" size={24} />
          </div>
        )}
      </div>
    </div>
  );
};
