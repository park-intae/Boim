import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDto, UpdateUserDto, ApiResponse } from 'shared-types';

// TODO: 환경변수 및 공통 axios 인스턴스 연동
const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.response.use(
  (response) => {
    // 백엔드 BigInt 처리 (단순화: JSON.stringify 에서 처리되거나 서버에서 Number로 내려옴)
    return response;
  }
);

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

export const useGetProfile = () => {
  return useSuspenseQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UserDto>>('/users/me');
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to fetch profile');
      }
      return data.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: UpdateUserDto) => {
      const { data } = await api.patch<ApiResponse<UserDto>>('/users/me', updateData);
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }
      return data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me(), updatedUser);
    },
  });
};
