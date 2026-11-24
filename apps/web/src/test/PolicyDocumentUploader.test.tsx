import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PolicyDocumentUploader } from '../components/layout/PolicyDocumentUploader';
import {
  useUploadDocument,
  useParseDocument,
  useParseSampleDocument,
} from '../api/useDocumentQueries';

vi.mock('../api/useDocumentQueries', () => ({
  useUploadDocument: vi.fn(),
  useParseDocument: vi.fn(),
  useParseSampleDocument: vi.fn(),
}));

describe('PolicyDocumentUploader Component', () => {
  const mockOnParsed = vi.fn();
  const mockUploadMutate = vi.fn();
  const mockParseMutate = vi.fn();
  const mockParseSampleMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUploadDocument).mockReturnValue({
      mutateAsync: mockUploadMutate,
    } as unknown as ReturnType<typeof useUploadDocument>);

    vi.mocked(useParseDocument).mockReturnValue({
      mutateAsync: mockParseMutate,
    } as unknown as ReturnType<typeof useParseDocument>);

    vi.mocked(useParseSampleDocument).mockReturnValue({
      mutateAsync: mockParseSampleMutate,
    } as unknown as ReturnType<typeof useParseSampleDocument>);
  });

  it('기본 UI가 정상적으로 렌더링되어야 한다', () => {
    render(<PolicyDocumentUploader onParsed={mockOnParsed} />);

    expect(screen.getByText('증권 파일로 간편 자동 채우기')).toBeInTheDocument();
    expect(screen.getByText('증권 파일 선택 또는 여기로 드래그')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /온보딩 샘플 증권으로 원클릭 분석해보기/i }),
    ).toBeInTheDocument();
  });

  it('샘플 버튼 클릭 시 모의 증권을 파싱하고 onParsed 콜백을 호출해야 한다', async () => {
    const mockParsedData = {
      institution: '한화손해보험',
      name: '무배당 한화 라이프케어 건강종합보험',
      category: 'HEALTH',
      monthlyPayment: 85000,
      paymentDay: 15,
      startDate: '2024-03-01',
      maturityDate: '2044-03-01',
      coverageAmount: 50000000,
      confidence: 0.99,
    };

    mockParseSampleMutate.mockResolvedValueOnce({
      documentId: 'sample-preset',
      ocrText: '샘플 텍스트',
      parsedData: mockParsedData,
    });

    render(<PolicyDocumentUploader onParsed={mockOnParsed} />);

    const sampleBtn = screen.getByRole('button', {
      name: /온보딩 샘플 증권으로 원클릭 분석해보기/i,
    });
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(mockParseSampleMutate).toHaveBeenCalledTimes(1);
      expect(mockOnParsed).toHaveBeenCalledWith(mockParsedData);
    });
  });

  it('파일 드롭 시 업로드 및 파싱이 순차적으로 실행되어야 한다', async () => {
    const mockFile = new File(['mock content'], 'test_policy.pdf', {
      type: 'application/pdf',
    });

    const mockParsedData = {
      institution: '삼성화재',
      name: '삼성화재 건강보험',
      category: 'HEALTH',
      monthlyPayment: 60000,
      startDate: '2024-01-01',
      maturityDate: '2044-01-01',
      coverageAmount: 30000000,
    };

    mockUploadMutate.mockResolvedValueOnce({
      documentId: 12,
      fileUrl: '/uploads/documents/test.pdf',
      fileName: 'test_policy.pdf',
      uploadedAt: '2026-10-30T00:00:00Z',
    });

    mockParseMutate.mockResolvedValueOnce({
      documentId: 12,
      ocrText: '추출된 OCR 텍스트',
      parsedData: mockParsedData,
    });

    render(<PolicyDocumentUploader onParsed={mockOnParsed} />);

    const dropZone = screen
      .getByText('증권 파일 선택 또는 여기로 드래그')
      .closest('div[class*="border-dashed"]');
    expect(dropZone).toBeInTheDocument();

    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
        },
      });
    }

    await waitFor(() => {
      expect(mockUploadMutate).toHaveBeenCalledWith({ file: mockFile });
      expect(mockParseMutate).toHaveBeenCalledWith({ documentId: 12 });
      expect(mockOnParsed).toHaveBeenCalledWith(mockParsedData);
    });
  });

  it('파일 업로드가 실패하면 에러 메시지를 화면에 표시하고 parse를 호출하지 않아야 한다.', async () => {
    mockUploadMutate.mockRejectedValueOnce(new Error('파일 크기가 제한을 초과했습니다.'));

    const { container } = render(<PolicyDocumentUploader onParsed={mockOnParsed} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'large.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('파일 크기가 제한을 초과했습니다.')).toBeInTheDocument();
    });
    expect(mockParseMutate).not.toHaveBeenCalled();
    expect(mockOnParsed).not.toHaveBeenCalled();
  });

  it('문서 파싱이 실패하면 에러 메시지를 화면에 표시해야 한다.', async () => {
    mockUploadMutate.mockResolvedValueOnce({ documentId: 99 });
    mockParseMutate.mockRejectedValueOnce(new Error('텍스트 추출에 실패했습니다.'));

    const { container } = render(<PolicyDocumentUploader onParsed={mockOnParsed} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'corrupted.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('텍스트 추출에 실패했습니다.')).toBeInTheDocument();
    });
    expect(mockOnParsed).not.toHaveBeenCalled();
  });

  it('샘플 증권 분석이 실패하면 에러 메시지를 화면에 표시해야 한다.', async () => {
    const { useParseSampleDocument } = await import('../api/useDocumentQueries');
    vi.mocked(useParseSampleDocument).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValueOnce(new Error('샘플 데이터를 불러올 수 없습니다.')),
    } as never);

    render(<PolicyDocumentUploader onParsed={mockOnParsed} />);
    fireEvent.click(screen.getByText('📄 온보딩 샘플 증권으로 원클릭 분석해보기'));

    await waitFor(() => {
      expect(screen.getByText('샘플 데이터를 불러올 수 없습니다.')).toBeInTheDocument();
    });
    expect(mockOnParsed).not.toHaveBeenCalled();
  });
});
