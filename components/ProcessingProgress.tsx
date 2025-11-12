// @/components/ProcessingProgress.tsx
// Premium loading experience with step-by-step progress indicators

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ProcessingProgress: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const steps = [
    { id: 0, label: '📤 Trimitere audio...', duration: 2 },
    { id: 1, label: '🎧 Transcriere Deepgram...', duration: 25 },
    { id: 2, label: '🤖 Analiză AI & SOAP...', duration: 20 },
    { id: 3, label: '💊 Verificare medicamente...', duration: 40 },
    { id: 4, label: '🔍 Detectare interacțiuni...', duration: 30 },
    { id: 5, label: '📊 Salvare date...', duration: 10 },
    { id: 6, label: '✅ Finalizare...', duration: 3 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepDurations = steps.map(s => s.duration);
    let accumulated = 0;

    for (let i = 0; i < stepDurations.length; i++) {
      accumulated += stepDurations[i];
      if (elapsedTime < accumulated) {
        setCurrentStep(i);
        break;
      }
    }
  }, [elapsedTime]);

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
  const progress = Math.min((elapsedTime / totalDuration) * 100, 95); // Cap at 95%

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12"
    >
      <div className="max-w-2xl mx-auto">
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 mx-auto mb-8"
        >
          <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Se procesează consultația
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {elapsedTime}s / ~{totalDuration}s • Vă rugăm așteptați...
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-2">
            {Math.round(progress)}% completat
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: idx <= currentStep ? 1 : 0.4,
                x: 0,
                scale: idx === currentStep ? 1.02 : 1
              }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                idx === currentStep
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : idx < currentStep
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {idx < currentStep ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : idx === currentStep ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className={`font-medium ${
                  idx === currentStep
                    ? 'text-blue-900 dark:text-blue-100'
                    : idx < currentStep
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>

              {/* Duration */}
              {idx === currentStep && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm text-blue-600 dark:text-blue-400"
                >
                  ~{step.duration}s
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Warning for long processing */}
        {elapsedTime > 60 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                  Procesarea durează mai mult...
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Consultații complexe cu multe medicamente pot dura până la 3 minute.
                  Vă rugăm să așteptați finalizarea.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProcessingProgress;
