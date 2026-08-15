export interface UserDto {
  id: bigint | number;
  email: string;
  name: string;
  createdAt: Date;
}

export type UpdateUserDto = Partial<Pick<UserDto, 'name' | 'email'>>;

export interface UpdatePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface InsuranceProductDto {
  id: bigint | number;
  userId: bigint | number;
  category: string;
  name: string;
  institution: string;
  startDate: Date | string;
  maturityDate: Date | string;
  monthlyPayment: number;
  coverageAmount: bigint | number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CreateInsuranceProductDto = Omit<InsuranceProductDto, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInsuranceProductDto = Partial<CreateInsuranceProductDto>;


export interface NotificationDto {
  id: bigint | number;
  productId: bigint | number;
  type: string;
  channel: string;
  sentAt: Date;
  status: string;
}

export interface DocumentDto {
  id: bigint | number;
  productId: bigint | number;
  fileUrl: string;
  ocrText?: string | null;
  parsedData?: Record<string, unknown> | null;
  uploadedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
