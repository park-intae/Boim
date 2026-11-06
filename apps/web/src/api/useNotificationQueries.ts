import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { NotificationType } from '@boim/shared-types';

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

export function useGetNotifications() {
  return useQuery<NotificationDto[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationDto[]>('/notifications');
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
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
      const { data } = await apiClient.post('/notifications/trigger-batch', {
        targetDate: targetDate || undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
