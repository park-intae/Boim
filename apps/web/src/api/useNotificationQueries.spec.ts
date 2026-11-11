import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useTriggerBatch,
} from './useNotificationQueries';
import { apiClient } from './client';
import { createTestQueryClient, createQueryWrapper } from '../test/utils/testQueryClient';
import { mockNotifications } from '../test/fixtures';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useNotificationQueries', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useGetNotifications', () => {
    it('fetches and returns notifications array', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockNotifications,
      });

      const { result } = renderHook(() => useGetNotifications(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotifications);
      expect(apiClient.get).toHaveBeenCalledWith('/notifications');
    });
  });

  describe('useMarkNotificationRead', () => {
    it('calls patch to mark one notification as read and invalidates cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { ...mockNotifications[0], isRead: true },
      });

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/notif-1/read');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    });
  });

  describe('useMarkAllNotificationsRead', () => {
    it('calls patch to mark all notifications as read and invalidates cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { count: 3 },
      });

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    });
  });

  describe('useDeleteNotification', () => {
    it('calls delete api and invalidates cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: true,
      });

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.delete).toHaveBeenCalledWith('/notifications/notif-1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    });
  });

  describe('useTriggerBatch', () => {
    it('calls post api with targetDate and invalidates cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const batchResult = {
        success: true,
        targetDate: '2026-11-11',
        scannedProducts: 5,
        createdNotifications: 2,
        skippedCount: 3,
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: batchResult,
      });

      const { result } = renderHook(() => useTriggerBatch(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate('2026-11-11');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.post).toHaveBeenCalledWith('/notifications/trigger-batch', {
        targetDate: '2026-11-11',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications'] });
    });
  });
});
