// @/App.tsx
// Premium UI with ProcessingProgress integration and enhanced UX

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import AnalysisView from './components/AnalysisView';
import ProcessingProgress from './components/ProcessingProgress';
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

  const handleStartTranscription = useCallback(async () => {
    setValidationError(null);

    // Validate patient name
    const nameValidation = validatePatientName(patientName);
    if (!nameValidation.isValid) {
      setValidationError(nameValidation.error || 'Nume invalid');
      return false;
    }

    // Validate CNP if provided
    if (patientCnp.trim()) {
      const cnpValidation = validateCNP(patientCnp);
      if (!cnpValidation.isValid) {
        setValidationError(cnpValidation.error || 'CNP invalid');
        return false;
      }
    }

    return true;
  };

  const handleStartTranscription = async () => {
    clearRecorderError();

    if (!validatePatientInfo()) {
      return;
    }

    await startRecording();
  }, [patientName, patientCnp, clearRecorderError, startRecording]);

  const handleStopTranscription = useCallback(async () => {
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
  }, [stopRecording, processAudio, patientName, patientCnp, N8N_WEBHOOK_URL]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!validatePatientInfo()) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
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
  }, [patientName, patientCnp, processAudio, N8N_WEBHOOK_URL]);

  const handleReset = useCallback(() => {
    resetProcessing();
    setValidationError(null);
    clearRecorderError();
    setPatientName('');
    setPatientCnp('');
  }, [resetProcessing, clearRecorderError]);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />

        {/* Animated Orbs - optimized with will-change */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        style={{ display: 'none' }}
      />

      <Header />

      <main className="w-full max-w-4xl flex-grow flex flex-col mt-8">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-lg"
            >
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">Eroare</h4>
                  <p className="text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {analysisResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnalysisView
              result={analysisResult as AnalysisResult & { patientName?: string; patientCnp?: string }}
              rawTranscript={rawTranscript}
              onReset={handleReset}
            />
          </motion.div>
        ) : (
          <>
            {/* Hero Section */}
            {!isRecording && !isLoadingAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Documentație Medicală
                  <br />
                  în Secunde
                </motion.h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Transformă consultațiile în rapoarte SOAP complete cu ajutorul inteligenței artificiale
                </p>
              </motion.div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex-grow flex flex-col">
              <div className="m-auto text-center text-gray-500 dark:text-gray-400 w-full">
                <AnimatePresence mode="wait">
                  {isLoadingAnalysis ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ProcessingProgress />
                    </motion.div>
                  ) : isRecording ? (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        </svg>
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Înregistrare în curs...
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Vorbește clar și natural. Apasă Stop când ai terminat.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <InfoIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                      <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        MediScribe AI
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Completează datele, apoi înregistrează sau încarcă un fișier.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {!isRecording && !isLoadingAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-4 shadow-lg"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nume Pacient <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      id="patientName"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="ex: Popescu Ion"
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="patientCnp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CNP Pacient
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      id="patientCnp"
                      value={patientCnp}
                      onChange={(e) => {
                        setPatientCnp(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="ex: 1900101123456"
                      maxLength={13}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    />
                  </div>
                </div>
              </motion.div>
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
