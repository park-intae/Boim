import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Router', () => {
  it('기본 경로(/) 접속 시 홈 페이지가 렌더링되어야 한다', () => {
    render(<App />);
    expect(screen.getByText(/Boim 캘린더 & 대시보드 홈/i)).toBeInTheDocument();
  });
});
