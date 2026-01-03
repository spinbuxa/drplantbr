import React from 'react';
import { CloudSun, Droplets, Wind, MapPin } from 'lucide-react';

export const PlantWeather: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-800 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
             <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <MapPin size={14} />
                <span className="text-xs font-semibold tracking-wide">SUA LOCALIZAÇÃO</span>
             </div>
             <h2 className="text-4xl font-bold tracking-tight mb-1">26°C</h2>
             <p className="text-green-50 font-medium">Parcialmente Nublado</p>
          </div>
          <CloudSun size={56} className="text-green-50 drop-shadow-md" />
        </div>
        
        <div className="flex gap-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
             <Droplets size={18} className="text-green-100" />
             <div>
               <p className="text-xs text-green-100">Umidade</p>
               <span className="text-sm font-bold">65%</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Wind size={18} className="text-green-100" />
             <div>
                <p className="text-xs text-green-100">Vento</p>
                <span className="text-sm font-bold">12 km/h</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};