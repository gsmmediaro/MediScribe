// @/App.tsx

import React, { useState, useRef, useCallback } from 'react';
import type { AnalysisResult } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import AnalysisView from './components/AnalysisView';
import { InfoIcon } from './components/Icons';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [patientName, setPatientName] = useState<string>('');
  const [patientCnp, setPatientCnp] = useState<string>('');

  // !!! COMPLETEAZĂ ACEST URL CU CEL DIN NODUL WEBHOOK N8N !!!
  const N8N_WEBHOOK_URL = 'https://shadow424.app.n8n.cloud/webhook/medical-assistant';

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Referință nouă pentru inputul de fișier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Funcția de procesare (trimitere la n8n) - refactorizată pentru a fi reutilizabilă
  const processAudio = async (audioBlob: Blob, fileName: string) => {
    setIsLoadingAnalysis(true);
    setError(null);

    if (!N8N_WEBHOOK_URL.startsWith('http')) {
        setError("URL-ul n8n nu este configurat corect în App.tsx.");
        setIsLoadingAnalysis(false);
        return;
    }
    
    if (!patientName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a procesa.");
        setIsLoadingAnalysis(false);
        return;
    }

    // 1. Crează FormData pentru a trimite fișierul
    const formData = new FormData();
    formData.append('data', audioBlob, fileName);
    formData.append('patient_name', patientName);
    formData.append('patient_cnp', patientCnp);

    try {
      // 2. Trimite la n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Eroare de la serverul n8n (${response.status}): ${errText}`);
      }

      // 3. Primește JSON-ul final de la n8n
      const result = await response.json();
      
      if (Array.isArray(result) && result[0]?.json) {
          setAnalysisResult(result[0].json);
      } else if (result.json) {
          setAnalysisResult(result.json);
      } else {
          setAnalysisResult(result);
      }

    } catch (err: any) {
      console.error("Failed to process recording:", err);
      setError(`A apărut o eroare la procesarea audio: ${err.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };


  // --- Logica de Înregistrare ---
  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setIsRecording(true);
    audioChunksRef.current = [];

    if (!patientName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a începe.");
        setIsRecording(false);
        return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setError("Nu a fost înregistrat niciun sunet.");
          setIsLoadingAnalysis(false);
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob, 'consultatie-live.webm');
      };

      mediaRecorderRef.current.start();

    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError(`Nu am putut accesa microfonul: ${err.message}`);
      setIsRecording(false);
    }
  }, [patientName, patientCnp]); // Adăugat dependențe

  const handleStopTranscription = useCallback(() => {
    setIsRecording(false);
    setIsLoadingAnalysis(true); 
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // --- Logica de Upload ---
  const triggerFileUpload = () => {
    // Deschide fereastra de selecție fișier
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Verifică dacă numele pacientului este completat
    if (!patientName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a încărca un fișier.");
        // Resetează inputul de fișier pentru a putea selecta același fișier din nou
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }
    
    // Procesează fișierul selectat
    processAudio(file, file.name);
    
    // Resetează inputul de fișier
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // --- Reset ---
  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setPatientName('');
    setPatientCnp('');
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      
      {/* Input de fișier ascuns */}
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
          <AnalysisView result={analysisResult} onReset={handleReset} />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex-grow flex flex-col">
              <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                 <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                 <h2 className="text-xl font-semibold mb-2">Asistent Medical AI</h2>
                 { isLoadingAnalysis ? (
                    <p>Se procesează consultația... (Deepgram + Gemini)</p>
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
                              type="text" id="patientName" value={patientName} 
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="ex: Popescu Ion"
                              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                      </div>
                      <div>
                          <label htmlFor="patientCnp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CNP Pacient
                          </label>
                          <input 
                              type="text" id="patientCnp" value={patientCnp} 
                              onChange={(e) => setPatientCnp(e.target.value)}
                              placeholder="ex: 1900101123456"
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
              onUploadClick={triggerFileUpload} // Am adăugat prop-ul nou
            />
          </>
        )}
      </main>
       <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Asistent Medical Transcriere. Construit cu n8n, Deepgram & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;