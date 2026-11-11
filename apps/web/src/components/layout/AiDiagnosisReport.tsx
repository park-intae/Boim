import {
  Sparkles,
  RefreshCw,
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  useGetDiagnosis,
  useGenerateDiagnosis,
  useExportExcel,
} from '../../api/useDiagnosisQueries';
import { useAppStore } from '../../store/useAppStore';
import {
  DiagnosisScoreCard,
  CoverageProgressList,
  DiagnosisAdviceCards,
} from './diagnosis';

export function AiDiagnosisReport() {
  const { data: diagnosis, isLoading, isError, refetch } = useGetDiagnosis();
  const { mutate: regenerate, isPending: isRegenerating } = useGenerateDiagnosis();
  const { mutate: exportExcel, isPending: isExporting } = useExportExcel();
  const setPanelMode = useAppStore((state) => state.setPanelMode);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-gray-700">AI 종합 진단 리포트를 생성하는 중...</p>
        <p className="text-xs text-gray-400">보장 내역과 권장 기준을 정밀 비교 분석하고 있습니다.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-1">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-gray-800">진단 리포트를 불러오지 못했습니다</p>
        <p className="text-xs text-gray-400 mb-2">일시적인 네트워크 오류이거나 서버 응답이 지연되었습니다.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const isBlank = !diagnosis || (diagnosis.totalMonthlyPayment === 0 && (diagnosis.totalCoverageAmount ?? 0) === 0);
  if (isBlank) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-center gap-3 py-16 px-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h4 className="text-[16px] font-bold text-gray-800">등록된 보험이 없습니다</h4>
        <p className="text-[12px] text-gray-400 leading-relaxed max-w-[260px]">
          보험을 등록하시면 Gemini AI가 보장 과다/부족 진단 및 1:1 맞춤형 리모델링 조언을 제공합니다.
        </p>
        <button
          onClick={() => setPanelMode('form')}
          className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <span>새 보험 등록하기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white print:h-auto print:overflow-visible overflow-hidden print:block">
      {/* 1. Header Area */}
      <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between print:px-0 print:py-4 print:border-b-2 print:border-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm print:hidden">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">
            <span className="print:hidden">AI 종합 진단</span>
            <span className="hidden print:inline">Boim AI 보험 종합 진단 리포트</span>
          </h3>
          {diagnosis.isFallback ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 print:text-gray-600 print:border-gray-300">
              규칙 기반 분석 엔진
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 print:text-gray-600 print:border-gray-300">
              Gemini AI 분석 엔진
            </span>
          )}
        </div>

        <div className="hidden print:block text-[12px] font-medium text-gray-500">
          진단 일시: {new Date(diagnosis.generatedAt).toLocaleDateString('ko-KR')}
        </div>

        <div className="flex items-center gap-1.5 print:hidden">
          <button
            onClick={() => regenerate()}
            disabled={isRegenerating}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs flex items-center justify-center"
            title="AI 재분석 실행"
            aria-label="AI 재분석"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
          <button
            onClick={() => exportExcel()}
            disabled={isExporting}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-xs flex items-center justify-center"
            title="Excel 리포트 다운로드"
            aria-label="Excel 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center justify-center"
            title="인쇄 및 PDF 저장"
            aria-label="PDF 인쇄"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body - 서브 컴포넌트 조합 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 print:h-auto print:overflow-visible print:p-0 print:mt-4 print:block print:space-y-6">
        {/* 종합 점수 카드 */}
        <DiagnosisScoreCard
          score={diagnosis.score}
          grade={diagnosis.grade}
          summary={diagnosis.summary}
          totalMonthlyPayment={diagnosis.totalMonthlyPayment}
          totalCoverageAmount={diagnosis.totalCoverageAmount}
        />

        {/* 카테고리별 보장 적정도 목록 */}
        <CoverageProgressList evaluations={diagnosis.categoryEvaluations} />

        {/* AI 맞춤형 리모델링 조언 카드 */}
        <DiagnosisAdviceCards
          strengths={diagnosis.strengths}
          improvements={diagnosis.improvements}
          costSavingTips={diagnosis.costSavingTips}
          onExportExcel={() => exportExcel()}
          onPrint={handlePrint}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
