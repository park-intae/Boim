export interface CalendarDayEvent {
  id: string | number;
  title: string;
  type: 'payment' | 'maturity';
  amount?: number;
  date: string; // YYYY-MM-DD
}

export const mockCalendarEvents: CalendarDayEvent[] = [
  {
    id: 1,
    title: '현대해상 굿앤굿어린이종합보험 납입',
    type: 'payment',
    amount: 120000,
    date: '2026-11-15',
  },
  {
    id: 2,
    title: '삼성화재 실손의료비보장보험 납입',
    type: 'payment',
    amount: 35000,
    date: '2026-11-10',
  },
  {
    id: 3,
    title: 'KB 암케어종합치료보험 만기',
    type: 'maturity',
    date: '2026-11-28',
  },
];
