import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle2, Loader2, KeyRound, Clock, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../store/authStore';

interface PassVerificationProps {
  onVerifySuccess: () => void;
}

const TOTAL_TTL_SECONDS = 180; // 3분 (180초)

export const PassVerification: React.FC<PassVerificationProps> = ({ onVerifySuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TTL_SECONDS);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const setPassVerified = useAuthStore((state) => state.setPassVerified);

  // 타이머 카운트다운 처리
  useEffect(() => {
    if (step === 'verify') {
      setTimeLeft(TOTAL_TTL_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // 분:초 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRequest = async () => {
    if (!phoneNumber) {
      setFeedbackMsg({ text: '휴대폰 번호를 입력해주세요.', type: 'error' });
      return;
    }
    setStatus('loading');
    setFeedbackMsg(null);
    try {
      const res = (await apiClient.post('/auth/pass/request', { phoneNumber })) as Record<string, unknown>;
      const nestedData = res?.data as Record<string, unknown> | undefined;
      const txId =
        (typeof nestedData?.transactionId === 'string' ? nestedData.transactionId : undefined) ||
        (typeof res?.transactionId === 'string' ? (res.transactionId as string) : undefined);

      if (txId) {
        setTransactionId(txId);
        setStep('verify');
        setFeedbackMsg({ text: '인증번호(6자리)가 발송되었습니다.', type: 'info' });
      } else {
        const errorMsg = (res?.message as string) || '인증 요청 처리에 실패했습니다.';
        setFeedbackMsg({ text: errorMsg, type: 'error' });
      }
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      setFeedbackMsg({
        text: apiError?.error?.message || apiError?.message || '인증 요청 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setStatus('idle');
    }
  };

  const handleResend = async () => {
    setStatus('loading');
    setFeedbackMsg(null);
    try {
      const res = (await apiClient.post('/auth/pass/request', { phoneNumber })) as Record<string, unknown>;
      const nestedData = res?.data as Record<string, unknown> | undefined;
      const txId =
        (typeof nestedData?.transactionId === 'string' ? nestedData.transactionId : undefined) ||
        (typeof res?.transactionId === 'string' ? (res.transactionId as string) : undefined);

      if (txId) {
        setTransactionId(txId);
        setCode('');
        setTimeLeft(TOTAL_TTL_SECONDS);
        setFeedbackMsg({ text: '새로운 인증번호가 발송되었습니다. (3분 이내 입력)', type: 'success' });
      }
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      setFeedbackMsg({
        text: apiError?.error?.message || apiError?.message || '인증번호 재요청 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setStatus('idle');
    }
  };

  const handleVerify = async () => {
    if (timeLeft === 0) {
      setFeedbackMsg({ text: '인증 시간이 만료되었습니다. 인증번호를 재전송해주세요.', type: 'error' });
      return;
    }
    if (!code) {
      setFeedbackMsg({ text: '인증번호를 입력해주세요.', type: 'error' });
      return;
    }
    setStatus('loading');
    setFeedbackMsg(null);
    try {
      await apiClient.post('/auth/pass/verify', { transactionId, code });
      setStep('success');
      setPassVerified(true);
      setTimeout(() => {
        onVerifySuccess();
      }, 1000);
    } catch (e: unknown) {
      const apiError = e as { error?: { message?: string }; message?: string } | undefined;
      setFeedbackMsg({
        text: apiError?.error?.message || apiError?.message || '인증번호가 일치하지 않습니다.',
        type: 'error',
      });
    } finally {
      setStatus('idle');
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  const isExpired = timeLeft === 0;

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
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${
            step === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
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

        {/* 안내/피드백 메시지 */}
        {feedbackMsg && (
          <div
            role="alert"
            className={`w-full mb-4 px-3 py-2 rounded-xl text-xs font-medium text-left ${
              feedbackMsg.type === 'error'
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

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
              type="button"
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
            {/* 타이머 탑재 인풋 컨테이너 */}
            <div className="relative w-full">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isExpired ? '인증시간 만료' : '인증번호 6자리'}
                maxLength={6}
                disabled={isExpired || status === 'loading'}
                className={`w-full pl-4 pr-20 py-3 bg-slate-50 border rounded-xl outline-none transition-all text-sm text-center tracking-widest font-bold ${
                  isExpired
                    ? 'border-rose-300 bg-rose-50/30 text-rose-400 cursor-not-allowed'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {/* 실시간 3분 카운트다운 타이머 뱃지 */}
              <div
                className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                  isExpired
                    ? 'text-rose-600 bg-rose-100'
                    : timeLeft < 60
                      ? 'text-amber-600 bg-amber-50 animate-pulse'
                      : 'text-blue-600 bg-blue-50'
                }`}
              >
                <Clock size={12} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isExpired || status === 'loading'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
            >
              {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : '인증 확인'}
            </button>

            {/* 재전송 및 재입력 제어 바 */}
            <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-400">
              <button
                type="button"
                onClick={handleResend}
                disabled={status === 'loading'}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw size={12} />
                <span>인증번호 재전송</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setFeedbackMsg(null);
                }}
                className="hover:text-slate-600 transition-colors"
              >
                번호 다시 입력하기
              </button>
            </div>
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
