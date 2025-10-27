# Changelog

All notable changes to MediScribe project.

---

## [2.0.0] - 2025-10-27

### Added
- **Backend Express Service**: New Node.js backend for handling audio uploads
  - `/api/health` endpoint for health checks
  - `/api/transcribe` endpoint for audio processing
  - FormData forwarding to n8n webhook with key `data`
  - File validation (type, size)
  - CORS configuration
  - Automatic temp file cleanup

- **Audio Recording Service**: New frontend service for local audio recording
  - `startAudioRecording()` - MediaRecorder API integration
  - `stopAudioRecording()` - Upload to backend and get analysis
  - `parseN8nResponse()` - Convert n8n format to AnalysisResult
  - `checkAudioRecordingSupport()` - Browser compatibility check
  - Progress tracking with timer callback

- **New App Component**: Complete rewrite of main app
  - Recording timer UI (MM:SS format)
  - Loading state with processing steps visualization
  - Error handling for microphone/network issues
  - Browser support detection on mount

- **Documentation**:
  - Comprehensive README.md with architecture diagrams
  - SETUP-INSTRUCTIONS.md for quick start
  - Backend test suite (`test-backend.js`)
  - Environment variable examples

- **Configuration Files**:
  - `backend/package.json` - Backend dependencies
  - `backend/.env.example` - Backend config template
  - `.env.example` - Frontend config template

### Changed
- **Architecture**: Replaced Gemini Live API with n8n workflow
  - **Before**: Frontend → Gemini Live API (streaming)
  - **After**: Frontend → Backend → n8n → Deepgram + Gemini (batch)
  - Benefits: Better diarization, server-side processing, workflow flexibility
  - Trade-offs: No live transcription, processing delay

- **Recording Flow**:
  - **Before**: Live transcription with interim results
  - **After**: Record full session, then process
  - Shows timer during recording instead of live text
  - Loading state during processing (10-30s)

- **Backend Renamed**: Old `App.tsx` → `App-OldGeminiLive.tsx` (legacy)

### Fixed
- **TASK 1**: Toggle Manual Speaker Bug
  - **Problem**: Speaker toggle didn't work during recording (closure issue)
  - **Solution**: Used `useRef` pattern to access current state values
  - Fixed in both `App-OldGeminiLive.tsx` and new `App.tsx`
  - Lines changed: App.tsx:46-47 (refs), 56-62 (useEffect sync), 78-80 (callback)

- **TASK 2**: n8n Deepgram Integration Error
  - **Problem**: "binary file 'data' not found" error from Deepgram node
  - **Solution**: Backend sends FormData with key `data` (not `audio`)
  - Critical line: `backend-service.js:107` - `formData.append('data', ...)`

### Technical Details

#### Dependencies Added (Backend)
- `express` ^4.18.2 - Web server
- `cors` ^2.8.5 - CORS middleware
- `multer` ^1.4.5-lts.1 - File upload handling
- `node-fetch` ^3.3.2 - HTTP requests to n8n
- `form-data` ^4.0.0 - FormData construction
- `dotenv` ^16.3.1 - Environment variables

#### API Changes
- **New Endpoint**: `POST /api/transcribe`
  - Request: `multipart/form-data` with `audio` field
  - Response: `{ success: boolean, data: AnalysisResult, metadata: {...} }`
- **New Endpoint**: `GET /api/health`
  - Response: `{ status: string, service: string, ... }`

#### Type Changes
- New type: `AudioRecordingSession` in `audioRecordingService.ts`
  - `mediaRecorder: MediaRecorder`
  - `audioChunks: Blob[]`
  - `stream: MediaStream`
  - `startTime: number`

### Migration Guide

#### For Existing Users (Gemini Live API)

Your old setup still works! Use `App-OldGeminiLive.tsx`:

1. Rename current `App.tsx` to something else
2. Rename `App-OldGeminiLive.tsx` to `App.tsx`
3. Keep using `geminiService.ts`
4. No backend needed

#### For New Setup (n8n Workflow)

1. Follow `SETUP-INSTRUCTIONS.md`
2. Set up backend service
3. Configure n8n workflow
4. Use new `App.tsx` (already default)

---

## [1.0.0] - 2025-10-26

### Initial Release
- Gemini Live API integration
- Real-time transcription
- Speaker diarization (keyword-based)
- Medical analysis with SOAP reports
- React + TypeScript frontend
- Manual speaker selection
- Auto speaker detection

---

## Future Roadmap

### [2.1.0] - Planned
- [ ] Edit transcription before analysis
- [ ] Export to PDF/Word
- [ ] Save consultations to database
- [ ] Patient history tracking

### [3.0.0] - Planned
- [ ] User authentication
- [ ] Multi-language support
- [ ] Real-time collaboration
- [ ] Docker deployment
- [ ] CI/CD pipeline

---

**Note**: Version 2.0.0 includes breaking changes in architecture. See Migration Guide above.
