import React, { useState } from 'react';
import { PlantAnalysisResult } from './types';
import { 
  AlertCircle, CheckCircle, Leaf, Shield, TestTube, AlertTriangle, 
  Sprout, Info, ThermometerSun, Droplet, Bug, Share2, 
  Check, Plus, ChevronDown, ChevronUp
} from 'lucide-react';

interface AnalysisResultsProps {
  result: PlantAnalysisResult;
  onSave?: (result: PlantAnalysisResult) => void;
  isSaved?: boolean;
  onUpdateNotes?: (id: string, notes: string) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onSave, isSaved = false }) => {
  const [activeSection, setActiveSection] = useState<string | null>('treatment');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (!result.isPlant) {
    return (
      <div className="p-6 text-center">
        <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
          <Info size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Não identificamos uma planta</h3>
        <p className="text-slate-600 mb-4">{result.description}</p>
        <p className="text-sm text-slate-500">Tente fotografar uma folha, fruto ou a planta inteira com boa iluminação.</p>
      </div>
    );
  }

  const isHealthy = result.diagnosis.toLowerCase().includes('saudável') || result.diagnosis.toLowerCase().includes('healthy');

  const handleShare = async () => {
    const shareText = `Diagnóstico Dr Plant: ${result.diagnosis}\n${result.description}`;
    if (navigator.share) {
      await navigator.share({ title: 'Dr Plant', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Copiado para a área de transferência!');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-b-2xl animate-fade-in">
      
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">RESULTADO</span>
           <span className={`text-xs font-bold px-2 py-1 rounded-md ${isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {Math.round(result.confidence)}% Confiança
           </span>
        </div>
        <h2 className={`text-2xl font-extrabold mb-1 ${isHealthy ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
          {result.diagnosis}
        </h2>
        {result.scientificName && (
           <p className="text-slate-500 dark:text-slate-400 italic text-sm mb-4">{result.scientificName}</p>
        )}
        
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
           {result.description}
        </p>

        <div className="flex gap-3">
           {onSave && (
             <button 
               onClick={() => onSave(result)}
               disabled={isSaved}
               className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${isSaved ? 'bg-slate-100 text-slate-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
             >
               {isSaved ? <Check size={18}/> : <Plus size={18}/>}
               {isSaved ? 'Salvo' : 'Salvar Diagnóstico'}
             </button>
           )}
           <button onClick={handleShare} className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200">
              <Share2 size={20} />
           </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
         
         {!isHealthy && result.symptoms && result.symptoms.length > 0 && (
           <div className="bg-slate-50 dark:bg-slate-800/50">
             <button onClick={() => toggleSection('symptoms')} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <AlertTriangle size={18} />
                   </div>
                   <span className="font-bold text-slate-800 dark:text-slate-200">Sintomas</span>
                </div>
                {activeSection === 'symptoms' ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
             </button>
             {activeSection === 'symptoms' && (
                <div className="px-4 pb-4 pl-14">
                   <ul className="space-y-2">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 list-disc ml-4">{s}</li>
                      ))}
                   </ul>
                </div>
             )}
           </div>
         )}

         <div className="bg-white dark:bg-slate-800">
             <button onClick={() => toggleSection('treatment')} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <TestTube size={18} />
                   </div>
                   <span className="font-bold text-slate-800 dark:text-slate-200">Recomendação de Tratamento</span>
                </div>
                {activeSection === 'treatment' ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
             </button>
             {activeSection === 'treatment' && (
                <div className="px-4 pb-6 pl-14 space-y-4">
                   {isHealthy ? (
                      <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
                         Continue mantendo os cuidados atuais. Sua planta está ótima!
                      </div>
                   ) : (
                      <>
                        {result.treatment.chemical && result.treatment.chemical.length > 0 && (
                           <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Químico</h4>
                              <ul className="space-y-2">
                                 {result.treatment.chemical.map((t, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                       <span className="text-red-500 font-bold">•</span> {t}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}
                        
                        {result.treatment.biological && result.treatment.biological.length > 0 && (
                           <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biológico / Orgânico</h4>
                              <ul className="space-y-2">
                                 {result.treatment.biological.map((t, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                                       <span className="text-green-500 font-bold">•</span> {t}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}

                        <div className="pt-2">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prevenção</h4>
                           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                              <ul className="space-y-2">
                                 {result.treatment.prevention.map((t, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                                       <Shield size={16} className="shrink-0 mt-0.5" /> {t}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                      </>
                   )}
                </div>
             )}
         </div>

         {result.cultureInfo && (
           <div className="bg-white dark:bg-slate-800">
             <button onClick={() => toggleSection('culture')} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Sprout size={18} />
                   </div>
                   <span className="font-bold text-slate-800 dark:text-slate-200">Detalhes da Cultura</span>
                </div>
                {activeSection === 'culture' ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
             </button>
             {activeSection === 'culture' && (
                <div className="px-4 pb-6 pl-14">
                   <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-50 p-2 rounded text-center">
                         <ThermometerSun size={16} className="mx-auto text-orange-400 mb-1"/>
                         <span className="text-xs text-slate-500 block">Solo</span>
                         <span className="text-xs font-bold text-slate-700">{result.cultureInfo.idealConditions.soil}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded text-center">
                         <Droplet size={16} className="mx-auto text-blue-400 mb-1"/>
                         <span className="text-xs text-slate-500 block">Umidade</span>
                         <span className="text-xs font-bold text-slate-700">{result.cultureInfo.idealConditions.humidity}</span>
                      </div>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-300">
                      {result.cultureInfo.description}
                   </p>
                </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
};