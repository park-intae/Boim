import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../store/authStore';

interface PassVerificationProps {
  onVerifySuccess: () => void;
}

export const PassVerification: React.FC<PassVerificationProps> = ({ onVerifySuccess }) => {
  const navigate = useNavigate();
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
      const res = (await apiClient.post('/auth/pass/request', { phoneNumber })) as Record<string, unknown>;
      const nestedData = res?.data as Record<string, unknown> | undefined;
      const txId = (typeof nestedData?.transactionId === 'string' ? nestedData.transactionId : undefined) ||
        (typeof res?.transactionId === 'string' ? (res.transactionId as string) : undefined);

      if (txId) {
        setTransactionId(txId);
        setStep('verify');
      } else {
        const errorMsg = (res?.message as string) || '인증 요청 처리에 실패했습니다.';
        alert(errorMsg);
      }
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      alert(apiError?.error?.message || apiError?.message || '인증 요청 중 오류가 발생했습니다.');
    } finally {
      setStatus('idle');
    }
  };

  const handleVerify = async () => {
    if (!code) return alert('인증번호를 입력해주세요.');
    setStatus('loading');
    try {
      await apiClient.post('/auth/pass/verify', { transactionId, code });
      setStep('success');
      setPassVerified(true);
      setTimeout(() => {
        onVerifySuccess();
      }, 1000);
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      alert(apiError?.error?.message || apiError?.message || '인증번호가 일치하지 않습니다.');
    } finally {
      setStatus('idle');
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        
        {/* 상단 건너뛰기 버튼 */}
        <div className="w-full flex justify-end mb-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            나중에 인증하기 &gt;
          </button>
        </div>

        {/* 아이콘 영역 */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${
          step === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {step === 'request' && <Smartphone size={32} />}
          {step === 'verify' && <KeyRound size={32} />}
          {step === 'success' && <CheckCircle2 size={32} />}
        </div>

        {/* 헤더 텍스트 */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {step === 'request' && 'PASS 휴대폰 본인인증'}
          {step === 'verify' && '인증번호 입력'}
          {step === 'success' && '본인인증 완료'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {step === 'request' && '안전한 보험 관리를 위해 본인 확인이 필요합니다.'}
          {step === 'verify' && '휴대폰으로 전송된 6자리 번호를 입력해주세요.'}
          {step === 'success' && '성공적으로 인증되었습니다. 잠시 후 이동합니다.'}
        </p>

        {/* 입력 폼 영역 */}
        {step === 'request' && (
          <div className="w-full space-y-4">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="휴대폰 번호 (- 없이 입력)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-center font-medium"
            />
            <button
              onClick={handleRequest}
              disabled={status === 'loading'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : '인증번호 요청'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="w-full space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증번호 6자리 (테스트: 000000)"
              maxLength={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-center tracking-widest font-bold"
            />
            <button
              onClick={handleVerify}
              disabled={status === 'loading'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : '인증 확인'}
            </button>
            <button
              onClick={() => setStep('request')}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              번호 다시 입력하기
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="py-4">
            <Loader2 size={24} className="animate-spin text-green-600 mx-auto" />
          </div>
        )}

      </div>
    </div>
  );
};
