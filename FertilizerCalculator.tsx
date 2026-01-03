import React, { useState } from 'react';
import { Calculator, ArrowLeft, Sprout } from 'lucide-react';

interface FertilizerCalculatorProps {
  onBack: () => void;
}

export const FertilizerCalculator: React.FC<FertilizerCalculatorProps> = ({ onBack }) => {
  const [crop, setCrop] = useState('tomate');
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState('m2');
  const [result, setResult] = useState<{ureia: number, superfosfato: number, cloreto: number} | null>(null);

  const handleCalculate = () => {
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) return;

    const recommendations: Record<string, number[]> = {
      tomate: [150, 100, 200],
      milho: [180, 80, 100],
      alface: [80, 60, 80],
      cafe: [200, 50, 200],
      soja: [0, 80, 80]
    };

    const [reqN, reqP, reqK] = recommendations[crop] || [100, 100, 100];
    const hectares = unit === 'm2' ? areaNum / 10000 : areaNum;

    const totalN = reqN * hectares;
    const totalP = reqP * hectares;
    const totalK = reqK * hectares;

    setResult({
      ureia: Math.ceil(totalN / 0.45),
      superfosfato: Math.ceil(totalP / 0.18),
      cloreto: Math.ceil(totalK / 0.60)
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 min-h-[80vh] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden">
      <div className="bg-orange-500 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <button onClick={onBack} className="flex items-center gap-2 font-medium mb-4 hover:bg-white/10 w-fit px-3 py-1 rounded-full transition-colors">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
                <Calculator size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold">Calculadora</h2>
                <p className="text-orange-100 text-sm">Planeje sua adubação</p>
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selecione a Cultura</label>
          <div className="grid grid-cols-3 gap-2">
            {['tomate', 'milho', 'alface', 'cafe', 'soja'].map(c => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-all ${
                  crop === c 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-400' 
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Área do Plantio</label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: 500"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Unidade</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            >
              <option value="m2">m²</option>
              <option value="ha">Hectares</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all"
        >
          Calcular Recomendação
        </button>

        {result && (
          <div className="mt-8 animate-fade-in bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
             <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
               <Sprout size={20} className="text-green-500"/>
               Estimativa de Insumos
             </h3>
             <div className="space-y-3">
               <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">N</div>
                     <div>
                       <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ureia</p>
                       <p className="text-xs text-slate-400">Fonte de Nitrogênio</p>
                     </div>
                  </div>
                  <span className="font-bold text-lg text-slate-800 dark:text-white">{result.ureia} <span className="text-sm font-normal text-slate-500">kg</span></span>
               </div>

               <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">P</div>
                     <div>
                       <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Superfosfato</p>
                       <p className="text-xs text-slate-400">Fonte de Fósforo</p>
                     </div>
                  </div>
                  <span className="font-bold text-lg text-slate-800 dark:text-white">{result.superfosfato} <span className="text-sm font-normal text-slate-500">kg</span></span>
               </div>

               <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">K</div>
                     <div>
                       <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cloreto de Potássio</p>
                       <p className="text-xs text-slate-400">Fonte de Potássio</p>
                     </div>
                  </div>
                  <span className="font-bold text-lg text-slate-800 dark:text-white">{result.cloreto} <span className="text-sm font-normal text-slate-500">kg</span></span>
               </div>
             </div>
             <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
               * Valores estimados para adubação de cobertura padrão. Consulte sempre um engenheiro agrônomo para análise de solo precisa.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};