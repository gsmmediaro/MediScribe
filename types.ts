// @/types.ts

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

// Am adăugat câmpurile noi opționale
export interface AnalysisResult {
  rezumat: string;
  raportSOAP: SoapReport;
  diagnosticePosibile: string[];
  coduriICD10Sugerate?: string[]; // ICD-10 Sugerate
  pasiUrmatori: string[];
  reteta: Reteta;
  alerteMedicale?: string[]; // Alerte
}

// Tip nou pentru răspunsul complet de la n8n
export type N8nResponse = {
  analysis: AnalysisResult;
  transcription: string; // Transcrierea brută
}