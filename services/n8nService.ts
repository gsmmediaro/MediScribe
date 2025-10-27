/**
 * n8n Backend Integration Service
 *
 * This service replaces the Google AI Studio backend with the n8n workflow backend.
 * It handles:
 * - Audio file upload to n8n webhook
 * - Deepgram transcription with real voice diarization
 * - Quality scoring and medical term detection
 * - Gemini SOAP generation through n8n
 * - MongoDB storage and email notifications
 */

import { config } from '../config';
import type { AnalysisResult, N8nWebhookResponse, TranscriptLine } from '../types';

/**
 * Convert recorded audio blob to base64 for n8n webhook
 */
const audioBlobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Content = base64.split(',')[1] || base64;
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload audio recording to n8n webhook for processing
 *
 * @param audioBlob - The recorded audio blob
 * @param patientId - Optional patient identifier
 * @returns Processing result with transcription, SOAP, and metadata
 */
export const uploadAudioToN8n = async (
  audioBlob: Blob,
  patientId?: string
): Promise<N8nWebhookResponse> => {
  const base64Audio = await audioBlobToBase64(audioBlob);

  const payload = {
    audio: {
      data: base64Audio,
      mimeType: audioBlob.type || config.audio.format,
      size: audioBlob.size,
    },
    metadata: {
      patient_id: patientId || `pat_${Date.now()}`,
      uploaded_at: new Date().toISOString(),
      source: 'mediscribe-frontend',
    },
  };

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < config.n8n.maxRetries; attempt++) {
    try {
      const response = await fetch(config.n8n.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.n8n.timeout),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook returned status ${response.status}: ${response.statusText}`);
      }

      const result: N8nWebhookResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'n8n processing failed');
      }

      return result;

    } catch (error) {
      lastError = error as Error;
      console.error(`n8n upload attempt ${attempt + 1} failed:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < config.n8n.maxRetries - 1) {
        const delay = config.n8n.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`n8n upload failed after ${config.n8n.maxRetries} attempts: ${lastError?.message}`);
};

/**
 * Convert n8n webhook response to AnalysisResult format
 * (compatible with existing UI components)
 */
export const convertN8nResponseToAnalysisResult = (
  n8nResponse: N8nWebhookResponse
): AnalysisResult => {
  if (!n8nResponse.data) {
    throw new Error('n8n response missing data payload');
  }

  const { data } = n8nResponse;

  return {
    rezumat: data.rezumat_pacient || 'Rezumat indisponibil',
    raportSOAP: {
      Subiectiv: data.soap.subiectiv,
      Obiectiv: data.soap.obiectiv,
      Analiza: data.soap.evaluare, // Map "evaluare" → "Analiza"
      Plan: data.soap.plan,
    },
    diagnosticePosibile: extractDiagnosticsFromSOAP(data.soap.evaluare),
    pasiUrmatori: extractNextStepsFromSOAP(data.soap.plan),
    reteta: {
      medicatie: data.retete?.map(r => `${r.medicament} ${r.doza}`) || [],
      instructiuni: data.retete?.map(r =>
        `${r.medicament}: ${r.frecventa}, ${r.duratie}${r.instructiuni ? ' - ' + r.instructiuni : ''}`
      ).join('\n') || '',
      numeDoctor: data.metadata?.transcriere_completa ? 'Dr. [Nume din Transcriere]' : undefined,
    },
    // Enhanced n8n metadata
    metadata: data.transcription_metadata,
    prescriptions: data.retete,
    alerts: data.alerte,
  };
};

/**
 * Extract possible diagnostics from SOAP "Evaluare" section
 */
const extractDiagnosticsFromSOAP = (evaluare: string): string[] => {
  if (!evaluare || evaluare === '[INFORMAȚIE LIPSĂ]') {
    return [];
  }

  // Simple extraction: look for medical conditions
  const diagnosticKeywords = [
    'diagnostice',
    'diagnostic diferențial',
    'suspiciune de',
    'posibil',
    'probabilitate',
  ];

  const lines = evaluare.split('\n').filter(line => {
    const lowerLine = line.toLowerCase();
    return diagnosticKeywords.some(keyword => lowerLine.includes(keyword));
  });

  return lines.length > 0 ? lines : [evaluare];
};

/**
 * Extract next steps from SOAP "Plan" section
 */
const extractNextStepsFromSOAP = (plan: string): string[] => {
  if (!plan || plan === '[INFORMAȚIE LIPSĂ]') {
    return [];
  }

  // Split by bullet points or numbered lists
  const steps = plan
    .split(/\n[-•*\d.]\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return steps.length > 0 ? steps : [plan];
};

/**
 * Parse transcript from n8n speaker segments to TranscriptLine format
 */
export const parseN8nTranscript = (speakerSegments: Array<{ speaker: number; text: string }>): TranscriptLine[] => {
  return speakerSegments.map(segment => ({
    speaker: segment.speaker === 0 ? 'Doctor' : 'Pacient',
    text: segment.text,
  }));
};

/**
 * Generate medical analysis by uploading audio to n8n workflow
 * (Replacement for geminiService.generateMedicalAnalysis)
 *
 * @param audioBlob - The recorded audio blob
 * @returns Analysis result with SOAP notes and metadata
 */
export const generateMedicalAnalysisViaN8n = async (audioBlob: Blob): Promise<AnalysisResult> => {
  const n8nResponse = await uploadAudioToN8n(audioBlob);
  const analysisResult = convertN8nResponseToAnalysisResult(n8nResponse);
  return analysisResult;
};

/**
 * HYBRID APPROACH: Use Gemini for live transcription, n8n for final analysis
 * This allows real-time feedback while leveraging n8n's enhanced features
 */
export { startLiveTranscription } from './geminiService';

/**
 * Health check for n8n webhook
 */
export const checkN8nHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(config.n8n.webhookUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};
