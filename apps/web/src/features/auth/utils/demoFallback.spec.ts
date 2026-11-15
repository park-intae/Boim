import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';
import {
  DEMO_EMAIL,
  DEMO_ACCESS_TOKEN,
  isDemoAccountEmail,
  isDemoSession,
  getDemoAuthUser,
  getDemoInsurances,
  getDemoInsuranceById,
  createDemoInsurance,
  updateDemoInsurance,
  deleteDemoInsurance,
  getDemoNotifications,
  markDemoNotificationRead,
  markAllDemoNotificationsRead,
  deleteDemoNotification,
  getDemoDiagnosis,
  resetDemoFallbackState,
} from './demoFallback';

describe('demoFallback utilities', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    resetDemoFallbackState();
  });

  it('correctly identifies demo@boim.com email regardless of case or whitespace', () => {
    expect(isDemoAccountEmail('demo@boim.com')).toBe(true);
    expect(isDemoAccountEmail(' DEMO@boim.com ')).toBe(true);
    expect(isDemoAccountEmail('test@boim.com')).toBe(false);
    expect(isDemoAccountEmail(null)).toBe(false);
  });

  it('detects demo session when logged in as demo@boim.com', () => {
    expect(isDemoSession()).toBe(false);
    useAuthStore.getState().login(getDemoAuthUser(), DEMO_ACCESS_TOKEN);
    expect(isDemoSession()).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe(DEMO_EMAIL);
  });

  it('provides restored insurance data and supports in-memory CRUD', () => {
    const initial = getDemoInsurances();
    expect(initial.length).toBe(7);
    expect(initial[0].name).toContain('실손의료비보험');

    const first = getDemoInsuranceById(1);
    expect(first.institution).toBe('삼성화재');

    const created = createDemoInsurance({
      userId: 1,
      category: '실비보험',
      name: '테스트 신규 보험',
      institution: '메리츠화재',
      startDate: '2026-01-01',
      maturityDate: '2046-01-01',
      monthlyPayment: 42000,
      coverageAmount: 50000000,
    });
    expect(getDemoInsurances().length).toBe(8);

    const updated = updateDemoInsurance(created.id, { monthlyPayment: 49000 });
    expect(updated.monthlyPayment).toBe(49000);

    deleteDemoInsurance(created.id);
    expect(getDemoInsurances().length).toBe(7);
  });

  it('supports demo notification read and delete operations and diagnosis calculation', () => {
    const notifs = getDemoNotifications();
    expect(notifs.length).toBeGreaterThan(0);

    const readItem = markDemoNotificationRead(notifs[0].id);
    expect(readItem.isRead).toBe(true);

    const markAll = markAllDemoNotificationsRead();
    expect(markAll.count).toBeGreaterThanOrEqual(0);

    deleteDemoNotification(notifs[0].id);
    expect(getDemoNotifications().length).toBe(notifs.length - 1);

    const diagnosis = getDemoDiagnosis();
    expect(diagnosis.score).toBe(88);
    expect(diagnosis.totalMonthlyPayment).toBeGreaterThan(0);
  });
});
