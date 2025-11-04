// @/constants.ts

/**
 * Application constants and configuration
 */

// Audio recording settings
export const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 48000,
  },
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  MIN_SIZE_BYTES: 1024,
  ACCEPTED_FORMATS: [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
  ],
  ACCEPTED_EXTENSIONS: ['.wav', '.mp3', '.webm', '.ogg', '.m4a', '.mp4'],
};

// Form validation
export const VALIDATION = {
  PATIENT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-']+$/,
  },
  CNP: {
    LENGTH: 13,
    PATTERN: /^\d{13}$/,
  },
};

// Romanian county codes for CNP validation
export const ROMANIAN_COUNTIES = [
  { code: '01', name: 'Alba' },
  { code: '02', name: 'Arad' },
  { code: '03', name: 'Argeș' },
  { code: '04', name: 'Bacău' },
  { code: '05', name: 'Bihor' },
  { code: '06', name: 'Bistrița-Năsăud' },
  { code: '07', name: 'Botoșani' },
  { code: '08', name: 'Brașov' },
  { code: '09', name: 'Brăila' },
  { code: '10', name: 'Buzău' },
  { code: '11', name: 'Caraș-Severin' },
  { code: '12', name: 'Cluj' },
  { code: '13', name: 'Constanța' },
  { code: '14', name: 'Covasna' },
  { code: '15', name: 'Dâmbovița' },
  { code: '16', name: 'Dolj' },
  { code: '17', name: 'Galați' },
  { code: '18', name: 'Gorj' },
  { code: '19', name: 'Harghita' },
  { code: '20', name: 'Hunedoara' },
  { code: '21', name: 'Ialomița' },
  { code: '22', name: 'Iași' },
  { code: '23', name: 'Ilfov' },
  { code: '24', name: 'Maramureș' },
  { code: '25', name: 'Mehedinți' },
  { code: '26', name: 'Mureș' },
  { code: '27', name: 'Neamț' },
  { code: '28', name: 'Olt' },
  { code: '29', name: 'Prahova' },
  { code: '30', name: 'Satu Mare' },
  { code: '31', name: 'Sălaj' },
  { code: '32', name: 'Sibiu' },
  { code: '33', name: 'Suceava' },
  { code: '34', name: 'Teleorman' },
  { code: '35', name: 'Timiș' },
  { code: '36', name: 'Tulcea' },
  { code: '37', name: 'Vaslui' },
  { code: '38', name: 'Vâlcea' },
  { code: '39', name: 'Vrancea' },
  { code: '40', name: 'București' },
  { code: '41', name: 'București S.1' },
  { code: '42', name: 'București S.2' },
  { code: '43', name: 'București S.3' },
  { code: '44', name: 'București S.4' },
  { code: '45', name: 'București S.5' },
  { code: '46', name: 'București S.6' },
  { code: '51', name: 'Călărași' },
  { code: '52', name: 'Giurgiu' },
];

// Error messages
export const ERROR_MESSAGES = {
  NO_WEBHOOK_URL: 'URL-ul webhook n8n nu este configurat. Verificați fișierul .env',
  NO_MICROPHONE: 'Nu am putut accesa microfonul. Verificați permisiunile browserului.',
  NO_AUDIO_RECORDED: 'Nu a fost înregistrat niciun sunet.',
  INVALID_PATIENT_NAME: 'Numele pacientului este invalid',
  INVALID_CNP: 'CNP-ul introdus este invalid',
  INVALID_AUDIO_FILE: 'Fișierul audio este invalid',
  NETWORK_ERROR: 'Eroare de conexiune. Verificați conexiunea la internet.',
  SERVER_ERROR: 'Eroare de la serverul n8n',
};

// Success messages
export const SUCCESS_MESSAGES = {
  RECORDING_STARTED: 'Înregistrarea a început',
  RECORDING_STOPPED: 'Înregistrarea s-a oprit',
  FILE_UPLOADED: 'Fișier încărcat cu succes',
  ANALYSIS_COMPLETE: 'Analiza a fost completată',
};

// UI text
export const UI_TEXT = {
  APP_TITLE: 'MediScribe',
  APP_SUBTITLE: 'Asistentul tău AI pentru documentație medicală rapidă',
  PATIENT_NAME_LABEL: 'Nume Pacient',
  PATIENT_CNP_LABEL: 'CNP Pacient',
  START_RECORDING: 'Start Transcriere',
  STOP_RECORDING: 'Stop & Procesează',
  UPLOAD_FILE: 'Încarcă fișier',
  PROCESSING: 'Se procesează consultația...',
  RECORDING: 'Înregistrare în curs...',
  WAITING: 'Completează datele, apoi înregistrează sau încarcă un fișier.',
};

