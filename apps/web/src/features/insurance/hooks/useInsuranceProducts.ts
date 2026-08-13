import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsuranceProducts, createInsuranceProduct } from '../api';
import { CreateInsuranceProductDto } from '@boim/shared-types';

export const useInsuranceProducts = () => {
  return useQuery({
    queryKey: ['insurance-products'],
    queryFn: getInsuranceProducts,
  });
};

export const useCreateInsuranceProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsuranceProductDto) => createInsuranceProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-products'] });
    },
  });
};
