import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function InstallPWA({ language = 'es' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(language === 'es' 
        ? '📱 Para instalar PlatPal:\n\nEn móvil: Menú del navegador (⋮) → "Añadir a pantalla de inicio"\n\nEn ordenador: Icono de instalación en la barra de direcciones' 
        : '📱 To install PlatPal:\n\nOn mobile: Browser menu (⋮) → "Add to Home Screen"\n\nOn desktop: Install icon in address bar');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowButton(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8 animate-bounce">
      <div className="relative">
        <button
          onClick={() => setShowButton(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition-colors z-10 shadow-lg"
          aria-label="Cerrar"
        >
          <X className="w-3 h-3" />
        </button>
        <Button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-full pl-4 pr-5 py-3 md:pl-5 md:pr-6 md:py-6 flex items-center gap-2 text-sm md:text-base font-bold"
        >
          <Download className="w-5 h-5 md:w-6 md:h-6" />
          <span>
            {language === 'es' ? 'Instalar App' : 'Install App'}
          </span>
        </Button>
      </div>
    </div>
  );
}