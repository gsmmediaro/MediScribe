// @/types.ts

// TranscriptLine nu mai este folosit
// export interface TranscriptLine {
//   speaker: 'Doctor' | 'Pacient';
//   text: string;
// }

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

export interface AnalysisResult {
  rezumat: string;
  raportSOAP: SoapReport;
  diagnosticePosibile: string[];
  pasiUrmatori: string[];
  reteta: Reteta;
}

// LiveSession nu mai este folosit
// export interface LiveSession {
//   sendRealtimeInput: (input: { media: { data: string; mimeType: string; }; }) => void;
//   close: () => void;
// }