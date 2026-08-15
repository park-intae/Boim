import React from 'react';
import { ChevronLeft } from 'lucide-react';

export const PolicyViewer = ({ type, onBack }: { type: 'terms' | 'privacy', onBack: () => void }) => {
  const title = type === 'terms' ? '이용약관' : '개인정보처리방침';
  
  const content = type === 'terms' 
    ? `제 1 조 (목적)
본 약관은 Boim 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제 2 조 (정의)
1. "서비스"라 함은 구현되는 단말기(PC, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 Boim 관련 제반 서비스를 의미합니다.
2. "회원"이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.

제 3 조 (약관의 게시와 개정)
1. 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
2. 회사는 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.`
    : `1. 개인정보의 처리 목적
Boim은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
가. 홈페이지 회원가입 및 관리
나. 재화 또는 서비스 제공
다. 마케팅 및 광고에의 활용

2. 개인정보의 처리 및 보유 기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법
이용자는 개인정보주체로써 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.`;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="bg-gray-50 rounded-2xl p-5 text-[13px] leading-relaxed text-gray-600 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};
