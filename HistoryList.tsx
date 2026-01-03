import React from 'react';
import { PlantAnalysisResult } from './types';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface HistoryListProps {
  items: PlantAnalysisResult[];
  onSelect: (item: PlantAnalysisResult) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-16 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="text-green-600 dark:text-green-500" />
          Minhas Plantas
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">{items.length} salvos</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isHealthy = item.diagnosis.toLowerCase().includes('saudável') || item.diagnosis.toLowerCase().includes('healthy');
          const date = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

          return (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-md hover:border-green-200 dark:hover:border-green-700 transition-all duration-200"
            >
              <div className="relative h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.diagnosis} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-700 dark:text-slate-500">
                    Sem imagem
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                    isHealthy 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300'
                  }`}>
                    {Math.round(item.confidence)}%
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.diagnosis}</h4>
                  {isHealthy ? <CheckCircle size={16} className="text-green-500 shrink-0" /> : <AlertCircle size={16} className="text-red-500 shrink-0" />}
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium uppercase tracking-wide">
                  {item.cultureInfo?.commonName || 'Planta Desconhecida'}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
                  <button 
                    onClick={(e) => onDelete(item.id, e)}
                    className="text-xs text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};