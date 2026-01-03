import React, { useState, useEffect } from 'react';
import { analyzePlantImage } from './geminiService';
import { PlantAnalysisResult } from './types';
import { InstallBanner } from './InstallBanner';
import { ImageUpload } from './ImageUpload';
import { AnalysisResults } from './AnalysisResults';
import { HistoryList } from './HistoryList';
import { FertilizerCalculator } from './FertilizerCalculator';
import { PestLibrary } from './PestLibrary';
import { Header } from './Header';
import { PlantWeather } from './PlantWeather';
import { BottomMenu } from './BottomMenu';
import { 
  Loader2, AlertTriangle, Users, BookOpen, Calculator, 
  Sprout, Bug, ThumbsUp, MessageSquare
} from 'lucide-react';

const STORAGE_KEY = 'drplant_history_v1';
const APP_VERSION = '1.3.1'; 

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState<'dashboard' | 'calculator' | 'pests'>('dashboard');
  
  const [analysis, setAnalysis] = useState<PlantAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<PlantAnalysisResult[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'home') {
      setCurrentView('dashboard');
      if (selectedImage && !analysis) {
        setSelectedImage(null);
      }
    }
  }, [activeTab]);

  const saveToHistory = (result: PlantAnalysisResult) => {
    const newResult = { ...result, imageUrl: selectedImage || undefined };
    const updatedHistory = [newResult, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    if (analysis && analysis.id === id) {
      setAnalysis({ ...analysis, userNotes: notes });
    }
    const existsInHistory = history.some(h => h.id === id);
    if (existsInHistory) {
      const updatedHistory = history.map(h =>
        h.id === id ? { ...h, userNotes: notes } : h
      );
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setSelectedImage(base64Image);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setActiveTab('home');
    setCurrentView('dashboard');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await analyzePlantImage(base64Image);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      // Use the specific error message from the service
      setError(err.message || 'Não foi possível identificar o problema. Tente uma foto mais clara da folha ou fruto afetado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: PlantAnalysisResult) => {
    setAnalysis(item);
    setSelectedImage(item.imageUrl || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('home');
    setCurrentView('dashboard');
  };

  const handleReset = () => {
    setAnalysis(null);
    setSelectedImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('home');
    setCurrentView('dashboard');
  };

  const triggerCamera = () => {
    handleReset();
    setActiveTab('home');
    setTimeout(() => {
        const uploadElement = document.getElementById('image-upload-area');
        if(uploadElement) {
            uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            uploadElement.classList.add('ring-4', 'ring-green-400', 'transition-all');
            setTimeout(() => uploadElement.classList.remove('ring-4', 'ring-green-400'), 1500);
        }
    }, 100);
  };

  const isCurrentAnalysisSaved = analysis ? history.some(h => h.id === analysis.id) : false;

  const renderCommunity = () => (
    <div className="space-y-4 animate-fade-in pb-20">
       <div className="bg-white dark:bg-slate-800 p-4 sticky top-14 z-10 shadow-sm border-b border-slate-100 dark:border-slate-700">
         <div className="flex justify-between items-center mb-4">
           <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Comunidade</h2>
           <button className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Minhas Culturas</button>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Todos', 'Tomate', 'Milho', 'Soja', 'Café', 'Citros'].map((tag, i) => (
              <span key={i} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border ${i === 0 ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                {tag}
              </span>
            ))}
         </div>
       </div>

       {[1, 2, 3].map((post) => (
         <div key={post} className="bg-white dark:bg-slate-800 p-4 mb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">JP</div>
               <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">João Paulo</p>
                  <p className="text-xs text-slate-500">Tomate • Há 3 horas</p>
               </div>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Manchas amarelas nas folhas inferiores</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              Alguém sabe o que pode ser isso? Começou ontem depois da chuva. Já apliquei fungicida mas não parou.
            </p>
            <div className="h-48 bg-slate-100 rounded-lg mb-3 overflow-hidden">
               <img src={`https://images.unsplash.com/photo-1591857177580-dc82b9e4e1aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnQlMjBkaXNlYXNlfGVufDB8fDB8fHww`} alt="Post" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between text-slate-500 text-sm border-t border-slate-50 pt-3">
               <button className="flex items-center gap-1 hover:text-green-600"><ThumbsUp size={16}/> Útil (12)</button>
               <button className="flex items-center gap-1 hover:text-green-600"><MessageSquare size={16}/> Comentar (4)</button>
               <button className="flex items-center gap-1 hover:text-green-600">Compartilhar</button>
            </div>
         </div>
       ))}
    </div>
  );

  const renderHome = () => {
    if (currentView === 'calculator') {
      return (
        <div className="pb-24 pt-4 animate-fade-in mx-2">
           <FertilizerCalculator onBack={() => setCurrentView('dashboard')} />
        </div>
      );
    }

    if (currentView === 'pests') {
      return (
        <div className="pb-24 pt-4 animate-fade-in mx-2">
           <PestLibrary onBack={() => setCurrentView('dashboard')} />
        </div>
      );
    }

    if (selectedImage) {
      return (
        <div className="animate-fade-in pb-20 pt-4">
            <button 
              onClick={handleReset}
              className="mb-4 text-slate-500 hover:text-green-600 flex items-center gap-2 font-medium text-sm px-2"
            >
              ← Voltar para o início
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-6 mx-2">
              <div className="relative h-64 bg-black">
                <img 
                  src={selectedImage} 
                  alt="Análise" 
                  className="w-full h-full object-contain opacity-90" 
                />
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm">
                    <Loader2 className="animate-spin mb-4 text-green-400" size={48} />
                    <p className="font-bold text-lg">Dr Plant está analisando...</p>
                    <p className="text-sm opacity-80 mt-2">Identificando patógenos e deficiências</p>
                  </div>
                )}
              </div>
              
              {!isLoading && error && (
                 <div className="p-6 text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Ops, algo deu errado</h3>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button 
                      onClick={() => handleImageSelected(selectedImage)}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-bold"
                    >
                      Tentar Novamente
                    </button>
                 </div>
              )}

              {!isLoading && analysis && (
                 <AnalysisResults 
                   result={analysis} 
                   onSave={saveToHistory}
                   isSaved={isCurrentAnalysisSaved}
                   onUpdateNotes={handleUpdateNotes}
                 />
              )}
            </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-24 pt-4 animate-fade-in">
        <InstallBanner />

        <div className="px-2">
           <PlantWeather />
        </div>

        <div id="image-upload-area" className="mx-2 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden relative">
           <div className="bg-green-600 h-2 w-full"></div>
           <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                       Sua plantação está saudável?
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                       Tire uma foto para receber um diagnóstico e tratamento instantâneo.
                    </p>
                 </div>
                 <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                    <Sprout size={24} />
                 </div>
              </div>
              <ImageUpload onImageSelected={handleImageSelected} />
           </div>
        </div>

        <div className="mx-2">
           <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3 px-1">Ferramentas</h3>
           <div className="grid grid-cols-4 gap-2">
              <div 
                onClick={() => setCurrentView('calculator')}
                className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors cursor-pointer"
              >
                 <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Calculator size={24} />
                 </div>
                 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Calculadora</span>
              </div>
              
              <div 
                onClick={() => setCurrentView('pests')}
                className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors cursor-pointer"
              >
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Bug size={24} />
                 </div>
                 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pragas</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors cursor-pointer"
              >
                 <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <BookOpen size={24} />
                 </div>
                 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Dicas</span>
              </div>
              
              <div 
                onClick={() => setActiveTab('community')}
                className="flex flex-col items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors cursor-pointer"
              >
                 <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Users size={24} />
                 </div>
                 <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Fórum</span>
              </div>
           </div>
        </div>

        {history.length > 0 && (
           <div className="mx-2 pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Diagnósticos Recentes</h3>
                 <button onClick={() => setActiveTab('profile')} className="text-green-600 text-sm font-semibold">Ver tudo</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                 {history.slice(0, 5).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleHistorySelect(item)}
                      className="min-w-[140px] w-[140px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer"
                    >
                       <div className="h-24 bg-slate-200">
                          {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />}
                       </div>
                       <div className="p-3">
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{item.diagnosis}</p>
                          <p className="text-xs text-slate-500 truncate">{new Date(item.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'community': return renderCommunity();
      case 'library': return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
           <BookOpen size={64} className="text-green-200 mb-4" />
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Biblioteca de Cultivo</h2>
           <p className="text-slate-500 mt-2 max-w-xs">Guias passo-a-passo para mais de 50 culturas diferentes.</p>
           <button onClick={() => setActiveTab('home')} className="mt-6 text-green-600 font-bold">Voltar ao Início</button>
        </div>
      );
      case 'profile': return (
         <div className="pb-20 animate-fade-in">
            <div className="bg-green-600 pt-10 pb-6 px-4 rounded-b-3xl mb-6 shadow-md">
               <div className="flex items-center gap-4 text-white">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold">
                     DP
                  </div>
                  <div>
                     <h2 className="text-xl font-bold">Produtor Rural</h2>
                     <p className="text-green-100 text-sm">Membro desde 2024</p>
                  </div>
               </div>
            </div>
            <div className="px-4">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Meus Diagnósticos</h3>
               <HistoryList items={history} onSelect={handleHistorySelect} onDelete={removeFromHistory} />
               <div className="mt-8 text-center border-t pt-8 border-slate-100">
                  <p className="text-xs text-slate-400">Versão {APP_VERSION}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Desenvolvido por Daniel Possamai Vieira</p>
               </div>
            </div>
         </div>
      );
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {(!selectedImage || activeTab !== 'home') && currentView === 'dashboard' && (
        <Header 
          onReset={handleReset} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
      )}

      <main className="container mx-auto max-w-lg min-h-screen">
        {renderContent()}
      </main>

      <BottomMenu 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onCameraClick={triggerCamera} 
      />
    </div>
  );
};