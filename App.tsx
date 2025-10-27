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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Funcția de procesare primește acum numele/cnp ca argumente
  const processAudio = useCallback(async (
      audioBlob: Blob,
      fileName: string,
      pName: string, // Argument nou
      pCnp: string   // Argument nou
    ) => {
    setIsLoadingAnalysis(true);
    setError(null);

    if (!N8N_WEBHOOK_URL.startsWith('http')) {
        setError("URL-ul n8n nu este configurat corect în App.tsx.");
        setIsLoadingAnalysis(false);
        return;
    }

    // Folosim argumentele funcției
    if (!pName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a procesa.");
        setIsLoadingAnalysis(false);
        return;
    }

    const formData = new FormData();
    formData.append('data', audioBlob, fileName);
    formData.append('patient_name', pName); // Folosim argumentul
    formData.append('patient_cnp', pCnp);   // Folosim argumentul

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Eroare de la serverul n8n (${response.status}): ${errText}`);
      }

      const result = await response.json();

      // Adăugăm numele/cnp la rezultat pentru a-l pasa la AnalysisView
      const finalResult = {
          ...(Array.isArray(result) && result[0]?.json ? result[0].json : result.json ? result.json : result),
          patientName: pName,
          patientCnp: pCnp
      };

      setAnalysisResult(finalResult);


    } catch (err: any) {
      console.error("Failed to process recording:", err);
      setError(`A apărut o eroare la procesarea audio: ${err.message}`);
    } finally {
      setIsLoadingAnalysis(false);
    }
    // Adăugăm N8N_WEBHOOK_URL ca dependență, deoarece este folosit în interior
  }, [N8N_WEBHOOK_URL]);


  // --- Logica de Înregistrare ---
  // Scoatem patientName și patientCnp din dependențe
  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setIsRecording(true);
    audioChunksRef.current = [];

    // Citim starea curentă direct aici
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

      // Când se oprește, apelează processAudio cu starea curentă
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setError("Nu a fost înregistrat niciun sunet.");
          setIsLoadingAnalysis(false); // Oprim loading-ul dacă nu e audio
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Pasăm starea curentă patientName și patientCnp
        processAudio(audioBlob, 'consultatie-live.webm', patientName, patientCnp);
      };

      mediaRecorderRef.current.start();

    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError(`Nu am putut accesa microfonul: ${err.message}`);
      setIsRecording(false);
    }
  // Am scos dependențele [patientName, patientCnp]
  // Adăugăm processAudio ca dependență, deoarece e folosit în onstop
  }, [processAudio, patientName, patientCnp]); // Re-adăugăm dependențele aici pentru verificarea din start

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
    fileInputRef.current?.click();
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!patientName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a încărca un fișier.");
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    // Pasăm starea curentă patientName și patientCnp
    processAudio(file, file.name, patientName, patientCnp);

    if(fileInputRef.current) fileInputRef.current.value = "";
    // Adăugăm dependențele necesare
  }, [processAudio, patientName, patientCnp]);

  // --- Reset ---
  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
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
          // Pasăm și numele/cnp către AnalysisView dacă vrem să le afișăm acolo (ex: pe rețetă)
          <AnalysisView result={analysisResult} onReset={handleReset} />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex-grow flex flex-col">
              <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                 <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                 <h2 className="text-xl font-semibold mb-2">Asistent Medical AI</h2>
                 { isLoadingAnalysis ? (
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
              onUploadClick={triggerFileUpload}
            />
          </>
        )}
      </main>
       <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} MediScribe. Accelereaza procesele medicale.</p>
      </footer>
    </div>
  );
};

export default App;