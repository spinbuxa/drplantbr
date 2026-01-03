import React, { useState, useCallback } from 'react';
import { Loader2, Camera, ImageIcon } from 'lucide-react';
import { compressImage } from './imageProcessor';

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        setIsProcessing(true);
        const compressedBase64 = await compressImage(file);
        onImageSelected(compressedBase64);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        alert("Erro ao processar a imagem. Tente outra foto.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.02]' 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-green-400 dark:hover:border-green-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }
          ${isProcessing ? 'opacity-75 cursor-wait' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
            {isProcessing ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <Camera size={32} />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {isProcessing ? 'Processando imagem...' : 'Tirar foto ou fazer upload'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {isProcessing ? 'Otimizando para análise...' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
          </div>
          <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 mt-4">
            <span className="flex items-center gap-1"><ImageIcon size={14}/> JPG</span>
            <span className="flex items-center gap-1"><ImageIcon size={14}/> PNG</span>
            <span className="flex items-center gap-1"><ImageIcon size={14}/> WEBP</span>
          </div>
        </div>
      </div>
    </div>
  );
};