# 🏥 MediScribe - AI Medical Documentation Assistant

**MediScribe** is an intelligent medical assistant that transcribes doctor-patient consultations and automatically generates structured SOAP reports, prescriptions, and medical documentation using AI.

## ✨ Features

- 🎙️ **Live Audio Recording** - Record consultations directly from your browser
- 📁 **File Upload** - Upload pre-recorded audio files
- 👥 **Speaker Diarization** - Automatically separates doctor and patient speech
- 📋 **SOAP Report Generation** - Automated medical documentation following SOAP methodology
- 💊 **Prescription Generation** - Extracts and formats medication prescriptions
- 🏷️ **ICD-10 Code Suggestions** - AI-suggested diagnostic codes
- ⚠️ **Medical Alerts** - Identifies potential risks, allergies, and drug interactions
- 📊 **Google Sheets Integration** - Automatic logging of all consultations
- 🌙 **Dark Mode Support** - Built-in dark mode
- 📝 **Editable Reports** - Edit all generated content before printing
- 🖨️ **Print/PDF Export** - Print prescriptions with digital signature support

## 🏗️ Architecture

### Frontend Stack
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via CDN)

### Backend Stack (n8n Workflow)
1. **Webhook Trigger** - Receives audio + patient data
2. **Deepgram API** - Audio transcription with Whisper model + diarization
3. **Validation Node** - Analyzes transcription quality and metadata
4. **Google Gemini 2.5** - Generates structured SOAP reports
5. **Google Sheets** - Logs consultation data
6. **Response Node** - Returns analysis + transcription to frontend

### Data Flow
```
Browser → n8n Webhook → Deepgram Transcription → Validation →
Gemini Analysis → Google Sheets Logging → Response → Frontend Display
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **n8n** instance (cloud or self-hosted)
- **Deepgram API Key** ([Get it here](https://deepgram.com/))
- **Google Gemini API Key** ([Get it here](https://ai.google.dev/))
- **Google Sheets** with proper permissions

### 1. Clone the Repository

```bash
git clone https://github.com/gsmmediaro/MediScribe.git
cd MediScribe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your n8n webhook URL:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/medical-assistant
```

### 4. Set Up n8n Workflow

#### Option A: Import the Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Upload `n8n-workflow.json` from the repository
4. Configure credentials:
   - **Deepgram API** - Add your Deepgram API key
   - **Google Gemini API** - Add your Gemini API key
   - **Google Sheets OAuth** - Connect your Google account

#### Option B: Manual Setup

See the [n8n Workflow Setup Guide](#n8n-workflow-detailed-setup) below.

### 5. Configure Google Sheets

1. Create a new Google Sheet
2. Add the following columns in the first row:
   ```
   timestamp, data_consultatie, ora_consultatie, nume_pacient, cnp_pacient, 
   soap_subiectiv, soap_obiectiv, soap_evaluare, soap_plan, retete, 
   numar_retete, rezumat_pacient, transcriere_lungime, transcriere_cuvinte, 
   tip_consultatie, completitudine, calitate_score, calitate_label
   ```
3. Copy the Sheet ID from the URL
4. Update the Google Sheets node in n8n with your Sheet ID

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 7. Test the Application

1. Enter patient name (required) and CNP (optional)
2. Click **Start Transcriere** to record or **Încarcă fișier** to upload audio
3. Wait for processing (transcription + AI analysis)
4. Review and edit the generated SOAP report
5. Print or export as PDF

## 🔧 Configuration

### Frontend Configuration

Edit `.env` to configure:

```env
# n8n Webhook URL (REQUIRED)
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/medical-assistant

# Optional: Development port
VITE_PORT=3000
```

### n8n Workflow Configuration

#### Deepgram Settings (Node: "Deepgram")
- **Model**: `whisper` (Romanian support)
- **Language**: `ro` (Romanian)
- **Diarization**: `true` (speaker separation)
- **Punctuate**: `true`
- **Smart Format**: `true`

#### Gemini Settings (Node: "Generate SOAP with Gemini")
- **Model**: `gemini-2.5-flash`
- **Temperature**: `0.3` (consistent output)
- **JSON Output**: Enabled

## 📖 n8n Workflow Detailed Setup

### Node 1: Webhook Trigger
- **Path**: `/medical-assistant`
- **Method**: POST
- **Response Mode**: Using 'Respond to Webhook' Node

### Node 2: Deepgram (HTTP Request)
- **URL**: `https://api.deepgram.com/v1/listen`
- **Method**: POST
- **Authentication**: HTTP Header Auth
  - Header: `Authorization: Token YOUR_DEEPGRAM_KEY`
- **Query Parameters**:
  ```
  model=whisper
  language=ro
  punctuate=true
  diarize=true
  smart_format=true
  utterances=true
  ```
- **Body**: Binary data from webhook (`data` field)

### Node 3: Validate Transcription (Code)
- Extracts speaker-separated transcription
- Validates quality and completeness
- Calculates metadata (word count, speakers, etc.)
- Outputs: `transcript_with_speakers` format

