import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react';

interface PassVerificationProps {
  onVerifySuccess: () => void;
}

export const PassVerification: React.FC<PassVerificationProps> = ({ onVerifySuccess }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleVerification = async () => {
    setStatus('loading');
    
    // TODO: 백엔드 PASS 인증 간이(Mock) API 연동 예정
    // 현재는 프론트엔드에서 1.5초 대기 후 성공하는 것으로 모의 구현
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setStatus('success');
    
    // 성공 시 잠시 후 다음 단계로 넘어가도록 처리
    setTimeout(() => {
      onVerifySuccess();
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        
        {/* 아이콘 영역 */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${
          status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {status === 'idle' && <Smartphone size={32} />}
          {status === 'loading' && <Loader2 size={32} className="animate-spin" />}
          {status === 'success' && <CheckCircle2 size={32} />}
        </div>

        {/* 텍스트 영역 */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {status === 'idle' && '휴대폰 본인인증'}
          {status === 'loading' && '인증을 진행 중입니다...'}
          {status === 'success' && '인증이 완료되었습니다!'}
        </h2>
        
        <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
          {status === 'idle' && '안전한 보험 정보 조회를 위해 최초 1회 PASS 본인인증이 필요합니다.'}
          {status === 'loading' && 'PASS 앱에서 인증을 완료해주세요.'}
          {status === 'success' && '이제 다음 단계로 이동합니다.'}
        </p>

        {/* 액션 버튼 */}
        <button
          onClick={handleVerification}
          disabled={status !== 'idle'}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
            status === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white'
          }`}
        >
          {status === 'idle' ? 'PASS로 인증하기' : status === 'loading' ? '확인 중...' : '완료'}
        </button>

        {status === 'idle' && (
          <p className="text-[11px] text-slate-400 mt-4">
            본인 명의의 휴대폰으로만 인증이 가능합니다.
          </p>
        )}
      </div>
    </div>
  );
};
