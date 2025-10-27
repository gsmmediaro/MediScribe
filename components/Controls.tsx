
import React from 'react';
import { MicIcon, StopCircleIcon, BrainCircuitIcon, UsersIcon } from './Icons';

interface ControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  speakerMode: 'auto' | 'manual';
  manualSpeaker: 'Doctor' | 'Pacient';
  onModeChange: (mode: 'auto' | 'manual') => void;
  onSpeakerChange: (speaker: 'Doctor' | 'Pacient') => void;
}

const SpeakerModeToggle: React.FC<Pick<ControlsProps, 'speakerMode' | 'onModeChange'>> = ({ speakerMode, onModeChange }) => {
    return (
        <div className="mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Mod Diarizare:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                    type="button"
                    onClick={() => onModeChange('auto')}
                    className={`px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors ${
                        speakerMode === 'auto'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Automat
                </button>
                <button
                    type="button"
                    onClick={() => onModeChange('manual')}
                    className={`px-4 py-2 text-sm font-medium border rounded-r-md transition-colors ${
                        speakerMode === 'manual'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                    Manual
                </button>
            </div>
        </div>
    );
};

const ManualSpeakerControls: React.FC<Pick<ControlsProps, 'manualSpeaker' | 'onSpeakerChange'>> = ({ manualSpeaker, onSpeakerChange }) => {
    const baseClasses = "flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-full shadow-md transition-all transform focus:outline-none focus:ring-4";
    const activeClasses = "bg-primary-600 text-white scale-105 focus:ring-primary-300 dark:focus:ring-primary-800";
    const inactiveClasses = "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600";
    
    return (
        <div className="flex items-center justify-center gap-4">
             <button
                onClick={() => onSpeakerChange('Doctor')}
                className={`${baseClasses} ${manualSpeaker === 'Doctor' ? activeClasses : inactiveClasses}`}
                aria-pressed={manualSpeaker === 'Doctor'}
            >
                <UsersIcon className="w-6 h-6" />
                <span>Vorbește Doctorul</span>
            </button>
            <button
                onClick={() => onSpeakerChange('Pacient')}
                 className={`${baseClasses} ${manualSpeaker === 'Pacient' ? activeClasses : inactiveClasses}`}
                 aria-pressed={manualSpeaker === 'Pacient'}
            >
                <UsersIcon className="w-6 h-6" />
                <span>Vorbește Pacientul</span>
            </button>
        </div>
    );
};


const Controls: React.FC<ControlsProps> = ({ 
    isRecording, 
    isLoading, 
    onStart, 
    onStop,
    speakerMode,
    onModeChange,
    manualSpeaker,
    onSpeakerChange,
}) => {
  if (isLoading) {
    return (
        <div className="w-full py-4 mt-auto flex justify-center items-center h-28">
            <div className="flex flex-col items-center gap-2 text-primary-500">
                <BrainCircuitIcon className="w-8 h-8 animate-pulse" />
                <span className="font-semibold">Se generează analiza...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="sticky bottom-0 w-full bg-slate-100/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 mt-auto text-center">
        {isRecording ? (
             <div className="flex flex-col items-center gap-4">
                {speakerMode === 'manual' && <ManualSpeakerControls manualSpeaker={manualSpeaker} onSpeakerChange={onSpeakerChange} />}
                <button
                    onClick={onStop}
                    className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 dark:focus:ring-red-800 transition-transform transform hover:scale-105"
                    aria-label="Stop Transcriere"
                >
                    <StopCircleIcon className="w-7 h-7" />
                    <span className="text-lg">Stop Transcriere</span>
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </button>
             </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-28">
                <SpeakerModeToggle speakerMode={speakerMode} onModeChange={onModeChange} />
                <button
                    onClick={onStart}
                    className="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-transform transform hover:scale-105"
                    aria-label="Start Transcriere"
                >
                    <MicIcon className="w-7 h-7" />
                    <span className="text-lg">Start Transcriere</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default Controls;
