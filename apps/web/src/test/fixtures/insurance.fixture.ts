import type { InsuranceProductDto } from '@boim/shared-types';

export const mockInsuranceProducts: InsuranceProductDto[] = [
  {
    id: 1,
    userId: 1,
    category: '건강보험',
    name: '무배당 굿앤굿어린이종합보험',
    institution: '현대해상',
    startDate: '2023-01-15T00:00:00.000Z',
    maturityDate: '2053-01-15T00:00:00.000Z',
    monthlyPayment: 120000,
    coverageAmount: 50000000,
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-01-15T00:00:00.000Z',
  },
  {
    id: 2,
    userId: 1,
    category: '실손의료비',
    name: '실손의료비보장보험(갱신형)',
    institution: '삼성화재',
    startDate: '2022-05-10T00:00:00.000Z',
    maturityDate: '2042-05-10T00:00:00.000Z',
    monthlyPayment: 35000,
    coverageAmount: 50000000,
    createdAt: '2022-05-10T00:00:00.000Z',
    updatedAt: '2022-05-10T00:00:00.000Z',
  },
  {
    id: 3,
    userId: 1,
    category: '암보험',
    name: 'KB 암케어종합치료보험',
    institution: 'KB손해보험',
    startDate: '2024-03-01T00:00:00.000Z',
    maturityDate: '2064-03-01T00:00:00.000Z',
    monthlyPayment: 58000,
    coverageAmount: 30000000,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
  },
];

export const mockSingleInsurance: InsuranceProductDto = mockInsuranceProducts[0];
