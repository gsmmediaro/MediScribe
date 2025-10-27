import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Gemini API Key (for live transcription)
        'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),

        // n8n Webhook URL (for backend processing)
        'process.env.N8N_WEBHOOK_URL': JSON.stringify(env.N8N_WEBHOOK_URL),

        // Optional: Deepgram API Key
        'process.env.DEEPGRAM_API_KEY': JSON.stringify(env.DEEPGRAM_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
