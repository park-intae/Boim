import { apiClient } from '../../../api/client';
import { ApiResponse, InsuranceProductDto, CreateInsuranceProductDto } from '@boim/shared-types';

export const getInsuranceProducts = async (): Promise<ApiResponse<InsuranceProductDto[]>> => {
  return apiClient.get('/insurance-products');
};

export const createInsuranceProduct = async (data: CreateInsuranceProductDto): Promise<ApiResponse<InsuranceProductDto>> => {
  return apiClient.post('/insurance-products', data);
};
