import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Router', () => {
  it('기본 경로(/) 접속 시 비로그인 사용자에게 랜딩 페이지가 기본 렌더링되어야 한다', async () => {
    render(<App />);
    const boimElements = await screen.findAllByText(/Boim/i);
    expect(boimElements.length).toBeGreaterThan(0);
  });
});
