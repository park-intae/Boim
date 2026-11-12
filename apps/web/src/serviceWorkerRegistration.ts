/**
 * Service Worker Registration Helper
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 개발 환경에서는 Service Worker 캐싱이 개발 방해가 될 수 있으므로 프로덕션에서 활성화
      if (import.meta.env.PROD) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[Boim PWA] Service Worker registered with scope:', registration.scope);

            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[Boim PWA] New content available; please refresh.');
                    } else {
                      console.log('[Boim PWA] Content cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('[Boim PWA] Service Worker registration failed:', error);
          });
      }
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
