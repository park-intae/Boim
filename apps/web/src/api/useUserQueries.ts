import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserDto, UpdateUserDto, ApiResponse } from '@boim/shared-types';

import { apiClient as api } from './client';
import {
  isDemoSession,
  getDemoProfile,
  updateDemoProfile,
  getDemoNotificationSettings,
  updateDemoNotificationSettings,
  getDemoLoginHistories,
  getDemoInsurances,
  resetDemoFallbackState,
} from '../features/auth/utils/demoFallback';

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

export const useGetProfile = () => {
  return useSuspenseQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      if (isDemoSession()) {
        return getDemoProfile();
      }
      const response = await api.get<never, ApiResponse<UserDto>>('/users/me');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch profile');
      }
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: UpdateUserDto) => {
      if (isDemoSession()) {
        return updateDemoProfile(updateData);
      }
      const response = await api.patch<never, ApiResponse<UserDto>>('/users/me', updateData);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
      return response.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me(), updatedUser);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: import('@boim/shared-types').UpdatePasswordDto) => {
      if (isDemoSession()) {
        return true;
      }
      const response = await api.patch<never, ApiResponse<null>>('/users/me/password', data);
      if (!response.success) {
        throw new Error(response.error?.message || '비밀번호 변경에 실패했습니다');
      }
      return true;
    },
  });
};

export const useGetNotificationSettings = () => {
  return useSuspenseQuery({
    queryKey: [...userKeys.me(), 'notificationSettings'],
    queryFn: async () => {
      if (isDemoSession()) {
        return getDemoNotificationSettings();
      }
      const response = await api.get<never, ApiResponse<import('@boim/shared-types').NotificationSettingsDto>>('/users/me/notifications/settings');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch settings');
      }
      return response.data;
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: import('@boim/shared-types').UpdateNotificationSettingsDto) => {
      if (isDemoSession()) {
        return updateDemoNotificationSettings(dto);
      }
      const response = await api.patch<never, ApiResponse<import('@boim/shared-types').NotificationSettingsDto>>('/users/me/notifications/settings', dto);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update settings');
      }
      return response.data;
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: [...userKeys.me(), 'notificationSettings'] });
      const previous = queryClient.getQueryData([...userKeys.me(), 'notificationSettings']);
      queryClient.setQueryData(
        [...userKeys.me(), 'notificationSettings'],
        (old: import('@boim/shared-types').NotificationSettingsDto | undefined) => ({
          ...(old ?? getDemoNotificationSettings()),
          ...newSettings,
        }),
      );
      return { previous };
    },
    onError: (_err, _newSettings, context) => {
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
      if (isDemoSession()) {
        return {
          exportedAt: new Date().toISOString(),
          user: getDemoProfile(),
          insurances: getDemoInsurances(),
        };
      }
      const response = await api.get<never, ApiResponse<Record<string, unknown>>>('/users/me/export');
      if (!response.success) throw new Error(response.error?.message || 'Export failed');
      return response.data;
    },
  });
};

export const useImportData = () => {
  return useMutation({
    mutationFn: async (importData: unknown) => {
      if (isDemoSession()) {
        return true;
      }
      const response = await api.post<never, ApiResponse<null>>('/users/me/import', importData);
      if (!response.success) throw new Error(response.error?.message || 'Import failed');
      return true;
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      if (isDemoSession()) {
        resetDemoFallbackState();
        return true;
      }
      const response = await api.delete<never, ApiResponse<null>>('/users/me');
      if (!response.success) throw new Error(response.error?.message || 'Delete account failed');
      return true;
    },
  });
};

export const useGetLoginHistory = () => {
  return useSuspenseQuery({
    queryKey: [...userKeys.me(), 'loginHistory'],
    queryFn: async () => {
      if (isDemoSession()) {
        return getDemoLoginHistories();
      }
      const response = await api.get<never, ApiResponse<import('@boim/shared-types').LoginHistoryDto[]>>('/users/me/login-history');
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch login history');
      }
      return response.data;
    },
  });
};
