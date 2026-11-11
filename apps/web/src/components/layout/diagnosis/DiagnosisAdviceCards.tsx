import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Download,
  Printer,
} from 'lucide-react';

interface DiagnosisAdviceCardsProps {
  strengths: string[];
  improvements: string[];
  costSavingTips: string[];
  onExportExcel: () => void;
  onPrint: () => void;
  isExporting: boolean;
}

export const DiagnosisAdviceCards: React.FC<DiagnosisAdviceCardsProps> = ({
  strengths,
  improvements,
  costSavingTips,
  onExportExcel,
  onPrint,
  isExporting,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-6 print:pb-0 print-avoid-break">
      <h4 className="text-[14px] font-bold text-gray-900">AI 맞춤형 리모델링 조언</h4>

      {/* 강점 */}
      {strengths.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-2 print:border-gray-200 print:bg-white print-avoid-break">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-[13px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>든든한 보장 포인트</span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-emerald-900/80 leading-relaxed">
            {strengths.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 보완점 */}
      {improvements.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col gap-2 print:border-gray-200 print:bg-white print-avoid-break">
          <div className="flex items-center gap-2 text-orange-800 font-bold text-[13px]">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
            <span>보완이 필요한 항목</span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-orange-900/80 leading-relaxed">
            {improvements.map((imp, idx) => (
              <li key={idx}>{imp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 절감 팁 */}
      {costSavingTips.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col gap-2 print:border-gray-200 print:bg-white print-avoid-break">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-[13px]">
            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
            <span>월 보험료 절감 팁</span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-blue-900/80 leading-relaxed">
            {costSavingTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 하단 액션 버튼 */}
      <div className="flex items-center gap-2 mt-2 print:hidden">
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? '다운로드 중...' : '엑셀(.xlsx) 리포트 저장'}</span>
        </button>
        <button
          onClick={onPrint}
          className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>인쇄</span>
        </button>
      </div>
    </div>
  );
};
