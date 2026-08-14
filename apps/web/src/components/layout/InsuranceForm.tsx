import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateInsurance, useUpdateInsurance } from '../../api/useInsuranceQueries';
import { useAppStore } from '../../store/useAppStore';
import { format } from 'date-fns';

const formSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  name: z.string().min(1, '보험 상품명을 입력해주세요.'),
  institution: z.string().min(1, '보험사명을 입력해주세요.'),
  startDate: z.string().min(1, '가입일을 선택해주세요.'),
  maturityDate: z.string().min(1, '만기일을 선택해주세요.'),
  monthlyPayment: z.number({ invalid_type_error: '숫자만 입력 가능합니다.' }).min(0, '납입액은 0 이상이어야 합니다.'),
  coverageAmount: z.number({ invalid_type_error: '숫자만 입력 가능합니다.' }).min(0, '보장 금액은 0 이상이어야 합니다.'),
});

type FormValues = z.infer<typeof formSchema>;

export function InsuranceForm() {
  const setPanelMode = useAppStore(state => state.setPanelMode);
  const editingProductId = useAppStore(state => state.editingProductId);
  const selectedDate = useAppStore(state => state.selectedDate);

  const { mutate: createInsurance, isPending: isCreating } = useCreateInsurance();
  const { mutate: updateInsurance, isPending: isUpdating } = useUpdateInsurance();
  const isPending = isCreating || isUpdating;

  // MVP 버전에서는 수정 시 데이터 로딩을 생략하고 빈 폼으로 시작하거나, 향후 보강합니다.
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      name: '',
      institution: '',
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      maturityDate: format(selectedDate, 'yyyy-MM-dd'),
    }
  });

  const onSubmit = (data: FormValues) => {
    // String을 Date/ISO 포맷으로 백엔드가 받을 수 있게 가공
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      maturityDate: new Date(data.maturityDate).toISOString(),
    };

    if (editingProductId) {
      updateInsurance(
        { id: editingProductId.toString(), data: payload },
        { onSuccess: () => setPanelMode('view') }
      );
    } else {
      createInsurance(payload, {
        onSuccess: () => setPanelMode('view')
      });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <form id="insurance-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          
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
              <label className="text-[13px] font-bold text-gray-700">만기일(갱신일)</label>
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

      {/* 3. Bottom Sticky Action Button */}
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
