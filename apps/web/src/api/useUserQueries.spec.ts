import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useGetProfile,
  useUpdateProfile,
  useUpdatePassword,
  useGetNotificationSettings,
  useUpdateNotificationSettings,
  useExportData,
  useImportData,
  useDeleteAccount,
  useGetLoginHistory,
  userKeys,
} from './useUserQueries';
import { apiClient } from './client';
import { createTestQueryClient, createQueryWrapper } from '../test/utils/testQueryClient';
import { mockUser, mockNotificationSettings, mockLoginHistories } from '../test/fixtures';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useUserQueries', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('useGetProfile', () => {
    it('fetches profile successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: mockUser },
      });

      const { result } = renderHook(() => useGetProfile(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.data).toEqual(mockUser));
      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('useUpdateProfile', () => {
    it('updates user profile and returns updated user', async () => {
      const updatedUser = { ...mockUser, name: '이순신' };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true, data: updatedUser },
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ name: '이순신' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/users/me', { name: '이순신' });
      expect(result.current.data).toEqual(updatedUser);
    });
  });

  describe('useUpdatePassword', () => {
    it('calls patch password and returns true on success', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true },
      });

      const { result } = renderHook(() => useUpdatePassword(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({
        currentPassword: 'oldPassword1!',
        newPassword: 'newPassword1!',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/users/me/password', {
        currentPassword: 'oldPassword1!',
        newPassword: 'newPassword1!',
      });
    });
  });

  describe('useGetNotificationSettings & useUpdateNotificationSettings', () => {
    it('fetches notification settings', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: mockNotificationSettings },
      });

      const { result } = renderHook(() => useGetNotificationSettings(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.data).toEqual(mockNotificationSettings));
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/notifications/settings');
    });

    it('updates notification settings with optimistic update', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const nextSettings = { ...mockNotificationSettings, pushEnabled: false };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true, data: nextSettings },
      });

      const { result } = renderHook(() => useUpdateNotificationSettings(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ pushEnabled: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.patch).toHaveBeenCalledWith('/users/me/notifications/settings', { pushEnabled: false });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...userKeys.me(), 'notificationSettings'],
      });
    });
  });

  describe('useExportData, useImportData, useDeleteAccount', () => {
    it('exports user data', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: { insurances: [] } },
      });

      const { result } = renderHook(() => useExportData(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ insurances: [] });
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/export');
    });

    it('imports user data', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true },
      });

      const { result } = renderHook(() => useImportData(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate({ insurances: [] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.post).toHaveBeenCalledWith('/users/me/import', { insurances: [] });
    });

    it('deletes user account', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      const { result } = renderHook(() => useDeleteAccount(), {
        wrapper: createQueryWrapper(queryClient),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me');
    });
  });

  describe('useGetLoginHistory', () => {
    it('fetches login history list', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: mockLoginHistories },
      });

      const { result } = renderHook(() => useGetLoginHistory(), {
        wrapper: createQueryWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.data).toEqual(mockLoginHistories));
      expect(apiClient.get).toHaveBeenCalledWith('/users/me/login-history');
    });
  });
});
