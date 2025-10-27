// @/components/Controls.tsx

import React from 'react';
// Am adăugat UploadCloudIcon
import { MicIcon, StopCircleIcon, BrainCircuitIcon, UploadCloudIcon } from './Icons';

interface ControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onUploadClick: () => void; // Prop nou pentru a declanșa upload-ul
}

const Controls: React.FC<ControlsProps> = ({ 
    isRecording, 
    isLoading, 
    onStart, 
    onStop,
    onUploadClick, // Primim funcția
}) => {
  if (isLoading) {
    return (
        <div className="w-full py-4 mt-auto flex justify-center items-center h-28">
            <div className="flex flex-col items-center gap-2 text-primary-500">
                <BrainCircuitIcon className="w-8 h-8 animate-pulse" />
                <span className="font-semibold">Se procesează... (n8n)</span>
            </div>
        </div>
    );
  }

  return (
    <div className="sticky bottom-0 w-full bg-slate-100/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 mt-auto text-center">
        {isRecording ? (
             <div className="flex flex-col items-center gap-4 h-28 justify-center">
                <button
                    onClick={onStop}
                    className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 dark:focus:ring-red-800 transition-transform transform hover:scale-105"
                    aria-label="Stop Transcriere"
                >
                    <StopCircleIcon className="w-7 h-7" />
                    <span className="text-lg">Stop & Procesează</span>
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </button>
             </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-28">
                {/* Am adăugat un container pentru cele două butoane */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        className="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-transform transform hover:scale-105"
                        aria-label="Start Transcriere"
                    >
                        <MicIcon className="w-7 h-7" />
                        <span className="text-lg">Start Transcriere</span>
                    </button>
                    
                    {/* BUTONUL NOU DE UPLOAD */}
                    <button
                        onClick={onUploadClick}
                        className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-transform transform hover:scale-105"
                        aria-label="Încarcă fișier"
                    >
                        <UploadCloudIcon className="w-7 h-7" />
                        <span className="text-lg">Încarcă fișier</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Controls;