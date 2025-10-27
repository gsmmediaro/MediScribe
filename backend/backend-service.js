/**
 * MediScribe Backend Service
 *
 * Handles audio file uploads from frontend and forwards them to n8n webhook
 * with proper FormData formatting for Deepgram processing.
 *
 * Architecture:
 * Frontend (MediaRecorder) → Backend (Express) → n8n (Deepgram + Gemini) → Backend → Frontend
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);

// Validate required environment variables
if (!N8N_WEBHOOK_URL) {
  console.error('❌ ERROR: N8N_WEBHOOK_URL is not set in .env file');
  process.exit(1);
}

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/mediscribe-uploads/',
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimeTypes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/mp4'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
  }
});

// Ensure upload directory exists
const uploadDir = '/tmp/mediscribe-uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Health Check Endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MediScribe Backend',
    timestamp: new Date().toISOString(),
    n8nWebhookConfigured: !!N8N_WEBHOOK_URL
  });
});

/**
 * Audio Transcription Endpoint
 * POST /api/transcribe
 *
 * Accepts audio file upload, forwards to n8n webhook with correct FormData format
 *
 * Request: multipart/form-data with 'audio' field
 * Response: JSON with transcription and analysis from n8n
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  const startTime = Date.now();

  console.log('📤 Received transcription request');

  if (!req.file) {
    console.log('❌ No audio file in request');
    return res.status(400).json({
      success: false,
      error: 'No audio file provided. Please include an audio file with key "audio".'
    });
  }

  const audioFilePath = req.file.path;
  const fileSize = (req.file.size / 1024 / 1024).toFixed(2); // MB

  console.log(`📁 File received: ${req.file.originalname}`);
  console.log(`📊 File size: ${fileSize} MB`);
  console.log(`🎵 MIME type: ${req.file.mimetype}`);
  console.log(`💾 Temp path: ${audioFilePath}`);

  try {
    // Create FormData for n8n webhook
    const formData = new FormData();

    // ⚠️ CRITICAL: Key MUST be 'data' for Deepgram node in n8n
    formData.append('data', fs.createReadStream(audioFilePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size
    });

    console.log('🔄 Forwarding to n8n webhook...');
    console.log(`🌐 n8n URL: ${N8N_WEBHOOK_URL}`);

    // Send to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n webhook error:', n8nResponse.status, errorText);
      throw new Error(`n8n webhook returned status ${n8nResponse.status}: ${errorText}`);
    }

    const result = await n8nResponse.json();
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Processing completed in ${processingTime}s`);

    // Clean up temporary file
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error('⚠️ Failed to delete temp file:', err);
      else console.log('🗑️ Temp file deleted');
    });

    // Return result to frontend
    res.json({
      success: true,
      data: result,
      metadata: {
        processingTimeSeconds: parseFloat(processingTime),
        fileSize: `${fileSize} MB`,
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('❌ Error processing transcription:', error.message);

    // Clean up temporary file on error
    if (fs.existsSync(audioFilePath)) {
      fs.unlink(audioFilePath, (err) => {
        if (err) console.error('⚠️ Failed to delete temp file on error:', err);
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process transcription',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`
      });
    }
  }

  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 MediScribe Backend Service Started');
  console.log('=====================================');
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📤 Transcribe endpoint: http://localhost:${PORT}/api/transcribe`);
  console.log(`🔗 n8n webhook: ${N8N_WEBHOOK_URL}`);
  console.log(`🌍 CORS allowed origin: ${FRONTEND_URL}`);
  console.log(`📁 Max file size: ${MAX_FILE_SIZE_MB} MB`);
  console.log('=====================================');
  console.log('');
});

export default app;
