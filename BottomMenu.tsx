import React from 'react';
import { Home, Users, Camera, BookOpen, User } from 'lucide-react';

interface BottomMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCameraClick: () => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({ activeTab, setActiveTab, onCameraClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 pb-safe">
      <div className="container mx-auto max-w-lg flex items-end justify-between px-2 h-16 pb-2 relative">
        
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${activeTab === 'home' ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
           onClick={() => setActiveTab('community')}
           className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${activeTab === 'community' ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Users size={22} strokeWidth={activeTab === 'community' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Comunidade</span>
        </button>

        <div className="relative -top-6 flex-1 flex justify-center pointer-events-none">
          <button
            onClick={onCameraClick}
            className="pointer-events-auto w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-600/40 transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-900"
            aria-label="Diagnosticar"
          >
            <Camera size={28} />
          </button>
        </div>

        <button
           onClick={() => setActiveTab('library')}
           className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${activeTab === 'library' ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <BookOpen size={22} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Dicas</span>
        </button>

        <button
           onClick={() => setActiveTab('profile')}
           className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${activeTab === 'profile' ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};