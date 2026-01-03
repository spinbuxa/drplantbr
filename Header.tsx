import React from 'react';
import { Sprout, Moon, Sun, Share2 } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isDarkMode, toggleTheme }) => {
  const handleShareApp = async () => {
    const shareData = {
      title: 'Dr Plant',
      text: 'Diagnostique suas plantas com Inteligência Artificial! Acesse:',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <nav className="bg-green-600 dark:bg-green-800 text-white sticky top-0 z-50 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <button 
          onClick={onReset} 
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Sprout size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Dr Plant</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShareApp}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Compartilhar App"
          >
            <Share2 size={20} />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};