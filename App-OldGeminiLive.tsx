
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateMedicalAnalysis, startLiveTranscription } from './services/geminiService';
import type { AnalysisResult, LiveSession, TranscriptLine } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import TranscriptionView from './components/TranscriptionView';
import AnalysisView from './components/AnalysisView';
import { InfoIcon } from './components/Icons';

const diarizeSpeaker = (text: string): 'Doctor' | 'Pacient' => {
  const doctorKeywords = [
    'doamnă',
    'domnule',
    'vă prescriu',
    'aveți nevoie de',
    'recomand',
    'rețetă',
    'tratament',
    'diagnostic'
  ];
  const lowerText = text.toLowerCase();

  if (doctorKeywords.some(keyword => lowerText.includes(keyword))) {
    if ((lowerText.includes('domnule') || lowerText.includes('doamnă')) && lowerText.includes('doctor')) {
        if (text.split(' ').length < 5) return 'Pacient';
    }
    return 'Doctor';
  }

  return 'Pacient';
};


const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakerMode, setSpeakerMode] = useState<'auto' | 'manual'>('auto');
  const [manualSpeaker, setManualSpeaker] = useState<'Doctor' | 'Pacient'>('Pacient');

  // 🔧 FIX: useRef pattern for accessing CURRENT values in callbacks
  const speakerModeRef = useRef<'auto' | 'manual'>(speakerMode);
  const manualSpeakerRef = useRef<'Doctor' | 'Pacient'>(manualSpeaker);

  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🔄 Sync refs with state whenever state changes
  useEffect(() => {
    speakerModeRef.current = speakerMode;
  }, [speakerMode]);

  useEffect(() => {
    manualSpeakerRef.current = manualSpeaker;
  }, [manualSpeaker]);

  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setTranscript([]);
    setInterimTranscript('');
    setIsRecording(true);

    try {
      const { session, stream, context, processor, source } = await startLiveTranscription(
        (newTranscript, isFinal) => {
          if (isFinal) {
            const trimmedText = newTranscript.trim();
            if (trimmedText) {
                // ✅ FIX: Read from refs to get CURRENT values, not closure values
                const speaker = speakerModeRef.current === 'auto'
                  ? diarizeSpeaker(trimmedText)
                  : manualSpeakerRef.current;
                setTranscript((prev) => [...prev, { speaker, text: trimmedText }]);
            }
            setInterimTranscript('');
          } else {
            setInterimTranscript(newTranscript);
          }
        }
      );

      sessionRef.current = session;
      streamRef.current = stream;
      audioContextRef.current = context;
      processorRef.current = processor;
      mediaStreamSourceRef.current = source;

    } catch (err) {
      console.error("Failed to start transcription:", err);
      setError("Nu am putut accesa microfonul. Vă rugăm verificați permisiunile.");
      setIsRecording(false);
    }
  }, []); // ✅ Empty dependencies - callback doesn't need to recreate

  const handleStopTranscription = useCallback(async () => {
    setIsRecording(false);

    if (processorRef.current && audioContextRef.current && mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        processorRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
    }
    if (sessionRef.current) {
        sessionRef.current.close();
    }

    sessionRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    processorRef.current = null;
    mediaStreamSourceRef.current = null;

    // Use the latest state values via a function callback
    setTranscript(currentTranscript => {
      setInterimTranscript(currentInterimTranscript => {
        const finalInterimText = currentInterimTranscript.trim();
        let finalTranscriptForApi = [...currentTranscript];

        if (finalInterimText) {
            // ✅ FIX: Read from refs to get CURRENT values
            const speaker = speakerModeRef.current === 'auto'
              ? diarizeSpeaker(finalInterimText)
              : manualSpeakerRef.current;
            const finalLine = { speaker, text: finalInterimText };
            finalTranscriptForApi.push(finalLine);
            // Update state for UI consistency
            setTranscript([...currentTranscript, finalLine]);
        }

        if (finalTranscriptForApi.length === 0) {
          setError("Nu a fost înregistrat niciun sunet pentru analiză.");
          return '';
        }

        setIsLoadingAnalysis(true);
        setError(null);

        const finalTranscriptString = finalTranscriptForApi
          .map(line => `${line.speaker}: ${line.text}`)
          .join('\n');

        generateMedicalAnalysis(finalTranscriptString)
          .then(result => setAnalysisResult(result))
          .catch(err => {
            console.error("Failed to generate analysis:", err);
            setError("A apărut o eroare la generarea analizei. Vă rugăm încercați din nou.");
          })
          .finally(() => setIsLoadingAnalysis(false));

        return '';
      });
      return currentTranscript;
    });
  }, []); // ✅ Empty dependencies - refs and state updater functions are stable
  
  const handleReset = () => {
    setAnalysisResult(null);
    setTranscript([]);
    setInterimTranscript('');
    setError(null);
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
              {transcript.length === 0 && !interimTranscript && !isRecording && !isLoadingAnalysis ? (
                <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                   <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                   <h2 className="text-xl font-semibold mb-2">Asistent Medical AI</h2>
                   <p>Apăsați 'Start Transcriere' pentru a începe înregistrarea consultației.</p>
                   <p className="text-sm mt-2">Alegeți modul de diarizare (automat sau manual) de mai jos.</p>
                </div>
              ) : (
                <TranscriptionView transcript={transcript} interimTranscript={interimTranscript} />
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
        <p>&copy; {new Date().getFullYear()} Asistent Medical Transcriere. Construit cu Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
