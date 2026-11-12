import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  clearReconnected: () => void;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearReconnected = () => {
    setWasOffline(false);
  };

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline: isOnline && wasOffline,
    clearReconnected,
  };
}
