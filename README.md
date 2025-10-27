# MediScribe - AI Medical Transcription Assistant

🏥 **Medical consultation transcription and analysis powered by AI**

MediScribe records medical consultations, transcribes them with speaker diarization, and generates structured SOAP reports automatically using n8n workflows, Deepgram API, and Google Gemini AI.

---

## 🏗️ Architecture

```
┌─────────────┐           ┌─────────────┐           ┌──────────────┐
│   Frontend  │  Audio    │   Backend   │ FormData  │     n8n      │
│  (React +   │  ──────►  │  (Express)  │  ──────►  │   Workflow   │
│ TypeScript) │           │   Server    │           │              │
└─────────────┘           └─────────────┘           └──────────────┘
      ▲                                                     │
      │                                                     │
      │                                              ┌──────▼────────┐
      │                JSON Result                   │   Deepgram    │
      └──────────────────────────────────────────────┤ (Transcribe + │
                                                     │  Diarization) │
                                                     └───────┬───────┘
                                                             │
                                                     ┌───────▼───────┐
                                                     │  Gemini AI    │
                                                     │ (SOAP Report) │
                                                     └───────────────┘
```

### Flow:
1. **Frontend**: User records audio with MediaRecorder API
2. **Backend**: Receives audio file, forwards to n8n webhook as FormData
3. **n8n Workflow**:
   - Deepgram node transcribes audio with speaker diarization
   - Validation node formats transcription
   - Gemini AI node generates SOAP report
