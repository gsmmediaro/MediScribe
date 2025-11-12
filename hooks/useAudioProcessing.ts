// @/hooks/useAudioProcessing.ts
// Enhanced with 180s timeout, Zod validation, and better error messages

import { useState, useCallback } from 'react';
import { z } from 'zod';
import type { AnalysisResult, N8nResponse } from '../types';

// Zod schema for validation
const N8nResponseSchema = z.object({
  analysis: z.object({
    rezumat: z.string(),
    raportSOAP: z.object({
      Subiectiv: z.string(),
      Obiectiv: z.string(),
      Analiza: z.string(),
      Plan: z.string(),
    }),
    diagnosticePosibile: z.array(z.string()),
    coduriICD10Sugerate: z.array(z.string()).optional(),
    pasiUrmatori: z.array(z.string()),
    reteta: z.object({
      medicatie: z.array(z.string()),
      instructiuni: z.string(),
      numeDoctor: z.string().optional(),
    }),
    alerteMedicale: z.array(z.string()).optional(),
  }),
  transcription: z.string(),
});

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
      // ⏱️ INCREASED TIMEOUT: 3 minutes (180 seconds)
      // Reason: AI Agent + RAG verification can take 90-150 seconds for complex consultations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180 seconds = 3 minutes

      console.log('📤 Trimitere cerere către n8n webhook...');
      console.log('🔗 URL:', webhookUrl);
      console.log('👤 Pacient:', patientName, patientCNP || '(fără CNP)');
      console.log('📁 Fișier:', fileName, '(' + Math.round(audioBlob.size / 1024) + ' KB)');
      console.log('⏱️ Timeout: 180 secunde (3 minute)');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Răspuns primit:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Răspuns de eroare de la n8n:', errorText);
        throw new Error(`Eroare de la serverul n8n: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Date primite de la n8n:', data);

      // Validate response structure with Zod
      const validationResult = N8nResponseSchema.safeParse(data);

      if (!validationResult.success) {
        console.error('❌ Structura răspunsului n8n invalidă:', data);
        console.error('❌ Erori de validare Zod:', validationResult.error.format());

        // Provide helpful error message
        const errorDetails = validationResult.error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ');

        throw new Error(
          `Formatul răspunsului de la server este invalid:\n${errorDetails}\n\nVerificați configurarea nodului "Respond to Webhook" în n8n.`
        );
      }

      const validatedData: N8nResponse = validationResult.data;

      // Add patient data to analysis result
      const finalAnalysisResult: AnalysisResult & { patientName?: string; patientCnp?: string } = {
        ...validatedData.analysis,
        patientName: patientName,
        patientCnp: patientCNP
      };

      setAnalysisResult(finalAnalysisResult);
      setRawTranscript(validatedData.transcription);

      console.log('✅ Procesare completă cu succes!');

    } catch (err: unknown) {
      console.error('❌ Failed to process audio:', err);

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Cererea a expirat după 3 minute. Workflow-ul n8n durează prea mult.\n\nPosibile cauze:\n• Deepgram API este lent\n• AI Agent face prea multe apeluri\n• Verificarea medicamentelor durează prea mult\n• Fișierul audio este foarte mare\n\nÎncercați un fișier mai scurt sau verificați statusul n8n.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Eroare de conexiune. Verificați:\n• Conexiunea la internet\n• URL-ul webhook din .env\n• n8n este pornit și accesibil');
        } else {
          setError(`A apărut o eroare la procesarea audio:\n${err.message}`);
        }
      } else {
        setError('A apărut o eroare necunoscută la procesarea audio');
      }

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
