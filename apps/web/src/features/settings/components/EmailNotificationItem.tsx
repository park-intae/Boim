interface EmailNotificationItemProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * 탈착형(Pluggable) 이메일 알림 설정 아이템 컴포넌트
 * - 이메일 알림 기능 탈착 시 이 컴포넌트만 마운트 해제/주석 처리하면 완료
 */
export const EmailNotificationItem = ({
  enabled,
  onToggle,
  disabled = false,
}: EmailNotificationItemProps) => {
  return (
    <div className="flex items-center justify-between text-[14px] text-gray-800">
      <div className="flex flex-col">
        <span className="font-medium">이메일 알림</span>
        <span className="text-xs text-gray-400">납입일 및 만기 도래 시 이메일 수신</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="이메일 알림 토글"
        disabled={disabled}
        className={`flex h-5 w-9 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-200'
            : enabled
              ? 'bg-indigo-600'
              : 'bg-gray-200'
        }`}
        onClick={onToggle}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
