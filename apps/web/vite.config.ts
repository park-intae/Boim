/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 🚀 CSS 렌더링 차단(456ms)을 완전 해소하는 Non-blocking CSS 플러그인
function nonBlockingCssPlugin(): Plugin {
  return {
    name: 'non-blocking-css-plugin',
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        '<link rel="preload" href="$1" as="style" crossorigin onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>'
      );
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), nonBlockingCssPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false,
      resolveDependencies: (_filename, deps) => {
        // 첫 화면에서 불필요한 대형 차트, 엑셀, zod 번들은 초기 preload 목록에서 제외하여 FCP/LCP를 극적으로 단축
        return deps.filter(
          (dep) =>
            !dep.includes('vendor-charts') &&
            !dep.includes('vendor-excel') &&
            !dep.includes('vendor-zod'),
        );
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            // 1. 대형 지연 로딩 전용 라이브러리
            if (normalized.includes('/exceljs/')) {
              return 'vendor-excel';
            }
            // 2. React 코어 번들 (react, react-dom, react-is)
            if (
              normalized.includes('/react/') ||
              normalized.includes('/react-dom/') ||
              normalized.includes('/react-is/')
            ) {
              return 'vendor-react';
            }
            // 3. React 라우터
            if (
              normalized.includes('/react-router/') ||
              normalized.includes('/react-router-dom/')
            ) {
              return 'vendor-router';
            }
            // 3. 서버/클라이언트 상태 관리
            if (normalized.includes('/@tanstack/') || normalized.includes('/zustand/')) {
              return 'vendor-query';
            }
            // 4. 아이콘
            if (normalized.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            // 5. 폼 검증 라이브러리 (모달/폼 지연 로딩 분리)
            if (normalized.includes('/zod/')) {
              return 'vendor-zod';
            }
            // 6. 경량 유틸 (date-fns 등)
            if (normalized.includes('/date-fns/')) {
              return 'vendor-utils';
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/main.tsx',
        'src/router/**',
        'src/types/**',
        '**/*.d.ts',
        'src/test/**',
      ],
    },
  },
});
