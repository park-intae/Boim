import { useInsuranceForm } from '../../hooks/useInsuranceForm';
import { PolicyDocumentUploader } from './PolicyDocumentUploader';

export function InsuranceForm() {
  const {
    register,
    errors,
    isPending,
    editingProductId,
    handleParsedData,
    submitHandler,
  } = useInsuranceForm();

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {/* 신규 등록 모드일 때만 증권 자동 분석 업로더 표시 */}
        {!editingProductId && (
          <PolicyDocumentUploader onParsed={handleParsedData} />
        )}

        <form id="insurance-form" onSubmit={submitHandler} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">카테고리</label>
            <select 
              {...register('category')}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              <option value="">선택해주세요</option>
              <option value="실비보험">실비보험</option>
              <option value="암보험">암/건강보험</option>
              <option value="자동차보험">자동차보험</option>
              <option value="종신보험">종신보험</option>
              <option value="기타">기타</option>
            </select>
            {errors.category && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.category.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">보험 상품명</label>
            <input 
              {...register('name')}
              placeholder="예) 무배당 굿앤굿 어린이종합보험"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-400"
            />
            {errors.name && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">보험사명 (기관)</label>
            <input 
              {...register('institution')}
              placeholder="예) 현대해상"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-400"
            />
            {errors.institution && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.institution.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">가입일(납입 기준일)</label>
              <input 
                type="date"
                {...register('startDate')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {errors.startDate && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.startDate.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">만기일</label>
              <input 
                type="date"
                {...register('maturityDate')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {errors.maturityDate && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.maturityDate.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">월 납입액</label>
            <div className="relative">
              <input 
                type="number"
                {...register('monthlyPayment', { valueAsNumber: true })}
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">원</span>
            </div>
            {errors.monthlyPayment && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.monthlyPayment.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-gray-700">총 보장 금액</label>
            <div className="relative">
              <input 
                type="number"
                {...register('coverageAmount', { valueAsNumber: true })}
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400">원</span>
            </div>
            {errors.coverageAmount && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.coverageAmount.message}</span>}
          </div>
        </form>
      </div>

      <div className="p-6 pt-2 bg-gradient-to-t from-white via-white to-transparent shrink-0">
        <button 
          type="submit"
          form="insurance-form"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(17,24,39,0.2)] hover:shadow-[0_6px_20px_rgba(17,24,39,0.3)] hover:-translate-y-0.5"
        >
          {isPending ? '저장 중...' : (editingProductId ? '수정 내용 저장하기' : '보험 등록 완료하기')}
        </button>
      </div>
    </>
  );
}
