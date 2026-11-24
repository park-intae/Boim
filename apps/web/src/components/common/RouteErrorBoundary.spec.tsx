import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

describe('RouteErrorBoundary', () => {
  const originalLocation = window.location;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        reload: reloadMock,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('에러가 없으면 자식 컴포넌트를 정상 렌더링해야 한다', () => {
    render(
      <RouteErrorBoundary>
        <div>정상 화면</div>
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('정상 화면')).toBeInTheDocument();
  });

  it('일반 런타임 에러 발생 시 자동 리로드 없이 안내 화면을 표시하고 새로고침 버튼 클릭 시 reload를 호출해야 한다', () => {
    render(
      <RouteErrorBoundary>
        <ThrowError error={new Error('일반 런타임 에러')} />
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('화면을 불러오지 못했습니다')).toBeInTheDocument();
    expect(reloadMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('ChunkLoadError 발생 시 최근 10초 이내 리로드 이력이 없으면 자동 리로드하고 타임스탬프를 저장해야 한다', () => {
    const chunkError = new Error('Failed to fetch dynamically imported module: /assets/Login.js');

    render(
      <RouteErrorBoundary>
        <ThrowError error={chunkError} />
      </RouteErrorBoundary>,
    );

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('boim_chunk_retry')).toBeTruthy();
  });

  it('최근 10초 이내에 이미 리로드한 이력이 있으면 무한 루프 방지를 위해 자동 리로드를 건너뛰어야 한다', () => {
    sessionStorage.setItem('boim_chunk_retry', String(Date.now()));
    const chunkError = new Error('Chunk failure');
    chunkError.name = 'ChunkLoadError';

    render(
      <RouteErrorBoundary>
        <ThrowError error={chunkError} />
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('화면을 불러오지 못했습니다')).toBeInTheDocument();
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
