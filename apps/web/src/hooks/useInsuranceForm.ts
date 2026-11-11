import { useEffect } from 'react';
import { useForm, type UseFormRegister, type FieldErrors, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  useCreateInsurance,
  useUpdateInsurance,
  useGetInsurances,
} from '../api/useInsuranceQueries';
import { useAppStore } from '../store/useAppStore';
import type { ParsedInsuranceData } from '@boim/shared-types';

export const insuranceFormSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  name: z.string().min(1, '보험 상품명을 입력해주세요.'),
  institution: z.string().min(1, '보험사명을 입력해주세요.'),
  startDate: z.string().min(1, '가입일을 선택해주세요.'),
  maturityDate: z.string().min(1, '만기일을 선택해주세요.'),
  monthlyPayment: z.number().min(0, '납입액은 0 이상이어야 합니다.'),
  coverageAmount: z.number().min(0, '보장 금액은 0 이상이어야 합니다.'),
});

export type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

export interface UseInsuranceFormReturn {
  register: UseFormRegister<InsuranceFormValues>;
  setValue: UseFormSetValue<InsuranceFormValues>;
  errors: FieldErrors<InsuranceFormValues>;
  isPending: boolean;
  editingProductId: string | number | bigint | null | undefined;
  handleParsedData: (parsed?: ParsedInsuranceData) => void;
  submitHandler: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useInsuranceForm(): UseInsuranceFormReturn {
  const setPanelMode = useAppStore((state) => state.setPanelMode);
  const editingProductId = useAppStore((state) => state.editingProductId);
  const setEditingProductId = useAppStore((state) => state.setEditingProductId);
  const selectedDate = useAppStore((state) => state.selectedDate);

  const { data: insurances = [] } = useGetInsurances();
  const { mutate: createInsurance, isPending: isCreating } = useCreateInsurance();
  const { mutate: updateInsurance, isPending: isUpdating } = useUpdateInsurance();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      category: '',
      name: '',
      institution: '',
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      maturityDate: format(selectedDate, 'yyyy-MM-dd'),
      monthlyPayment: 0,
      coverageAmount: 0,
    },
  });

  // 수정 모드일 때 기존 데이터 Prefill
  useEffect(() => {
    if (editingProductId) {
      const target = insurances.find(
        (p) => p.id.toString() === editingProductId.toString(),
      );
      if (target) {
        reset({
          category: target.category || '',
          name: target.name || '',
          institution: target.institution || '',
          startDate: target.startDate
            ? format(new Date(target.startDate), 'yyyy-MM-dd')
            : format(selectedDate, 'yyyy-MM-dd'),
          maturityDate: target.maturityDate
            ? format(new Date(target.maturityDate), 'yyyy-MM-dd')
            : format(selectedDate, 'yyyy-MM-dd'),
          monthlyPayment: target.monthlyPayment || 0,
          coverageAmount: Number(target.coverageAmount || 0),
        });
      }
    } else {
      reset({
        category: '',
        name: '',
        institution: '',
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        maturityDate: format(selectedDate, 'yyyy-MM-dd'),
        monthlyPayment: 0,
        coverageAmount: 0,
      });
    }
  }, [editingProductId, insurances, reset, selectedDate]);

  const handleParsedData = (parsed?: ParsedInsuranceData) => {
    if (!parsed || typeof parsed !== 'object') return;

    let mappedCategory = '실비보험';
    if (parsed.category === 'CANCER') mappedCategory = '암보험';
    else if (parsed.category === 'AUTO') mappedCategory = '자동차보험';
    else if (parsed.category === 'LIFE') mappedCategory = '종신보험';
    else if (parsed.category === 'SAVING') mappedCategory = '기타';
    else if (parsed.category === 'HEALTH') mappedCategory = '실비보험';

    setValue('institution', parsed.institution, { shouldValidate: true });
    setValue('name', parsed.name, { shouldValidate: true });
    setValue('category', mappedCategory, { shouldValidate: true });
    setValue('startDate', parsed.startDate, { shouldValidate: true });
    setValue('maturityDate', parsed.maturityDate, { shouldValidate: true });
    setValue('monthlyPayment', parsed.monthlyPayment, { shouldValidate: true });
    setValue('coverageAmount', parsed.coverageAmount, { shouldValidate: true });
  };

  const onSubmit = (data: InsuranceFormValues) => {
    const payload = {
      ...data,
      userId: 1,
      startDate: new Date(data.startDate).toISOString(),
      maturityDate: new Date(data.maturityDate).toISOString(),
    };

    if (editingProductId) {
      updateInsurance(
        { id: editingProductId.toString(), data: payload },
        {
          onSuccess: () => {
            setEditingProductId(null);
            setPanelMode('view');
          },
        },
      );
    } else {
      createInsurance(payload, {
        onSuccess: () => {
          setEditingProductId(null);
          setPanelMode('view');
        },
      });
    }
  };

  return {
    register,
    setValue,
    errors,
    isPending,
    editingProductId,
    handleParsedData,
    submitHandler: handleSubmit(onSubmit),
  };
}
