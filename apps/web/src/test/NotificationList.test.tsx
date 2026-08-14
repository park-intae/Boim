import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationList } from '../components/layout/NotificationList';

describe('NotificationList Component', () => {
  it('더미 알림 데이터가 화면에 정상적으로 렌더링되어야 한다.', () => {
    render(<NotificationList />);
    
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('보험료 납입일 안내')).toBeInTheDocument();
    expect(screen.getByText('자동차 보험 갱신 안내')).toBeInTheDocument();
    expect(screen.getByText('1개의 새로운 알림')).toBeInTheDocument();
  });

  it('읽지 않은 알림을 클릭하면 읽음 처리되어 뱃지가 사라져야 한다.', () => {
    render(<NotificationList />);
    
    expect(screen.getByText('1개의 새로운 알림')).toBeInTheDocument();
    
    // 알림 아이템 클릭
    const unreadItem = screen.getByText('보험료 납입일 안내');
    fireEvent.click(unreadItem);
    
    // 클릭 후에는 뱃지가 사라져야 함
    expect(screen.queryByText('1개의 새로운 알림')).not.toBeInTheDocument();
  });

  it('데이터가 비어있을 때 Empty State 안내 문구가 올바르게 렌더링되어야 한다.', () => {
    render(<NotificationList initialNotifications={[]} />);
    
    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });
});
