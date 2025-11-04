// @/App.tsx

import React, { useState, useRef } from 'react';
import type { AnalysisResult } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import AnalysisView from './components/AnalysisView';
import { InfoIcon } from './components/Icons';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { validatePatientName, validateCNP, validateAudioFile } from './utils/validation';

const App: React.FC = () => {
  const [patientName, setPatientName] = useState<string>('');
  const [patientCnp, setPatientCnp] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get n8n webhook URL from environment variables
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

  // Custom hooks
  const {
    isRecording,
    error: recorderError,
    startRecording,
    stopRecording,
    clearError: clearRecorderError
  } = useAudioRecorder();

  const {
    isLoading: isLoadingAnalysis,
    analysisResult,
    rawTranscript,
    error: processingError,
    processAudio,
    reset: resetProcessing
  } = useAudioProcessing();

  // Combined error state
  const error = validationError || recorderError || processingError;

  const handleStartTranscription = async () => {
    setValidationError(null);
    clearRecorderError();

    // Validate patient name
    const nameValidation = validatePatientName(patientName);
    if (!nameValidation.isValid) {
      setValidationError(nameValidation.error || 'Nume invalid');
      return;
    }

    // Validate CNP if provided
    if (patientCnp.trim()) {
      const cnpValidation = validateCNP(patientCnp);
      if (!cnpValidation.isValid) {
        setValidationError(cnpValidation.error || 'CNP invalid');
        return;
      }
    }

    await startRecording();
  };

  const handleStopTranscription = async () => {
    const audioBlob = await stopRecording();
    
    if (audioBlob) {
      await processAudio(
        audioBlob,
        'consultatie-live.webm',
        patientName,
        patientCnp,
        N8N_WEBHOOK_URL
      );
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setValidationError(null);

    // Validate patient name
    const nameValidation = validatePatientName(patientName);
    if (!nameValidation.isValid) {
      setValidationError(nameValidation.error || 'Nume invalid');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate CNP if provided
    if (patientCnp.trim()) {
      const cnpValidation = validateCNP(patientCnp);
      if (!cnpValidation.isValid) {
        setValidationError(cnpValidation.error || 'CNP invalid');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Validate audio file
    const fileValidation = validateAudioFile(file);
    if (!fileValidation.isValid) {
      setValidationError(fileValidation.error || 'Fișier invalid');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    await processAudio(file, file.name, patientName, patientCnp, N8N_WEBHOOK_URL);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    resetProcessing();
    setValidationError(null);
    clearRecorderError();
    setPatientName('');
    setPatientCnp('');
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        style={{ display: 'none' }}
      />

      <Header />
      
      <main className="w-full max-w-4xl flex-grow flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">Eroare:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {analysisResult ? (
          <AnalysisView 
            result={analysisResult as AnalysisResult & { patientName?: string; patientCnp?: string }}
            rawTranscript={rawTranscript}
            onReset={handleReset}
          />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex-grow flex flex-col">
              <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">MediScribe AI</h2>
                {isLoadingAnalysis ? (
                  <div>
                    <p>Se procesează consultația...</p>
                    <ul className="text-sm mt-2 list-none">
                      <li className="opacity-50">📤 Trimitere audio...</li>
                      <li className="opacity-50 animate-pulse">🎧 Transcriere Deepgram...</li>
                      <li className="opacity-50 animate-pulse delay-500">🤖 Analiză Gemini...</li>
                    </ul>
                  </div>
                ) : isRecording ? (
                  <p>Înregistrare în curs... Apasă 'Stop' pentru a procesa.</p>
                ) : (
                  <p>Completează datele, apoi înregistrează sau încarcă un fișier.</p>
                )}
              </div>
            </div>

            {!isRecording && !isLoadingAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nume Pacient <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="ex: Popescu Ion"
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="patientCnp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CNP Pacient
                    </label>
                    <input
                      type="text"
                      id="patientCnp"
                      value={patientCnp}
                      onChange={(e) => {
                        setPatientCnp(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="ex: 1900101123456"
                      maxLength={13}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <Controls
              isRecording={isRecording}
              isLoading={isLoadingAnalysis}
              onStart={handleStartTranscription}
              onStop={handleStopTranscription}
              onUploadClick={triggerFileUpload}
            />
          </>
        )}
      </main>
      
      <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MediScribe. Construit cu n8n, Deepgram & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
