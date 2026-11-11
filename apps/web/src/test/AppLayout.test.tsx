import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

vi.mock('../components/layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

vi.mock('../components/layout/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../components/layout/RightPanel', () => ({
  RightPanel: () => <div data-testid="mock-right-panel">RightPanel</div>,
}));

describe('AppLayout Component', () => {
  it('renders sidebar, header, right panel and route outlet', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/test" element={<div data-testid="test-child">Child Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-right-panel')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
