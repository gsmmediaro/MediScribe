
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { startAudioRecording, stopAudioRecording, checkAudioRecordingSupport, type AudioRecordingSession } from './services/audioRecordingService';
import type { AnalysisResult, TranscriptLine } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import TranscriptionView from './components/TranscriptionView';
import AnalysisView from './components/AnalysisView';
import { InfoIcon } from './components/Icons';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakerMode, setSpeakerMode] = useState<'auto' | 'manual'>('auto');
  const [manualSpeaker, setManualSpeaker] = useState<'Doctor' | 'Pacient'>('Pacient');

  const recordingSessionRef = useRef<AudioRecordingSession | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const support = checkAudioRecordingSupport();
    if (!support.supported) {
      setError(support.error || 'Audio recording not supported');
    }
  }, []);

  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setTranscript([]);
    setRecordingDuration(0);
    setIsRecording(true);

    try {
      console.log('🎙️ Starting audio recording...');

      const session = await startAudioRecording((seconds) => {
        setRecordingDuration(seconds);
      });

      recordingSessionRef.current = session;
      console.log('✅ Recording started successfully');

    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Nu am putut accesa microfonul. Vă rugăm verificați permisiunile.'
      );
      setIsRecording(false);
    }
  }, []);

  const handleStopTranscription = useCallback(async () => {
    if (!recordingSessionRef.current) {
      setError('No active recording session');
      return;
    }

    setIsRecording(false);
    setIsLoadingAnalysis(true);
    setError(null);

    try {
      console.log('⏹️ Stopping recording and processing...');

      const result = await stopAudioRecording(recordingSessionRef.current);

      console.log('✅ Analysis received:', result);
      setAnalysisResult(result);

      // Extract transcript from result if available
      // n8n may include transcription in response
      if (result.raportSOAP) {
        // Create a formatted transcript from SOAP report
        const transcriptLines: TranscriptLine[] = [
          { speaker: 'Pacient', text: result.raportSOAP.Subiectiv },
          { speaker: 'Doctor', text: result.raportSOAP.Obiectiv },
          { speaker: 'Doctor', text: result.raportSOAP.Analiza },
          { speaker: 'Doctor', text: result.raportSOAP.Plan }
        ];
        setTranscript(transcriptLines);
      }

    } catch (err) {
      console.error('❌ Failed to process recording:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'A apărut o eroare la procesarea înregistrării. Vă rugăm încercați din nou.'
      );
    } finally {
      setIsLoadingAnalysis(false);
      recordingSessionRef.current = null;
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setTranscript([]);
    setRecordingDuration(0);
    setError(null);
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header />
      <main className="w-full max-w-4xl flex-grow flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">Eroare:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {analysisResult ? (
          <AnalysisView result={analysisResult} onReset={handleReset} />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex-grow flex flex-col">
              {!isRecording && !isLoadingAnalysis ? (
                <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                  <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Asistent Medical AI</h2>
                  <p>Apăsați 'Start Înregistrare' pentru a începe înregistrarea consultației.</p>
                  <p className="text-sm mt-2">
                    Înregistrarea va fi trimisă pentru transcriere și analiză medicală automată.
                  </p>
                </div>
              ) : isLoadingAnalysis ? (
                <div className="m-auto text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <h2 className="text-xl font-semibold mb-2">Procesare în curs...</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Se transcrie și analizează înregistrarea (10-30 secunde)
                  </p>
                  <div className="mt-4 space-y-2 text-left max-w-md mx-auto text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Transcriere audio cu Deepgram...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Identificare vorbitori...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Analiză medicală cu Gemini AI...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="m-auto text-center">
                  <div className="inline-block mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-red-600 dark:text-red-400">
                    {formatDuration(recordingDuration)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Înregistrare în curs... Vorbiți clar în microfon.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Apăsați 'Stop' când ați terminat consultația.
                  </p>
                </div>
              )}
            </div>
            <Controls
              isRecording={isRecording}
              isLoading={isLoadingAnalysis}
              onStart={handleStartTranscription}
              onStop={handleStopTranscription}
              speakerMode={speakerMode}
              onModeChange={setSpeakerMode}
              manualSpeaker={manualSpeaker}
              onSpeakerChange={setManualSpeaker}
            />
          </>
        )}
      </main>
      <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MediScribe - Asistent Medical cu AI. Powered by n8n + Deepgram + Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