4. **Backend**: Returns structured JSON to frontend
5. **Frontend**: Displays transcription and analysis

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **n8n instance** with configured webhook (see [n8n Setup](#n8n-setup))
- **API Keys**:
  - Deepgram API key (in n8n)
  - Google Gemini API key (in n8n)

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd MediScribe

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend** (`.env.local`):
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=3001
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/mediscribe-transcribe
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=50
```

### 3. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

### 4. Test

Open browser at `http://localhost:5173`

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

This runs automated tests for:
- ✅ Health check endpoint
- ✅ File upload with dummy audio
- ✅ Invalid request handling

### Manual Testing

1. **Start recording** - Click "Start Înregistrare"
2. **Speak** - Timer shows recording duration
3. **Stop recording** - Click "Stop"
4. **Wait** - Processing takes 10-30 seconds
5. **View results** - SOAP report, prescription, next steps

---

## 🛠️ n8n Setup

### Workflow Structure

Your n8n workflow must include these nodes:

1. **Webhook Trigger** (`/webhook/mediscribe-transcribe`)
   - Method: POST
   - Response: Return Workflow Data

2. **Deepgram Node**
   - **CRITICAL**: Expects binary field named `data`
   - Enable speaker diarization
   - Language: Romanian (`ro`)

3. **Validation Node** (Code/Function)
   - Validates transcription format
   - Ensures speaker labels are present

4. **Gemini AI Node**
   - Model: `gemini-2.0-flash-exp`
   - Prompt: Medical SOAP analysis in Romanian
   - Output: JSON with structure:
     ```json
     {
       "soap": {
         "subiectiv": "...",
         "obiectiv": "...",
         "evaluare": "...",
         "plan": "..."
       },
       "retete": ["med1", "med2"],
       "rezumat_pacient": "...",
       "diagnostice_posibile": ["diag1"],
       "pasi_urmatori": ["step1"]
     }
     ```

5. **Response Node**
   - Return JSON result

### Critical Configuration

**⚠️ IMPORTANT**: The Deepgram node in n8n expects a binary file with the key `data`.

The backend service sends:
```javascript
formData.append('data', fileStream, { ... });
```

If you change this to `audio`, `file`, or anything else, the Deepgram node will fail with:
```
This operation expects the node's input data to contain a binary file 'data', but none was found
```

---

## 📁 Project Structure

```
MediScribe/
├── App.tsx                      # Main app component (NEW - audio recording)
├── App-OldGeminiLive.tsx        # Legacy version (Gemini Live API)
├── components/
│   ├── Header.tsx               # Header component
│   ├── Controls.tsx             # Recording controls
│   ├── TranscriptionView.tsx    # Transcript display
│   ├── AnalysisView.tsx         # SOAP report display
│   └── Icons.tsx                # Icon components
├── services/
│   ├── audioRecordingService.ts # Audio recording + backend API (NEW)
│   └── geminiService.ts         # Legacy Gemini Live service
├── types.ts                     # TypeScript types
├── backend/
│   ├── backend-service.js       # Express server
│   ├── package.json             # Backend dependencies
│   ├── test-backend.js          # Backend test suite
│   └── .env                     # Backend config
├── package.json                 # Frontend dependencies
├── .env.local                   # Frontend config
└── README.md                    # This file
```

---

## 🔧 Troubleshooting

### Problem: "Browser does not support audio recording"

**Solution**: Use Chrome, Firefox, or Safari (latest versions). Edge may work but not guaranteed.

---

### Problem: Backend returns "n8n webhook returned status 500"

**Causes**:
1. n8n webhook URL is incorrect
2. n8n workflow is not active
3. Deepgram API key is missing/invalid in n8n

**Solution**:
- Verify `N8N_WEBHOOK_URL` in `backend/.env`
- Check n8n workflow is activated
- Test webhook manually: `curl -X POST <webhook-url>`
- Check n8n execution logs

---

### Problem: "This operation expects binary file 'data' but none was found"

**Cause**: FormData key mismatch between backend and n8n

**Solution**: Ensure `backend-service.js` line ~107 uses key `data`:
```javascript
formData.append('data', fs.createReadStream(audioFilePath), { ... });
```

If you changed the Deepgram node to expect a different key, update backend accordingly.

---

### Problem: "CORS error" in browser console

**Cause**: Backend CORS not allowing frontend origin

**Solution**: Check `FRONTEND_URL` in `backend/.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

For production, update to your deployed frontend URL.

---

### Problem: "Processing takes too long (> 60 seconds)"

**Causes**:
1. Large audio file (> 10 MB)
2. Slow n8n/Deepgram/Gemini response
3. Network issues

**Solution**:
- Keep recordings under 5 minutes
- Check n8n execution time in workflow logs
- Consider adding timeout handling in backend (default 120s)

---

### Problem: "Parse error" in SOAP report

**Cause**: n8n response format doesn't match expected structure

**Solution**: Check `parseN8nResponse()` in `audioRecordingService.ts`:246
- Log raw n8n response: `console.log(n8nData)`
- Update parsing logic to match your n8n output structure
- Ensure Gemini prompt returns consistent JSON format

---

## 🔐 Security Notes

### Important Security Considerations:

1. **NEVER commit `.env` files** to version control
   - Use `.env.example` as template
   - Add `.env` and `.env.local` to `.gitignore`

2. **API Keys**:
   - Store Deepgram/Gemini keys in n8n (not in frontend/backend)
   - Backend only needs n8n webhook URL (no API keys)

3. **File Uploads**:
   - Backend validates file types (audio only)
   - Max file size: 50 MB (configurable)
   - Temp files are deleted after processing

4. **CORS**:
   - Backend only accepts requests from configured `FRONTEND_URL`
   - Update for production deployment

5. **Medical Data**:
   - ⚠️ This is a demo application
   - DO NOT use for real patient data without:
     - HIPAA compliance review
     - End-to-end encryption
     - Secure data storage
     - Audit logging
     - Patient consent system

---

## 📝 Development Notes

### Task 1: Toggle Manual Speaker (FIXED)

**Problem**: When user switched between "Doctor" and "Patient" buttons during recording, the speaker label didn't change for new transcript segments.

**Solution**: Used `useRef` pattern to access current state values in callbacks:
```typescript
const speakerModeRef = useRef(speakerMode);
const manualSpeakerRef = useRef(manualSpeaker);

// Sync refs with state
useEffect(() => {
  speakerModeRef.current = speakerMode;
}, [speakerMode]);

// Read from refs in callback
const speaker = speakerModeRef.current === 'auto'
  ? diarizeSpeaker(text)
  : manualSpeakerRef.current;
```

This fix is included in **App-OldGeminiLive.tsx** (legacy version).

---

### Task 2: Backend + Audio Recording (NEW)

**Replaced**: Gemini Live API streaming transcription
**With**: MediaRecorder → Backend → n8n → Deepgram + Gemini

**Benefits**:
- ✅ Proper speaker diarization via Deepgram
- ✅ Server-side processing (no API keys in frontend)
- ✅ n8n workflow flexibility
- ✅ Better audio quality control

**Trade-offs**:
- ❌ No live transcription (must record full session)
- ❌ Processing delay (10-30 seconds)
- ❌ Requires backend service

---

## 🎯 Next Steps

### Potential Improvements:

1. **Authentication**
   - Add user login
   - Session management
   - Role-based access (doctor/admin)

2. **Data Persistence**
   - Save consultations to database
   - Patient history tracking
   - Search functionality

3. **UI Enhancements**
   - Edit transcription before analysis
   - Manual speaker correction
   - Export to PDF/Word

4. **Advanced Features**
   - Multi-language support
   - Custom medical templates
   - Integration with EHR systems
   - Real-time collaboration

5. **Production Readiness**
   - Docker containers
   - CI/CD pipeline
   - Monitoring & logging
   - Automated testing

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 🐛 Issues

Found a bug? Have a feature request?

Open an issue on GitHub: [Your Repo Issues](https://github.com/your-repo/issues)

---

## 📞 Support

For questions or support:
- 📧 Email: your-email@example.com
- 💬 Discord: [Your Discord Server]
- 📖 Docs: [Your Documentation Site]

---

**Built with ❤️ using React, TypeScript, n8n, Deepgram, and Google Gemini AI**
