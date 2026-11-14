import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RouteErrorBoundary] Uncaught route error:', error, errorInfo);

    // 구버전 청크(Failed to fetch dynamically imported module) 캐시 불일치 시 자동 리로드
    const isChunkLoadFailed =
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError';

    if (isChunkLoadFailed) {
      const storageKey = 'boim_chunk_retry';
      const lastRetry = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // 무한 루프 방지: 최근 10초 이내에 리로드된 적이 없으면 강제 새로고침
      if (!lastRetry || now - parseInt(lastRetry, 10) > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
          <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold">!</span>
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-2">화면을 불러오지 못했습니다</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              새로운 버전이 배포되어 최신 화면 리소스를 불러오는 중입니다. 새로고침 버튼을 눌러주세요.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
