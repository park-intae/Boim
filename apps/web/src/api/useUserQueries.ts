import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UserDto, UpdateUserDto, ApiResponse } from '@boim/shared-types';

import { apiClient as api } from './client';

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

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: import('@boim/shared-types').UpdatePasswordDto) => {
      const response = await api.patch<ApiResponse<null>>('/users/me/password', data);
      if (!response.data.success) {
        throw new Error(response.data.error?.message || '비밀번호 변경에 실패했습니다');
      }
      return true;
    },
  });
};

export const useGetNotificationSettings = () => {
  return useSuspenseQuery({
    queryKey: [...userKeys.me(), 'notificationSettings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<import('@boim/shared-types').NotificationSettingsDto>>('/users/me/notifications/settings');
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to fetch settings');
      }
      return data.data;
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: import('@boim/shared-types').UpdateNotificationSettingsDto) => {
      const { data } = await api.patch<ApiResponse<import('@boim/shared-types').NotificationSettingsDto>>('/users/me/notifications/settings', dto);
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to update settings');
      }
      return data.data;
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: [...userKeys.me(), 'notificationSettings'] });
      const previous = queryClient.getQueryData([...userKeys.me(), 'notificationSettings']);
      queryClient.setQueryData([...userKeys.me(), 'notificationSettings'], (old: any) => ({ ...old, ...newSettings }));
      return { previous };
    },
    onError: (err, newSettings, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...userKeys.me(), 'notificationSettings'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...userKeys.me(), 'notificationSettings'] });
    },
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get<ApiResponse<any>>('/users/me/export');
      if (!data.success) throw new Error(data.error?.message || 'Export failed');
      return data.data;
    },
  });
};

export const useImportData = () => {
  return useMutation({
    mutationFn: async (importData: any) => {
      const { data } = await api.post<ApiResponse<null>>('/users/me/import', importData);
      if (!data.success) throw new Error(data.error?.message || 'Import failed');
      return true;
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<ApiResponse<null>>('/users/me');
      if (!data.success) throw new Error(data.error?.message || 'Delete account failed');
      return true;
    },
  });
};

export const useGetLoginHistory = () => {
  return useSuspenseQuery({
    queryKey: [...userKeys.me(), 'loginHistory'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<import('@boim/shared-types').LoginHistoryDto[]>>('/users/me/login-history');
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to fetch login history');
      }
      return data.data;
    },
  });
};
