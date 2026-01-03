import React, { useState } from 'react';
import { Search, Bug, ArrowLeft, ChevronRight } from 'lucide-react';

interface PestLibraryProps {
  onBack: () => void;
}

const PESTS = [
  {
    id: 1,
    name: 'Pulgão',
    scientific: 'Aphidoidea',
    crops: ['Tomate', 'Alface', 'Couve'],
    image: 'https://images.unsplash.com/photo-1548545814-7422f7375a06?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Pequenos insetos sugadores que causam o enrolamento das folhas e transmitem viroses.'
  },
  {
    id: 2,
    name: 'Lagarta do Cartucho',
    scientific: 'Spodoptera frugiperda',
    crops: ['Milho', 'Sorgo'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Spodoptera_frugiperda_-_5177247.jpg/640px-Spodoptera_frugiperda_-_5177247.jpg',
    description: 'Ataca o cartucho do milho, raspando as folhas e perfurando o colmo.'
  },
  {
    id: 3,
    name: 'Mosca Branca',
    scientific: 'Bemisia tabaci',
    crops: ['Soja', 'Tomate', 'Feijão'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Bemisia_tabaci_on_Euphorbia_pulcherrima.JPG/640px-Bemisia_tabaci_on_Euphorbia_pulcherrima.JPG',
    description: 'Sugam a seiva e favorecem o aparecimento de fumagina (fungo preto) nas folhas.'
  },
  {
    id: 4,
    name: 'Cochonilha',
    scientific: 'Dactylopius coccus',
    crops: ['Citros', 'Ornamentais'],
    image: 'https://images.unsplash.com/photo-1626600965021-36f78415d852?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Formam colônias brancas que parecem algodão, sugando a seiva e enfraquecendo a planta.'
  },
  {
    id: 5,
    name: 'Ácaro Rajado',
    scientific: 'Tetranychus urticae',
    crops: ['Morango', 'Algodão'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Tetranychus_urticae.jpg/640px-Tetranychus_urticae.jpg',
    description: 'Causa pontos amarelados nas folhas e teias finas na face inferior.'
  }
];

export const PestLibrary: React.FC<PestLibraryProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPests = PESTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.crops.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-slate-800 min-h-[80vh] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden">
      <div className="bg-red-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <button onClick={onBack} className="flex items-center gap-2 font-medium mb-4 hover:bg-white/10 w-fit px-3 py-1 rounded-full transition-colors">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
                <Bug size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Pragas</h2>
                <p className="text-red-100 text-sm">Identifique e controle</p>
            </div>
        </div>
      </div>

      <div className="p-4 sticky top-0 bg-white dark:bg-slate-800 z-10 border-b border-slate-100 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou cultura..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 transition-shadow"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredPests.length > 0 ? (
          filteredPests.map(pest => (
            <div key={pest.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors cursor-pointer group">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                <img src={pest.image} alt={pest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{pest.name}</h3>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 italic mb-1">{pest.scientific}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pest.crops.map(c => (
                    <span key={c} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {pest.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={24} />
            </div>
            <p className="text-slate-500 dark:text-slate-400">Nenhuma praga encontrada para "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};