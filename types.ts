export interface TranscriptLine {
  speaker: 'Doctor' | 'Pacient';
  text: string;
}

export interface SoapReport {
  Subiectiv: string;
  Obiectiv: string;
  Analiza: string;
  Plan: string;
}

export interface Reteta {
  medicatie: string[];
  instructiuni: string;
  numeDoctor?: string;
}

// n8n Workflow Enhanced Metadata
export interface TranscriptionMetadata {
  char_count: number;
  word_count: number;
  sentence_count: number;
  speaker_count: number;
  has_diarization: boolean;
  consultation_type: 'fragment' | 'scurtă' | 'medie' | 'completă' | 'detaliată';
  completeness_percent: number;
  quality_score: number; // 0-100
  quality_label: 'Slab' | 'Acceptabil' | 'Bun' | 'Excelent';
  medical_terms_found: string[];
  medical_terms_count: number;
  is_valid: boolean;
  is_complete_enough: boolean;
  has_medical_context: boolean;
  warnings: string[];
  processed_at: string;
}

export interface SpeakerSegment {
  speaker: number; // 0 = Doctor, 1 = Pacient
  text: string;
}

export interface PrescriptionItem {
  medicament: string;
  doza: string;
  frecventa: string;
  duratie: string;
  instructiuni?: string;
}

// Enhanced Analysis Result from n8n workflow
export interface AnalysisResult {
  rezumat: string;
  raportSOAP: SoapReport;
  diagnosticePosibile: string[];
  pasiUrmatori: string[];
  reteta: Reteta;
  // n8n enriched metadata
  metadata?: TranscriptionMetadata;
  prescriptions?: PrescriptionItem[];
  alerts?: string[];
}

// n8n Webhook Response
export interface N8nWebhookResponse {
  success: boolean;
  consultation_id?: string;
  status: string;
  quality_score?: number;
  soap_available: boolean;
  message: string;
  // Full data payload
  data?: {
    transcript: string;
    transcript_with_speakers: string;
    speaker_segments: SpeakerSegment[];
    transcription_metadata: TranscriptionMetadata;
    soap: {
      subiectiv: string;
      obiectiv: string;
      evaluare: string;
      plan: string;
    };
    retete?: PrescriptionItem[];
    rezumat_pacient?: string;
    alerte?: string[];
    metadata?: {
      transcriere_completa: boolean;
      tip_consultatie: string;
      vorbitori_detectati: number;
      termeni_medicali_detectati: number;
      informatii_lipsa: string[];
    };
  };
}

export interface LiveSession {
  sendRealtimeInput: (input: { media: { data: string; mimeType: string; }; }) => void;
  close: () => void;
}
