import {
  Sparkles,
  RefreshCw,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  useGetDiagnosis,
  useGenerateDiagnosis,
  useExportExcel,
} from '../../api/useDiagnosisQueries';
import { useAppStore } from '../../store/useAppStore';
import type { DiagnosisGrade, CoverageStatus } from '@boim/shared-types';

export function AiDiagnosisReport() {
  const { data: diagnosis, isLoading, isError, refetch } = useGetDiagnosis();
  const { mutate: regenerate, isPending: isRegenerating } = useGenerateDiagnosis();
  const { mutate: exportExcel, isPending: isExporting } = useExportExcel();
  const setPanelMode = useAppStore((state) => state.setPanelMode);

  const getGradeBadge = (grade: DiagnosisGrade) => {
    switch (grade) {
      case 'EXCELLENT':
        return { text: '매우 우수', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'GOOD':
        return { text: '우수', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'NORMAL':
        return { text: '보통', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'NEEDS_ATTENTION':
        return { text: '점검 필요', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'WARNING':
      default:
        return { text: '보완 시급', bg: 'bg-red-50 text-red-700 border-red-200' };
    }
  };

  const getStatusBadge = (status: CoverageStatus) => {
    switch (status) {
      case 'ADEQUATE':
        return { text: '적정', bg: 'bg-emerald-100 text-emerald-800' };
      case 'OVER_COVERED':
        return { text: '과다', bg: 'bg-purple-100 text-purple-800' };
      case 'UNDER_COVERED':
        return { text: '부족', bg: 'bg-amber-100 text-amber-800' };
      case 'NOT_COVERED':
      default:
        return { text: '미가입', bg: 'bg-rose-100 text-rose-800' };
    }
  };

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

  const gradeInfo = getGradeBadge(diagnosis.grade);

  return (
    <div className="flex flex-col h-full bg-white print:bg-white overflow-hidden">
      {/* 1. Header Area */}
      <div className="px-6 py-5 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">
            AI 종합 진단
          </h3>
          {diagnosis.isFallback && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              규칙 기반 분석 엔진
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
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
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center justify-center print:hidden"
            title="인쇄 및 PDF 저장"
            aria-label="PDF 인쇄"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
        {isBlank ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
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
        ) : (
          <>
            {/* 종합 점수 카드 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white border border-indigo-100/70 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[12px] font-bold text-indigo-600 uppercase tracking-wider">
                    종합 보장 건강 점수
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[34px] font-black text-gray-900 tracking-tight">
                      {diagnosis.score}
                    </span>
                    <span className="text-[16px] font-bold text-gray-400">/ 100점</span>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${gradeInfo.bg}`}>
                  {gradeInfo.text}
                </div>
              </div>

              {/* 총평 배너 */}
              <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100/50 backdrop-blur-sm text-[13px] text-gray-700 font-medium leading-relaxed">
                {diagnosis.summary}
              </div>

              {/* 월 납입액 / 총 보장액 칩 */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white/90 border border-gray-100 flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400">총 월 납입 보험료</span>
                  <span className="text-[15px] font-extrabold text-gray-900 mt-0.5">
                    {diagnosis.totalMonthlyPayment.toLocaleString()}원
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/90 border border-gray-100 flex flex-col">
                  <span className="text-[11px] font-semibold text-gray-400">총 보장금액 합계</span>
                  <span className="text-[15px] font-extrabold text-gray-900 mt-0.5">
                    {(diagnosis.totalCoverageAmount ?? 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 카테고리별 보장 적정도 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-gray-900">카테고리별 보장 적정도</h4>
                <span className="text-[11px] text-gray-400 font-medium">3040 표준 권장 기준</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {diagnosis.categoryEvaluations.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const percent =
                    item.recommendedAmount > 0
                      ? Math.min(100, Math.round((item.currentAmount / item.recommendedAmount) * 100))
                      : 0;

                  return (
                    <div
                      key={item.category}
                      className="p-4 rounded-xl bg-gray-50/70 border border-gray-100/70 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-gray-800">{item.category}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badge.bg}`}>
                            {badge.text}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500">
                          {item.currentAmount > 0 ? `${(item.currentAmount / 10000).toLocaleString()}만원` : '0원'}
                          <span className="text-gray-400 font-normal"> / {(item.recommendedAmount / 10000).toLocaleString()}만원</span>
                        </span>
                      </div>

                      {/* 비교 프로그레스 바 */}
                      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.status === 'ADEQUATE'
                              ? 'bg-emerald-500'
                              : item.status === 'OVER_COVERED'
                              ? 'bg-purple-500'
                              : item.status === 'UNDER_COVERED'
                              ? 'bg-amber-500'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <p className="text-[12px] text-gray-500 leading-relaxed mt-0.5">
                        {item.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI 1:1 맞춤형 리모델링 조언 */}
            <div className="flex flex-col gap-4 pb-6">
              <h4 className="text-[14px] font-bold text-gray-900">AI 맞춤형 리모델링 조언</h4>

              {/* 강점 */}
              {diagnosis.strengths.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-[13px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>든든한 보장 포인트</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-emerald-900/80 leading-relaxed">
                    {diagnosis.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 보완점 */}
              {diagnosis.improvements.length > 0 && (
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-orange-800 font-bold text-[13px]">
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>보완이 필요한 항목</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-orange-900/80 leading-relaxed">
                    {diagnosis.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 절감 팁 */}
              {diagnosis.costSavingTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-[13px]">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>월 보험료 절감 팁</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 pl-6 list-disc text-[12px] text-blue-900/80 leading-relaxed">
                    {diagnosis.costSavingTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 하단 액션 버튼 */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => exportExcel()}
                  disabled={isExporting}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? '다운로드 중...' : '엑셀(.xlsx) 리포트 저장'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
