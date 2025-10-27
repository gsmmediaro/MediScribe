
import React, { useState, useRef, useCallback } from 'react';
import { startLiveTranscription } from './services/geminiService';
import { generateMedicalAnalysisViaN8n } from './services/n8nService';
import { config } from './config';
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


  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // MediaRecorder for capturing audio blob to send to n8n
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setTranscript([]);
    setInterimTranscript('');
    setIsRecording(true);

    try {
      // Start live transcription with Gemini for real-time feedback
      const { session, stream, context, processor, source } = await startLiveTranscription(
        (newTranscript, isFinal) => {
          if (isFinal) {
            const trimmedText = newTranscript.trim();
            if (trimmedText) {
                const speaker = speakerMode === 'auto' ? diarizeSpeaker(trimmedText) : manualSpeaker;
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

      // Also start MediaRecorder to capture audio blob for n8n
      if (config.features.useN8nForAnalysis) {
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm', // or 'audio/wav' if supported
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(1000); // Collect data every 1 second
        mediaRecorderRef.current = mediaRecorder;
      }

    } catch (err) {
      console.error("Failed to start transcription:", err);
      setError("Nu am putut accesa microfonul. Vă rugăm verificați permisiunile.");
      setIsRecording(false);
    }
  }, [speakerMode, manualSpeaker]);

  const handleStopTranscription = useCallback(async () => {
    setIsRecording(false);

    // Stop MediaRecorder first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

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

    const finalInterimText = interimTranscript.trim();
    let finalTranscriptForApi = [...transcript];

    if (finalInterimText) {
        const speaker = speakerMode === 'auto' ? diarizeSpeaker(finalInterimText) : manualSpeaker;
        const finalLine = { speaker, text: finalInterimText };
        finalTranscriptForApi.push(finalLine);
        // Update state for UI consistency
        setTranscript(prev => [...prev, finalLine]);
        setInterimTranscript('');
    }

    if (finalTranscriptForApi.length === 0) {
      setError("Nu a fost înregistrat niciun sunet pentru analiză.");
      return;
    }

    setIsLoadingAnalysis(true);
    setError(null);

    try {
      // Use n8n backend for enhanced analysis
      if (config.features.useN8nForAnalysis && audioChunksRef.current.length > 0) {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Sending audio blob to n8n:', audioBlob.size, 'bytes');

        const result = await generateMedicalAnalysisViaN8n(audioBlob);
        setAnalysisResult(result);
      } else {
        // Fallback: Use Gemini directly (original method)
        const { generateMedicalAnalysis } = await import('./services/geminiService');
        const finalTranscriptString = finalTranscriptForApi
          .map(line => `${line.speaker}: ${line.text}`)
          .join('\n');
        const result = await generateMedicalAnalysis(finalTranscriptString);
        setAnalysisResult(result);
      }
    } catch (err) {
      console.error("Failed to generate analysis:", err);
      setError("A apărut o eroare la generarea analizei. Vă rugăm încercați din nou.");
    } finally {
      setIsLoadingAnalysis(false);
      // Clean up
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
    }
  }, [transcript, interimTranscript, speakerMode, manualSpeaker]);
  
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
