# MediScribe Setup Instructions

Quick setup guide to get MediScribe running locally.

---

## Prerequisites

- Node.js v18+
- npm or yarn
- n8n instance (cloud or self-hosted)
- Deepgram API key
- Google Gemini API key

---

## Setup Steps

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend** - Create `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

**Backend** - Create `backend/.env`:
```env
PORT=3001
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/mediscribe-transcribe
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=50
```

### 3. Configure n8n Workflow

1. Create new workflow in n8n
2. Add Webhook node:
   - Path: `/webhook/mediscribe-transcribe`
   - Method: POST
   - Response: Return Workflow Data
3. Add Deepgram node:
   - **Binary Field**: `data` (CRITICAL!)
   - Language: Romanian (`ro`)
   - Diarization: Enabled
4. Add Gemini node:
   - Model: `gemini-2.0-flash-exp`
   - Prompt: Your medical SOAP analysis prompt
5. Connect nodes: Webhook → Deepgram → Gemini → Response
6. Activate workflow
7. Copy webhook URL to `backend/.env`

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

You should see:
```
🚀 MediScribe Backend Service Started
=====================================
📡 Server listening on port 3001
🌐 Health check: http://localhost:3001/api/health
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

You should see:
```
VITE ready
Local: http://localhost:5173/
```

### 5. Test

1. Open http://localhost:3001/api/health - should return `{"status":"healthy"}`
2. Open http://localhost:5173 - should show MediScribe UI
3. Click "Start Înregistrare" - allow microphone access
4. Speak for 5-10 seconds
5. Click "Stop" - wait 10-30 seconds
6. View SOAP report results

---

## Troubleshooting

### Backend won't start
- Check `N8N_WEBHOOK_URL` is set in `backend/.env`
- Ensure port 3001 is not in use: `lsof -i :3001`

### Frontend can't connect to backend
- Verify `VITE_BACKEND_URL` in `.env.local`
- Check backend is running: `curl http://localhost:3001/api/health`

### n8n error "binary file 'data' not found"
- Ensure Deepgram node is configured to expect field `data`
- Check backend logs show "Forwarding to n8n webhook..."

### No microphone access
- Allow microphone permissions in browser
- Use HTTPS in production (required for MediaRecorder)

---

## Production Deployment

### Frontend (Vite)
```bash
npm run build
# Deploy dist/ folder to hosting (Vercel, Netlify, etc.)
# Update VITE_BACKEND_URL to production backend URL
```

### Backend (Node.js)
```bash
cd backend
# Set environment variables on hosting platform
# Deploy to Node.js hosting (Railway, Render, etc.)
# Update FRONTEND_URL to production frontend URL
```

### n8n
- Use n8n Cloud or self-hosted instance
- Ensure webhook is accessible from backend
- Set API keys in n8n credentials

---

## Support

See README.md for detailed documentation and troubleshooting.
