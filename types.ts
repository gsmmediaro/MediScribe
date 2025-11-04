// @/types.ts

/**
 * SOAP (Subjective, Objective, Assessment, Plan) Report structure
 * Used in medical documentation to organize patient consultation information
 */
export interface SoapReport {
  /** Patient's subjective description of symptoms and concerns */
  Subiectiv: string;
  /** Doctor's objective observations and examination findings */
  Obiectiv: string;
  /** Medical assessment and diagnosis */
  Analiza: string;
  /** Treatment plan and follow-up instructions */
  Plan: string;
}

/**
 * Medical prescription information
 */
export interface Reteta {
  /** List of prescribed medications with dosage */
  medicatie: string[];
  /** Administration instructions for the patient */
  instructiuni: string;
  /** Prescribing doctor's name (optional) */
  numeDoctor?: string;
}

/**
 * Complete analysis result from the AI processing
 * Contains all structured medical documentation
 */
export interface AnalysisResult {
  /** Brief summary of the consultation for the patient */
  rezumat: string;
  /** Structured SOAP report */
  raportSOAP: SoapReport;
  /** List of possible diagnoses identified */
  diagnosticePosibile: string[];
  /** Suggested ICD-10 diagnostic codes (optional) */
  coduriICD10Sugerate?: string[];
  /** Recommended next steps and follow-up actions */
  pasiUrmatori: string[];
  /** Prescription information */
  reteta: Reteta;
  /** Medical alerts (allergies, drug interactions, risks) (optional) */
  alerteMedicale?: string[];
  /** Patient name (added by frontend) */
  patientName?: string;
  /** Patient CNP (added by frontend) */
  patientCnp?: string;
}

/**
 * Complete response structure from n8n webhook
 */
export interface N8nResponse {
  /** Structured analysis from Gemini AI */
  analysis: AnalysisResult;
  /** Raw transcription with speaker labels ([DOCTOR]/[PACIENT]) */
  transcription: string;
}

/**
 * Transcription metadata from validation node
 */
export interface TranscriptionMetadata {
  char_count: number;
  word_count: number;
  sentence_count: number;
  speaker_count: number;
  has_diarization: boolean;
  consultation_type: 'fragment' | 'scurtă' | 'medie' | 'completă' | 'detaliată';
  completeness_percent: number;
  quality_score: number;
  quality_label: 'Slab' | 'Acceptabil' | 'Bun' | 'Excelent';
  medical_terms_found: string[];
  medical_terms_count: number;
  is_valid: boolean;
  is_complete_enough: boolean;
  has_medical_context: boolean;
  warnings: string[];
  processed_at: string;
  error?: string;
}

/**
 * Speaker segment from diarization
 */
export interface SpeakerSegment {
  speaker: number;
  text: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * API Request state
 */
export type RequestState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form field validation state
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}