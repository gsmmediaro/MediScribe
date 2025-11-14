// @/utils/validation.ts

/**
 * Validates Romanian CNP (Cod Numeric Personal)
 * CNP format: 13 digits
 * Structure: S AA LL ZZ JJ NNN C
 * S = Sex (1-6)
 * AA = Year
 * LL = Month (01-12)
 * ZZ = Day (01-31)
 * JJ = County code (01-52)
 * NNN = Sequence number
 * C = Control digit
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Cache compiled regex patterns for better performance
const CNP_PATTERN = /^\d{13}$/;
const NAME_PATTERN = /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-']+$/;
const AUDIO_EXTENSION_PATTERN = /\.(wav|mp3|webm|ogg|m4a|mp4)$/i;

export const validateCNP = (cnp: string): ValidationResult => {
  // Remove spaces and dashes
  const cleanCNP = cnp.replace(/[\s-]/g, '');
  
  // Check if empty (CNP is optional) - early return
  if (cleanCNP.length === 0) {
    return { isValid: true };
  }
  
  // Check length - early return
  if (cleanCNP.length !== 13) {
    return {
      isValid: false,
      error: 'CNP-ul trebuie să aibă exact 13 cifre'
    };
  }
  
  // Check if all characters are digits - use cached regex
  if (!CNP_PATTERN.test(cleanCNP)) {
    return {
      isValid: false,
      error: 'CNP-ul trebuie să conțină doar cifre'
    };
  }
  
  // Validate first digit (sex)
  const sex = parseInt(cleanCNP[0]);
  if (sex < 1 || sex > 9) {
    return {
      isValid: false,
      error: 'CNP invalid: cifra pentru sex trebuie să fie între 1-9'
    };
  }
  
  // Validate month (positions 3-4)
  const month = parseInt(cleanCNP.substring(3, 5));
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: 'CNP invalid: luna trebuie să fie între 01-12'
    };
  }
  
  // Validate day (positions 5-6)
  const day = parseInt(cleanCNP.substring(5, 7));
  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: 'CNP invalid: ziua trebuie să fie între 01-31'
    };
  }
  
  // Validate county code (positions 7-8)
  const county = parseInt(cleanCNP.substring(7, 9));
  if (county < 1 || (county > 52 && county !== 99)) {
    return {
      isValid: false,
      error: 'CNP invalid: cod județ invalid'
    };
  }
  
  // Validate control digit
  const controlWeights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNP[i]) * controlWeights[i];
  }
  
  const controlDigit = sum % 11 === 10 ? 1 : sum % 11;
  const actualControlDigit = parseInt(cleanCNP[12]);
  
  if (controlDigit !== actualControlDigit) {
    return {
      isValid: false,
      error: 'CNP invalid: cifra de control nu corespunde'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates patient name
 */
export const validatePatientName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  // Early return for empty
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      error: 'Numele pacientului este obligatoriu'
    };
  }
  
  // Early return for too short
  if (trimmedName.length < 3) {
    return {
      isValid: false,
      error: 'Numele trebuie să aibă cel puțin 3 caractere'
    };
  }
  
  // Early return for too long
  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: 'Numele este prea lung (maxim 100 caractere)'
    };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes) - use cached regex
  if (!NAME_PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Numele poate conține doar litere, spații și cratime'
    };
  }
  
  // Check for at least two parts (first and last name)
  const parts = trimmedName.split(/\s+/).filter(p => p.length > 0);
  if (parts.length < 2) {
    return {
      isValid: false,
      error: 'Introduceți prenumele și numele de familie'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates audio file
 */
export const validateAudioFile = (file: File): ValidationResult => {
  // Check file type - using cached regex for extension check
  const validTypes = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4'
  ];
  
  if (!validTypes.includes(file.type) && !AUDIO_EXTENSION_PATTERN.test(file.name)) {
    return {
      isValid: false,
      error: 'Format audio invalid. Utilizați: WAV, MP3, WebM, OGG sau M4A'
    };
  }
  
  // Check file size (max 50MB) - early return
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Fișierul este prea mare (maxim 50MB)'
    };
  }
  
  // Check minimum size (at least 1KB) - early return
  if (file.size < 1024) {
    return {
      isValid: false,
      error: 'Fișierul este prea mic sau corupt'
    };
  }
  
  return { isValid: true };
};

/**
 * Format CNP with spaces for better readability
 */
export const formatCNP = (cnp: string): string => {
  const cleanCNP = cnp.replace(/[\s-]/g, '');
  if (cleanCNP.length !== 13) return cnp;
  
  // Format as: S AA LL ZZ JJ NNN C
  return `${cleanCNP[0]} ${cleanCNP.substring(1, 3)} ${cleanCNP.substring(3, 5)} ${cleanCNP.substring(5, 7)} ${cleanCNP.substring(7, 9)} ${cleanCNP.substring(9, 12)} ${cleanCNP[12]}`;
};

