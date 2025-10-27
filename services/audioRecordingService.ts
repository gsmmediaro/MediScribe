/**
 * Audio Recording Service for MediScribe
 *
 * Replaces Gemini Live API with local audio recording + backend processing
 *
 * Flow:
 * 1. startAudioRecording() - Start MediaRecorder, capture audio chunks
 * 2. User speaks...
 * 3. stopAudioRecording() - Stop recording, upload to backend, get analysis
 * 4. parseN8nResponse() - Convert n8n format to AnalysisResult format
 */

import type { AnalysisResult } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface AudioRecordingSession {
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
  stream: MediaStream;
  startTime: number;
}

/**
 * Start audio recording
 *
 * @param onProgress - Callback for recording progress (seconds elapsed)
 * @returns Recording session object
 */
export const startAudioRecording = async (
  onProgress?: (seconds: number) => void
): Promise<AudioRecordingSession> => {
  console.log('🎤 Starting audio recording...');

  // Check browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support audio recording. Please use a modern browser.');
  }

  if (!window.MediaRecorder) {
    throw new Error('MediaRecorder API is not supported in this browser.');
  }

  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000, // Optimal for Deepgram
        channelCount: 1, // Mono
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    console.log('✅ Microphone access granted');

    // Determine best audio format
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    } else {
      console.warn('⚠️ Preferred audio formats not supported, using default');
    }

    console.log(`🎵 Using MIME type: ${mimeType}`);

    const audioChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const startTime = Date.now();

    // Progress tracking
    let progressInterval: NodeJS.Timeout | null = null;
    if (onProgress) {
      progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        onProgress(elapsed);
      }, 1000);
    }

    // Collect audio chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log(`📦 Audio chunk: ${(event.data.size / 1024).toFixed(2)} KB`);
      }
    };

    // Handle recording stop
    mediaRecorder.onstop = () => {
      console.log('🛑 Recording stopped');
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    // Handle errors
    mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    // Start recording (capture data every 1 second)
    mediaRecorder.start(1000);
    console.log('▶️ Recording started');

    return {
      mediaRecorder,
      audioChunks,
      stream,
      startTime
    };

  } catch (error) {
    console.error('❌ Failed to start recording:', error);
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied. Please allow access to the microphone.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
    }
    throw error;
  }
};

/**
 * Stop audio recording and send to backend for processing
 *
 * @param session - Recording session from startAudioRecording
 * @returns Analysis result from n8n
 */
export const stopAudioRecording = async (
  session: AudioRecordingSession
): Promise<AnalysisResult> => {
  console.log('⏹️ Stopping recording...');

  return new Promise((resolve, reject) => {
    const { mediaRecorder, audioChunks, stream } = session;

    // Handle recording stop
    mediaRecorder.onstop = async () => {
      try {
        // Stop all tracks
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`🔇 Stopped track: ${track.kind}`);
        });

        // Create audio blob from chunks
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const duration = ((Date.now() - session.startTime) / 1000).toFixed(1);
        const fileSize = (audioBlob.size / 1024 / 1024).toFixed(2);

        console.log(`📊 Recording stats:`);
        console.log(`   Duration: ${duration}s`);
        console.log(`   Size: ${fileSize} MB`);
        console.log(`   Chunks: ${audioChunks.length}`);

        if (audioBlob.size === 0) {
          throw new Error('No audio data recorded. Please try again.');
        }

        // Create FormData for upload
        const formData = new FormData();
        const filename = `recording-${Date.now()}.webm`;
        formData.append('audio', audioBlob, filename);

        console.log('📤 Uploading to backend...');
        console.log(`   URL: ${BACKEND_URL}/api/transcribe`);

        // Upload to backend
        const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Backend returned status ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Backend response received');
        console.log(`   Processing time: ${result.metadata?.processingTimeSeconds}s`);

        if (!result.success) {
          throw new Error(result.error || 'Backend processing failed');
        }

        // Parse n8n response to AnalysisResult format
        const analysisResult = parseN8nResponse(result.data);
        console.log('✅ Analysis complete');

        resolve(analysisResult);

      } catch (error) {
        console.error('❌ Error processing recording:', error);
        reject(error);
      }
    };

    // Stop the recorder (triggers onstop event)
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  });
};

/**
 * Parse n8n webhook response to AnalysisResult format
 *
 * n8n format (from Gemini):
 * {
 *   "soap": { "subiectiv": "...", "obiectiv": "...", "evaluare": "...", "plan": "..." },
 *   "retete": ["med1", "med2"],
 *   "rezumat_pacient": "...",
 *   "alerte": ["alert1"],
 *   "transcription": [{ "speaker": "doctor", "text": "..." }]
 * }
 *
 * App format (AnalysisResult):
 * {
 *   rezumat: string,
 *   raportSOAP: { Subiectiv, Obiectiv, Analiza, Plan },
 *   diagnosticePosibile: string[],
 *   pasiUrmatori: string[],
 *   reteta: { medicatie: string[], instructiuni: string, numeDoctor?: string }
 * }
 */
export const parseN8nResponse = (n8nData: any): AnalysisResult => {
  console.log('🔄 Parsing n8n response...');

  try {
    // Handle different possible response structures
    const data = n8nData.result || n8nData;

    const analysisResult: AnalysisResult = {
      rezumat: data.rezumat_pacient || data.rezumat || 'No summary available',

      raportSOAP: {
        Subiectiv: data.soap?.subiectiv || data.soap?.Subiectiv || 'No subjective data',
        Obiectiv: data.soap?.obiectiv || data.soap?.Obiectiv || 'No objective data',
        Analiza: data.soap?.evaluare || data.soap?.Analiza || data.soap?.analiza || 'No analysis',
        Plan: data.soap?.plan || data.soap?.Plan || 'No plan'
      },

      diagnosticePosibile: data.diagnostice_posibile || data.diagnosticePosibile || data.alerte || [],

      pasiUrmatori: data.pasi_urmatori || data.pasiUrmatori || (
        data.soap?.plan ? [data.soap.plan] : []
      ),

      reteta: {
        medicatie: data.retete || data.reteta?.medicatie || [],
        instructiuni: data.reteta?.instructiuni || data.instructiuni_medicatie || (
          Array.isArray(data.retete) && data.retete.length > 0
            ? `Administrați: ${data.retete.join(', ')}`
            : 'No prescription'
        ),
        numeDoctor: data.nume_doctor || data.reteta?.numeDoctor
      }
    };

    console.log('✅ Response parsed successfully');
    return analysisResult;

  } catch (error) {
    console.error('❌ Failed to parse n8n response:', error);
    console.error('Raw data:', n8nData);

    // Return a safe fallback
    return {
      rezumat: 'Error parsing response from server',
      raportSOAP: {
        Subiectiv: 'Parse error',
        Obiectiv: 'Parse error',
        Analiza: 'Parse error',
        Plan: 'Parse error'
      },
      diagnosticePosibile: [],
      pasiUrmatori: [],
      reteta: {
        medicatie: [],
        instructiuni: 'Parse error'
      }
    };
  }
};

/**
 * Check if browser supports audio recording
 */
export const checkAudioRecordingSupport = (): { supported: boolean; error?: string } => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      error: 'Your browser does not support audio recording. Please use Chrome, Firefox, or Safari.'
    };
  }

  if (!window.MediaRecorder) {
    return {
      supported: false,
      error: 'MediaRecorder API is not available in your browser.'
    };
  }

  return { supported: true };
};
