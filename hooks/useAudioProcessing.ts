// @/hooks/useAudioProcessing.ts

import { useState, useCallback } from 'react';
import type { AnalysisResult, N8nResponse } from '../types';

interface UseAudioProcessingReturn {
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
  rawTranscript: string;
  error: string | null;
  processAudio: (
    audioBlob: Blob,
    fileName: string,
    patientName: string,
    patientCNP: string,
    webhookUrl: string
  ) => Promise<void>;
  reset: () => void;
}

export const useAudioProcessing = (): UseAudioProcessingReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const processAudio = useCallback(async (
    audioBlob: Blob,
    fileName: string,
    patientName: string,
    patientCNP: string,
    webhookUrl: string
  ) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRawTranscript('');

    // Validate webhook URL
    if (!webhookUrl.startsWith('http')) {
      setError("URL-ul n8n nu este configurat. Verificați fișierul .env");
      setIsLoading(false);
      return;
    }

    // Validate patient name
    if (!patientName.trim()) {
      setError("Numele pacientului este obligatoriu");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('data', audioBlob, fileName);
    formData.append('patient_name', patientName);
    formData.append('patient_cnp', patientCNP);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Eroare de la serverul n8n (${response.status}): ${errText}`);
      }

      // Expect structure: { analysis: {...}, transcription: "..." }
      const result: N8nResponse = await response.json();

      // Validate response structure
      if (!result || typeof result.analysis !== 'object' || typeof result.transcription !== 'string') {
        console.error("Structura răspunsului n8n invalidă:", result);
        throw new Error("Formatul răspunsului primit de la server este neașteptat.");
      }

      // Add patient data to analysis result
      const finalAnalysisResult: AnalysisResult & { patientName?: string; patientCnp?: string } = {
        ...result.analysis,
        patientName: patientName,
        patientCnp: patientCNP
      };

      setAnalysisResult(finalAnalysisResult);
      setRawTranscript(result.transcription);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Eroare necunoscută';
      console.error("Failed to process audio:", err);
      setError(`A apărut o eroare la procesarea audio: ${errorMessage}`);
      setAnalysisResult(null);
      setRawTranscript('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysisResult(null);
    setRawTranscript('');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    analysisResult,
    rawTranscript,
    error,
    processAudio,
    reset
  };
};

