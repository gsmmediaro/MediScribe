import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { LiveSession, AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Helper Functions ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string; } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Live Transcription Service ---

export const startLiveTranscription = async (
  onTranscriptUpdate: (transcript: string, isFinal: boolean) => void
): Promise<{ 
  session: LiveSession; 
  stream: MediaStream;
  context: AudioContext;
  processor: ScriptProcessorNode;
  source: MediaStreamAudioSourceNode;
}> => {
  let currentInputTranscription = '';

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => console.log('Live session opened.'),
      onmessage: (message) => {
        if (message.serverContent?.inputTranscription) {
          const { text } = message.serverContent.inputTranscription;
          currentInputTranscription += text;
          onTranscriptUpdate(currentInputTranscription, false);
        }
        if (message.serverContent?.turnComplete) {
          onTranscriptUpdate(currentInputTranscription, true);
          currentInputTranscription = '';
        }
      },
      onerror: (e) => console.error('Live session error:', e),
      onclose: (e) => console.log('Live session closed.'),
    },
    config: {
      inputAudioTranscription: {},
      responseModalities: [Modality.AUDIO],
    },
  });

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // FIX: Cast window to `any` to allow for `webkitAudioContext` for browser compatibility.
  const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (audioProcessingEvent) => {
    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
    const pcmBlob = createBlob(inputData);
    sessionPromise.then((session) => {
      session.sendRealtimeInput({ media: pcmBlob });
    });
  };

  source.connect(processor);
  processor.connect(context.destination);

  const session = await sessionPromise;
  return { session, stream, context, processor, source };
};


// --- Medical Analysis Service ---

export const generateMedicalAnalysis = async (transcript: string): Promise<AnalysisResult> => {
  const systemInstruction = `Ești un asistent medical expert. Analizează următoarea transcriere a unei consultații medicale în limba română, care include etichete pentru vorbitori ('Doctor:' și 'Pacient:'). Sarcina ta este să extragi informații cheie și să le structurezi într-un format JSON specific. Răspunsul trebuie să fie exclusiv în format JSON, conform schemei furnizate. Dacă nu se prescrie nicio rețetă, returnează câmpurile din 'reteta' ca fiind goale (ex: medicatie: [], instructiuni: ""). Extrage numele doctorului dacă este menționat. Nu adăuga text suplimentar înainte sau după obiectul JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: transcript,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rezumat: {
            type: Type.STRING,
            description: "Un rezumat concis al consultației, evidențiind principalele simptome, discuții și concluzii.",
          },
          raportSOAP: {
            type: Type.OBJECT,
            description: "Un raport structurat în format SOAP (Subiectiv, Obiectiv, Analiză, Plan).",
            properties: {
              Subiectiv: { type: Type.STRING, description: "Ce spune pacientul: simptome, istoric, context." },
              Obiectiv: { type: Type.STRING, description: "Observații clinice, rezultate ale examinării fizice sau ale testelor menționate." },
              Analiza: { type: Type.STRING, description: "Evaluarea medicului, diagnosticul diferențial." },
              Plan: { type: Type.STRING, description: "Pașii următori: tratament, teste suplimentare, recomandări, trimiteri." },
            },
            required: ["Subiectiv", "Obiectiv", "Analiza", "Plan"]
          },
          diagnosticePosibile: {
            type: Type.ARRAY,
            description: "O listă cu posibile diagnostice menționate sau deduse din conversație.",
            items: { type: Type.STRING },
          },
          pasiUrmatori: {
            type: Type.ARRAY,
            description: "O listă clară de acțiuni viitoare, cum ar fi teste de laborator, imagistică, consulturi de specialitate sau prescripții.",
            items: { type: Type.STRING },
          },
          reteta: {
            type: Type.OBJECT,
            description: "Detalii despre rețeta medicală prescrisă. Dacă nu există rețetă, returnează câmpuri goale.",
            properties: {
              medicatie: {
                type: Type.ARRAY,
                description: "Lista de medicamente prescrise (ex: ['Paracetamol 500mg', 'Nurofen 200mg']).",
                items: { type: Type.STRING }
              },
              instructiuni: {
                type: Type.STRING,
                description: "Instrucțiuni de administrare pentru medicamente (ex: 'Un comprimat de Paracetamol la 6 ore, Nurofen la nevoie')."
              },
              numeDoctor: {
                type: Type.STRING,
                description: "Numele medicului care a prescris rețeta, dacă este menționat în conversație."
              },
            },
            required: ["medicatie", "instructiuni"]
          }
        },
        required: ["rezumat", "raportSOAP", "diagnosticePosibile", "pasiUrmatori", "reteta"]
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini JSON response:", response.text);
    throw new Error("Răspunsul de la AI nu a putut fi procesat. Format invalid.");
  }
};