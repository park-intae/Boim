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

export interface NotificationSettingsDto {
  pushEnabled: boolean;
  emailEnabled: boolean;
  kakaoEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export type UpdateNotificationSettingsDto = Partial<NotificationSettingsDto>;

export interface LoginHistoryDto {
  id: bigint | number;
  userId: bigint | number;
  device: string;
  ipAddress: string;
  location?: string | null;
  loginAt: string; // ISO 8601 string
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

export type NotificationType = 'payment' | 'renewal' | 'info';
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'kakao';

export interface NotificationDto {
  id: string | number | bigint;
  userId?: string | number | bigint;
  productId?: string | number | bigint | null;
  type: NotificationType | string;
  title: string;
  message: string;
  channel?: NotificationChannel | string;
  isRead: boolean;
  sentAt?: Date | string;
  status?: string;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: bigint | number;
  productId?: bigint | number | null;
  type: NotificationType | string;
  title: string;
  message: string;
  channel?: NotificationChannel | string;
  isRead?: boolean;
}

export interface DocumentDto {
  id: bigint | number;
  userId: bigint | number;
  productId?: bigint | number | null;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  ocrText?: string | null;
  parsedData?: Record<string, unknown> | null;
  uploadedAt: Date | string;
}

export interface ParsedInsuranceData {
  institution: string;
  name: string;
  category: string;
  monthlyPayment: number;
  paymentDay?: number;
  startDate: string;
  maturityDate: string;
  coverageAmount: number;
  confidence?: number;
}

export interface DocumentUploadResponse {
  documentId: number | string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface DocumentParseResponse {
  documentId: number | string;
  ocrText: string;
  parsedData: ParsedInsuranceData;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
