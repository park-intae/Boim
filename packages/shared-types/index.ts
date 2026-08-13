export interface UserDto {
  id: bigint | number;
  email: string;
  name: string;
  createdAt: Date;
}

export interface InsuranceProductDto {
  id: bigint | number;
  userId: bigint | number;
  category: string;
  name: string;
  institution: string;
  startDate: Date;
  maturityDate: Date;
  monthlyPayment: number;
  coverageAmount: bigint | number;
  createdAt: Date;
  updatedAt: Date;
}

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
  parsedData?: any | null;
  uploadedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