### Node 4: Generate SOAP with Gemini
- **Model**: Google Gemini 2.5 Flash
- **Temperature**: 0.3
- **Output**: JSON structured SOAP report
- Extracts:
  - Subjective (patient symptoms)
  - Objective (doctor observations)
  - Analysis (diagnosis)
  - Plan (treatment)
  - Prescriptions
  - ICD-10 codes
  - Medical alerts

### Node 5: Prepare Data for Sheets (Code)
- Formats data for Google Sheets
- Parses Gemini JSON response
- Combines patient data + analysis + metadata

### Node 6: Log to Google Sheets
- Appends row to configured sheet
- Logs all consultation data for record-keeping

### Node 7: Respond to Webhook
- Returns JSON to frontend:
  ```json
  {
    "analysis": { /* SOAP report object */ },
    "transcription": "Speaker-separated text"
  }
  ```

## 🧪 Testing

### Test with Sample Audio

1. Record a short doctor-patient dialogue:
   - Doctor: "Bună ziua, care este problema dumneavoastră?"
   - Patient: "Am dureri de cap de 3 zile și febră."
   - Doctor: "Vă prescriu Paracetamol 500mg, câte 2 pastile la 8 ore."

2. Expected output:
   - Transcription with `[DOCTOR]` and `[PACIENT]` labels
   - SOAP report with all sections
   - Prescription with Paracetamol

### Validation Tests

- ✅ Empty patient name → Error message
- ✅ Invalid CNP format → Warning (if validation enabled)
- ✅ Audio file too short → Processing attempt with quality warning
- ✅ No microphone access → Error message

## 🐛 Troubleshooting

### "URL-ul n8n nu este configurat corect"
- Check your `.env` file has `VITE_N8N_WEBHOOK_URL` set
- Ensure the URL starts with `https://`
- Restart the dev server after changing `.env`

### "Eroare de la serverul n8n"
- Verify n8n workflow is active
- Check n8n logs for errors
- Verify all credentials are configured (Deepgram, Gemini, Google Sheets)

### No Speaker Separation
- Ensure Deepgram node has `diarize=true` parameter
- Check audio quality (2+ speakers should be clear)
- Review Deepgram logs

### Empty SOAP Sections "[INFORMAȚIE LIPSĂ]"
- Audio too short or unclear
- Consultation didn't include that section
- Review transcription quality in the "Transcriere" tab

### Microphone Not Working
- Grant browser microphone permissions
- Check system audio settings
- Try different browser (Chrome/Edge recommended)

## 📁 Project Structure

```
MediScribe/
├── components/
│   ├── AnalysisView.tsx    # Results display with tabs
│   ├── Controls.tsx         # Record/upload buttons
│   ├── Header.tsx           # App header
│   └── Icons.tsx            # SVG icon components
├── App.tsx                  # Main app component
├── types.ts                 # TypeScript type definitions
├── index.tsx                # App entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔐 Security Considerations

- **Never commit** your `.env` file
- Store API keys in n8n credentials, not in code
- Use HTTPS for n8n webhooks (required for production)
- Validate and sanitize all user inputs
- Consider GDPR compliance for patient data storage
- Use Google Sheets with restricted access
- Implement user authentication for production use

## 🚀 Production Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3 + CloudFront**
- **Any static hosting service**

### Environment Variables in Production

Set `VITE_N8N_WEBHOOK_URL` in your hosting platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables

### n8n Production Setup

1. Use n8n Cloud (recommended) or self-host
2. Enable webhook authentication if needed
3. Set up monitoring and logging
4. Configure rate limiting
5. Use production Deepgram plan (higher limits)

## 📊 Google Sheets Template

Your Google Sheet should have these columns:

| Column | Description |
|--------|-------------|
| timestamp | ISO timestamp |
| data_consultatie | Date (DD/MM/YYYY) |
| ora_consultatie | Time (HH:MM:SS) |
| nume_pacient | Patient name |
| cnp_pacient | Patient CNP |
| soap_subiectiv | Subjective (symptoms) |
| soap_obiectiv | Objective (examination) |
| soap_evaluare | Assessment (diagnosis) |
| soap_plan | Plan (treatment) |
| retete | Prescriptions |
| numar_retete | Number of medications |
| rezumat_pacient | Summary |
| transcriere_lungime | Transcription length |
| transcriere_cuvinte | Word count |
| tip_consultatie | Type (scurtă/medie/completă) |
| completitudine | Completeness % |
| calitate_score | Quality score |
| calitate_label | Quality label |

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Deepgram** - Audio transcription with Whisper
- **Google Gemini** - AI-powered medical analysis
- **n8n** - Workflow automation platform
- **Tailwind CSS** - Styling framework

## 📞 Support

For issues and questions:
- 📧 Email: support@mediscribe.ro
- 🐛 GitHub Issues: [Create an issue](https://github.com/gsmmediaro/MediScribe/issues)

---

**⚠️ Medical Disclaimer**: MediScribe is an AI-assisted documentation tool. All AI-generated content should be reviewed and verified by qualified medical professionals. This tool does not replace professional medical judgment.

**Built with ❤️ using n8n, Deepgram & Gemini AI**
