// 이곳에 프론트엔드와 백엔드가 공유할 DTO 및 인터페이스를 정의합니다.
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
