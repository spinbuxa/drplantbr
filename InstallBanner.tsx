import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShowBanner(true), 2000);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="mx-2 mt-2 mb-4 bg-slate-900 text-white p-4 rounded-xl shadow-lg relative animate-fade-in border border-slate-700">
      <button 
        onClick={() => setShowBanner(false)} 
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-green-600 p-2 rounded-lg shrink-0">
          <Download size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm mb-1">Instalar Dr Plant</h3>
          {isIOS ? (
            <div className="text-xs text-slate-300">
              <p className="mb-1">Para instalar no iPhone:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Toque no botão <strong>Compartilhar</strong> <Share size={10} className="inline"/> abaixo</li>
                <li>Selecione <strong>Adicionar à Tela de Início</strong></li>
              </ol>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-300 mb-3">Adicione o app à sua tela inicial para acesso rápido e offline.</p>
              <button 
                onClick={handleInstallClick}
                className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-50 transition-colors"
              >
                Instalar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};