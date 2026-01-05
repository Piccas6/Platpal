import { useEffect } from 'react';

/**
 * PWAHead Component
 * Inyecta las etiquetas meta y links necesarios para PWA
 * Compatible con PWABuilder y TWA (Trusted Web Activity)
 */
export default function PWAHead() {
  useEffect(() => {
    // Manifest link - apunta a la función backend
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/api/manifest';
      document.head.appendChild(manifestLink);
    }

    // Theme color - negro para PWABuilder
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = '#000000';
      document.head.appendChild(themeColor);
    }

    // iOS Safari - Web App Capable
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      document.head.appendChild(appleMeta);
    }

    // iOS Safari - Status Bar Style
    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const statusBar = document.createElement('meta');
      statusBar.name = 'apple-mobile-web-app-status-bar-style';
      statusBar.content = 'black';
      document.head.appendChild(statusBar);
    }

    // iOS Safari - App Title
    if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
      const appTitle = document.createElement('meta');
      appTitle.name = 'apple-mobile-web-app-title';
      appTitle.content = 'Platpal';
      document.head.appendChild(appTitle);
    }

    // Apple Touch Icon (192x192)
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.sizes = '192x192';
      appleTouchIcon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/icon-192.png';
      document.head.appendChild(appleTouchIcon);
    }

    // Mobile Web App Capable (Android)
    if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
      const mobileWebApp = document.createElement('meta');
      mobileWebApp.name = 'mobile-web-app-capable';
      mobileWebApp.content = 'yes';
      document.head.appendChild(mobileWebApp);
    }

    // Application Name
    if (!document.querySelector('meta[name="application-name"]')) {
      const appName = document.createElement('meta');
      appName.name = 'application-name';
      appName.content = 'Platpal';
      document.head.appendChild(appName);
    }

    // MS Application Tile Color
    if (!document.querySelector('meta[name="msapplication-TileColor"]')) {
      const tileColor = document.createElement('meta');
      tileColor.name = 'msapplication-TileColor';
      tileColor.content = '#000000';
      document.head.appendChild(tileColor);
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/api/serviceWorker', { scope: '/' })
        .then((registration) => {
          console.log('✅ PWA Service Worker registrado:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nueva versión disponible');
              }
            });
          });
        })
        .catch((err) => console.error('❌ Error SW:', err));
    }
  }, []);

  return null;
}