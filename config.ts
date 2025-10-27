// Configuration for n8n Backend Integration

export const config = {
  // n8n Webhook URL - Update this with your actual n8n workflow webhook URL
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/mediscribe-consultation',
    timeout: 120000, // 2 minutes for full workflow (Deepgram + Gemini + MongoDB)
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
  },

  // Feature flags
  features: {
    useLiveTranscription: true, // Keep Gemini streaming for real-time feedback
    useN8nForAnalysis: true, // Use n8n for final SOAP + metadata
    showQualityMetrics: true, // Display quality score, medical terms, etc.
    enableMongoDBStorage: true, // Store in MongoDB via n8n
    enableEmailNotifications: true, // Send email via n8n
  },

  // Audio settings
  audio: {
    sampleRate: 16000,
    channels: 1,
    format: 'audio/wav', // Or 'audio/webm' depending on browser support
  },

  // Validation thresholds (matching n8n workflow)
  validation: {
    minCharCount: 10,
    minWordCount: 5,
    minSpeakerCount: 2,
    minQualityScore: 30,
  },
};

// Helper to check if n8n integration is configured
export const isN8nConfigured = (): boolean => {
  return !!config.n8n.webhookUrl && config.n8n.webhookUrl !== 'http://localhost:5678/webhook/mediscribe-consultation';
};
