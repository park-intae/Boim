import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightPanel } from '../components/layout/RightPanel';
import { useAppStore } from '../store/useAppStore';
import {
  useGetInsurances,
  useDeleteInsurance,
} from '../api/useInsuranceQueries';

// 모킹
vi.mock('../api/useInsuranceQueries', () => ({
  useGetInsurances: vi.fn(),
  useCreateInsurance: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateInsurance: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteInsurance: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('../components/layout/PolicyDocumentUploader', () => ({
  PolicyDocumentUploader: () => <div data-testid="mock-uploader" />,
}));

vi.mock('../components/layout/AiDiagnosisReport', () => ({
  AiDiagnosisReport: () => <div data-testid="mock-ai-diagnosis" />,
}));

const initialStoreState = useAppStore.getState();

describe('RightPanel Component', () => {
  beforeEach(() => {
    // 스토어 초기화 (항상 최상단 초기 상태로)
    useAppStore.setState(initialStoreState, true);

    // API 초기화
    (useGetInsurances as Mock).mockReturnValue({
      data: [],
    });
  });

  it('기본적으로 예정된 일정이 없다는 문구가 나타나야 한다 (Empty State)', () => {
    render(<RightPanel />);
    expect(screen.getByText('예정된 일정이 없습니다')).toBeInTheDocument();
  });

  it('Empty State의 새 보험 등록 버튼 클릭 시 panelMode가 form으로 변경되어야 한다.', () => {
    render(<RightPanel />);
    const registerBtn = screen.getByText('새 보험 등록');

    fireEvent.click(registerBtn);

    expect(useAppStore.getState().panelMode).toBe('form');
  });

  it('하단 sticky 버튼 클릭 시 panelMode가 form으로 변경되어야 한다.', () => {
    render(<RightPanel />);
    const stickyBtn = screen.getByText('새로운 보험 등록');

    fireEvent.click(stickyBtn);

    expect(useAppStore.getState().panelMode).toBe('form');
  });

  it('일정 카드의 삭제 버튼 클릭 시 confirm을 거쳐 deleteInsurance가 호출되어야 한다.', () => {
    const mockDelete = vi.fn();
    (useDeleteInsurance as Mock).mockReturnValue({ mutate: mockDelete });

    // 모킹 데이터 설정 (선택된 날짜와 일치하도록 세팅)
    const mockDate = new Date();
    useAppStore.getState().setSelectedDate(mockDate);

    (useGetInsurances as Mock).mockReturnValue({
      data: [
        {
          id: 999,
          category: '암보험',
          name: '테스트 보험',
          institution: '테스트사',
          startDate: mockDate.toISOString(),
          monthlyPayment: 10000,
          coverageAmount: 1000000,
        },
      ],
    });

    window.confirm = vi.fn(() => true); // confirm 승인

    render(<RightPanel />);

    // 삭제 버튼 찾기
    const deleteBtn = screen.getByRole('button', { name: '삭제' });

    // 삭제 클릭
    fireEvent.click(deleteBtn);

    // confirm 호출 및 deleteInsurance 호출 확인
    expect(window.confirm).toHaveBeenCalledWith('정말 이 보험 일정을 삭제하시겠습니까?');
    expect(mockDelete).toHaveBeenCalledWith('999');
  });

  it('panelMode가 ai-diagnosis일 때 AI 종합 진단 헤더 및 컴포넌트가 렌더링되어야 한다.', () => {
    useAppStore.setState({ panelMode: 'ai-diagnosis' });
    render(<RightPanel />);

    expect(screen.getByText('AI 종합 진단')).toBeInTheDocument();
    expect(screen.getByTestId('mock-ai-diagnosis')).toBeInTheDocument();
  });

  it('일정 카드 클릭 시 editingProductId가 설정되고 panelMode가 form으로 변경되어야 한다.', () => {
    const mockDate = new Date();
    useAppStore.getState().setSelectedDate(mockDate);

    (useGetInsurances as Mock).mockReturnValue({
      data: [
        {
          id: 555,
          category: '실비보험',
          name: '실손의료비 보장보험',
          institution: '삼성화재',
          startDate: mockDate.toISOString(),
          monthlyPayment: 25000,
          coverageAmount: 50000000,
        },
      ],
    });

    render(<RightPanel />);

    const cardTitle = screen.getByText('실손의료비 보장보험');
    fireEvent.click(cardTitle);

    expect(useAppStore.getState().editingProductId).toBe('555');
    expect(useAppStore.getState().panelMode).toBe('form');
  });
});
