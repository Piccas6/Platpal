// PWA Configuration Component
// Este componente contiene toda la configuración necesaria para convertir PlatPal en app nativa

export const manifestJSON = {
  "name": "PlatPal - Menús Sostenibles",
  "short_name": "PlatPal",
  "description": "Rescata menús deliciosos por solo 2,99€ y ayuda al planeta",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#10B981",
  "background_color": "#FFFFFF",
  "lang": "es",
  "dir": "ltr",
  "categories": ["food", "lifestyle", "education"],
  "icons": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Ver Menús",
      "short_name": "Menús",
      "description": "Explorar menús disponibles",
      "url": "/?page=Menus",
      "icons": [{
        "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
        "sizes": "96x96"
      }]
    },
    {
      "name": "Mis Bonos",
      "short_name": "Bonos",
      "description": "Ver mis bonos activos",
      "url": "/?page=Bonos",
      "icons": [{
        "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png",
        "sizes": "96x96"
      }]
    }
  ]
};

export const serviceWorkerCode = `
// PlatPal Service Worker
const CACHE_NAME = 'platpal-v1';
const RUNTIME_CACHE = 'platpal-runtime';

const ESSENTIAL_ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ESSENTIAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (request.url.includes('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('/')))
  );
});
`;

export const PWA_INSTRUCTIONS = `
📱 GUÍA RÁPIDA: Convertir PlatPal a App Nativa

═══════════════════════════════════════════════════════════════

🎯 MÉTODO RECOMENDADO: PWABuilder
═══════════════════════════════════════════════════════════════

1. Ve a: https://www.pwabuilder.com/
2. Ingresa la URL de tu app PlatPal
3. Click "Start" para analizar
4. Ve a "Publish" → "Android"
5. Configura:
   - Package ID: com.platpal.app
   - App Name: PlatPal
   - Theme: #10B981
6. Click "Generate" → Descarga APK
7. Sube a Google Play Console

Tiempo: 10 minutos ✅

═══════════════════════════════════════════════════════════════

📦 ARCHIVOS NECESARIOS
═══════════════════════════════════════════════════════════════

Crea estos archivos en la raíz de tu proyecto web:

1. manifest.json:
${JSON.stringify(manifestJSON, null, 2)}

2. service-worker.js:
${serviceWorkerCode}

3. En tu index.html, agrega:
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#10B981">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

4. Registra el service worker:
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
</script>

═══════════════════════════════════════════════════════════════

🎨 ICONOS NECESARIOS
═══════════════════════════════════════════════════════════════

Genera estos tamaños del logo PlatPal:
✓ 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

Herramienta recomendada:
https://www.pwabuilder.com/imageGenerator

═══════════════════════════════════════════════════════════════

🧪 TESTING
═══════════════════════════════════════════════════════════════

1. Lighthouse PWA Audit → debe ser 100
2. Verifica manifest.json accesible
3. Service worker registrado en DevTools
4. Instala PWA en móvil y prueba offline

═══════════════════════════════════════════════════════════════

📱 PUBLICAR EN GOOGLE PLAY
═══════════════════════════════════════════════════════════════

Requisitos:
- Cuenta Google Play Developer ($25 único)
- APK/AAB generado
- Screenshots (2-8 imágenes, 1080x1920 recomendado)
- Icono 512x512
- Feature graphic 1024x500
- Política de privacidad (URL pública)

Proceso:
1. Play Console → Crear app
2. Subir APK
3. Completar listing
4. Submit → Revisión (1-7 días)

═══════════════════════════════════════════════════════════════

✨ VENTAJAS DE TWA
═══════════════════════════════════════════════════════════════

✅ Actualizaciones instantáneas (sin aprobar cada cambio)
✅ Mismo código web → app nativa
✅ Push notifications
✅ Icono en home screen
✅ Splash screen
✅ Modo offline básico
✅ Experiencia nativa completa

═══════════════════════════════════════════════════════════════
`;

export default function PWAConfigComponent() {
  const downloadManifest = () => {
    const blob = new Blob([JSON.stringify(manifestJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadServiceWorker = () => {
    const blob = new Blob([serviceWorkerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-worker.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInstructions = () => {
    const blob = new Blob([PWA_INSTRUCTIONS], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PWA-INSTRUCTIONS.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(manifestJSON, null, 2));
    alert('✅ manifest.json copiado al portapapeles');
  };

  const copyServiceWorker = () => {
    navigator.clipboard.writeText(serviceWorkerCode);
    alert('✅ service-worker.js copiado al portapapeles');
  };

  return null; // Este componente solo exporta configuración, no renderiza nada
}