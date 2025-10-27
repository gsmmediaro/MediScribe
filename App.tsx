// @/App.tsx

import React, { useState, useRef, useCallback } from 'react';
// Importurile pentru serviciul Gemini nu mai sunt necesare
import type { AnalysisResult } from './types'; // Am scos TranscriptLine și LiveSession
import Header from './components/Header';
import Controls from './components/Controls';
// TranscriptionView nu mai este folosit
import AnalysisView from './components/AnalysisView';
import { InfoIcon } from './components/Icons';

// Funcția diarizeSpeaker nu mai este necesară, o ștergem.

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  
  // Am scos 'transcript' și 'interimTranscript'
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Am scos 'speakerMode' și 'manualSpeaker'
  
  // Stări noi pentru datele pacientului
  const [patientName, setPatientName] = useState<string>('');
  const [patientCnp, setPatientCnp] = useState<string>('');

  // !!! COMPLETEAZĂ ACEST URL CU CEL DIN NODUL WEBHOOK N8N !!!
  const N8N_WEBHOOK_URL = 'https://shadow424.app.n8n.cloud/webhook/medical-assistant';

  // Referințe noi pentru MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Am scos referințele vechi (sessionRef, audioContextRef, etc.)

  const handleStartTranscription = useCallback(async () => {
    setError(null);
    setAnalysisResult(null);
    setIsRecording(true);
    audioChunksRef.current = []; // Golește bucățile audio

    if (!N8N_WEBHOOK_URL.startsWith('http')) {
        setError("URL-ul n8n nu este configurat corect în App.tsx.");
        setIsRecording(false);
        return;
    }
    
    if (!patientName.trim()) {
        setError("Te rugăm să introduci numele pacientului înainte de a începe.");
        setIsRecording(false);
        return;
    }

    try {
      // 1. Obține stream-ul audio
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Inițiază MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      // 3. Colectează bucățile audio
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 4. Setează logica pentru 'onstop' (care va fi apelată de handleStopTranscription)
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setError("Nu a fost înregistrat niciun sunet.");
          setIsLoadingAnalysis(false);
          return;
        }
        
        // a. Crează fișierul audio (Blob)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // b. Crează FormData pentru a trimite fișierul
        const formData = new FormData();
        formData.append('data', audioBlob, 'consultatie.webm'); // 'data' este numele așteptat de n8n
        
        // c. Adaugă datele pacientului (pe care n8n le va folosi în Google Sheets)
        formData.append('patient_name', patientName);
        formData.append('patient_cnp', patientCnp);

        try {
          // d. Trimite la n8n
          const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Eroare de la serverul n8n (${response.status}): ${errText}`);
          }

          // e. Primește JSON-ul final de la n8n
          const result = await response.json();
          
          // Verificăm dacă n8n a returnat datele într-un format ciudat (ex: array, sau { json: ... })
          // Nodul "Respond to Webhook" ar trebui să returneze direct JSON-ul
          if (Array.isArray(result) && result[0]?.json) {
              setAnalysisResult(result[0].json); // Caz comun n8n
          } else if (result.json) {
              setAnalysisResult(result.json);
          } else {
              setAnalysisResult(result); // Caz ideal
          }

        } catch (err: any) {
          console.error("Failed to process recording:", err);
          setError(`A apărut o eroare la procesarea înregistrării: ${err.message}`);
        } finally {
          setIsLoadingAnalysis(false);
        }
      };

      // 5. Pornește înregistrarea
      mediaRecorderRef.current.start();

    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError(`Nu am putut accesa microfonul: ${err.message}`);
      setIsRecording(false);
    }
  }, [patientName, patientCnp]); // Adaugă dependențele

  const handleStopTranscription = useCallback(async () => {
    setIsRecording(false);
    setIsLoadingAnalysis(true); // Arată loading imediat
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Aceasta va declanșa 'onstop' definit mai sus
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop()); // Oprește microfonul
    }

    // Restul logicii este acum în 'onstop'
    
  }, []); // Nu mai are dependențe
  
  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setPatientName(''); // Resetează și datele pacientului
    setPatientCnp('');
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
              {/* Am scos TranscriptionView */}
              <div className="m-auto text-center text-gray-500 dark:text-gray-400">
                 <InfoIcon className="w-16 h-16 mx-auto mb-4" />
                 <h2 className="text-xl font-semibold mb-2">Asistent Medical AI</h2>
                 { isLoadingAnalysis ? (
                    <p>Se procesează consultația... (Deepgram + Gemini)</p>
                 ) : isRecording ? (
                    <p>Înregistrare în curs... Apasă 'Stop' pentru a procesa.</p>
                 ) : (
                    <p>Completează datele pacientului și apasă 'Start Transcriere'.</p>
                 )}
              </div>
            </div>

            {/* Câmpurile pentru Pacient */}
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
              // Am scos props-urile de diarizare
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