import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { NotificationType } from '@boim/shared-types';
import {
  isDemoSession,
  getDemoNotifications,
  markDemoNotificationRead,
  markAllDemoNotificationsRead,
  deleteDemoNotification,
  triggerDemoBatch,
} from '../features/auth/utils/demoFallback';

export interface NotificationDto {
  id: string;
  userId?: string;
  productId?: string | null;
  type: NotificationType | string;
  title: string;
  message: string;
  channel?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TriggerBatchResult {
  success: boolean;
  targetDate: string;
  scannedProducts: number;
  createdNotifications: number;
  skippedCount: number;
}

export function useGetNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (isDemoSession()) {
        return getDemoNotifications();
      }
      const { data } = await apiClient.get<NotificationDto[]>('/notifications');
      return data || [];
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        return markDemoNotificationRead(id);
      }
      const { data } = await apiClient.patch<NotificationDto>(
        `/notifications/${id}/read`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isDemoSession()) {
        return markAllDemoNotificationsRead();
      }
      const { data } = await apiClient.patch<{ count: number }>(
        '/notifications/read-all',
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoSession()) {
        return deleteDemoNotification(id);
      }
      const { data } = await apiClient.delete<boolean>(`/notifications/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useTriggerBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetDate?: string | void) => {
      if (isDemoSession()) {
        return triggerDemoBatch(targetDate || undefined);
      }
      const response = await apiClient.post<Record<string, unknown>>(
        '/notifications/trigger-batch',
        {
          targetDate: targetDate || undefined,
        },
      );
      const resObj = response as unknown as Record<string, unknown>;
      const result = resObj?.data || resObj;
      return result as unknown as TriggerBatchResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
