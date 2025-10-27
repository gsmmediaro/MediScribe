# MediScribe - n8n Backend Integration Guide

## 🎯 Prezentare Generală

Această aplicație combină **interfața Google AI Studio** cu **backend-ul n8n workflow** pentru procesarea consultațiilor medicale cu funcționalități avansate.

### Arhitectura Hibridă

```
┌─────────────────────────────────────────┐
│  FRONTEND (Google AI Studio UI)         │
│  - React + TypeScript + Vite            │
│  - Live transcription (Gemini)          │
│  - Enhanced metadata display            │
└──────────────┬──────────────────────────┘
               │
               ├─ Real-time: Gemini Live API
               │  (pentru feedback instant)
               │
               └─ Final Analysis: n8n Webhook
                  (pentru quality + storage)
                  │
                  ▼
┌─────────────────────────────────────────┐
│      n8n BACKEND WORKFLOW               │
│  1. Deepgram → Real voice diarization   │
│  2. Validation → Quality scoring        │
│  3. Gemini → SOAP generation            │
│  4. MongoDB → Persistent storage        │
│  5. Email → Doctor notifications        │
└─────────────────────────────────────────┘
```

---

## ✨ Ce Aduce n8n în Plus față de Google AI Studio

| Feature | Google AI Studio (original) | n8n Integration (nou) |
|---------|----------------------------|----------------------|
| **Live Transcription** | ✅ Gemini streaming real-time | ✅ Păstrat pentru UX |
| **Speaker Diarization** | ❌ Keywords-based (simplu) | ✅ **Deepgram voice recognition** |
| **Quality Scoring** | ❌ Lipsește | ✅ **Score 0-100 + label** |
| **Medical Terms Detection** | ❌ Lipsește | ✅ **25+ Romanian medical keywords** |
| **Consultation Type** | ❌ Lipsește | ✅ **Fragment/Scurtă/Medie/Completă/Detaliată** |
| **Validation & Warnings** | ❌ Lipsește | ✅ **Smart validation cu feedback** |
| **Data Persistence** | ❌ Lipsește | ✅ **MongoDB cu istoric complet** |
| **Email Notifications** | ❌ Lipsește | ✅ **Alertă automată doctori** |
| **Prescription Extraction** | ✅ Basic | ✅ **Detailed (doza, frecvență, durată)** |
| **Medical Alerts** | ❌ Lipsește | ✅ **Alerte bazate pe simptome** |

---

## 🚀 Setup Rapid

### Pasul 1: Instalare Dependințe

```bash
npm install
```

### Pasul 2: Configurare Environment Variables

Copiază `.env.example` în `.env`:

```bash
cp .env.example .env
```

Editează `.env` și adaugă:

```env
# Google Gemini API Key (pentru live transcription)
API_KEY=your_gemini_api_key_here

# n8n Webhook URL (pentru backend processing)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/mediscribe-consultation
```

### Pasul 3: Pornește Aplicația

```bash
npm run dev
```

Aplicația va rula pe `http://localhost:3000`.

---

## 🔧 Configurare n8n Workflow

### Cerințe n8n Workflow

Workflow-ul tău n8n trebuie să aibă:

1. **Webhook Node** (POST) care acceptă:
```json
{
  "audio": {
    "data": "base64_encoded_audio",
    "mimeType": "audio/webm",
    "size": 123456
  },
  "metadata": {
    "patient_id": "pat_123",
    "uploaded_at": "2025-10-27T10:00:00Z",
    "source": "mediscribe-frontend"
  }
}
```

2. **Deepgram Node** pentru transcription cu diarization

3. **JavaScript Node** pentru validation și quality scoring

4. **Gemini Node** pentru SOAP generation

5. **MongoDB Node** pentru storage

6. **Email Node** pentru notifications (opțional)

7. **Response Node** care returnează:
```json
{
  "success": true,
  "consultation_id": "cons_abc123",
  "status": "processed",
  "quality_score": 85,
  "soap_available": true,
  "message": "Consultația a fost procesată cu succes",
  "data": {
    "transcript": "Text complet...",
    "transcript_with_speakers": "[DOCTOR]: Text\n[PACIENT]: Text",
    "speaker_segments": [...],
    "transcription_metadata": {
      "quality_score": 85,
      "quality_label": "Excelent",
      "medical_terms_found": ["durere", "febr", "tratament"],
      "consultation_type": "completă",
      // ... alte metadata
    },
    "soap": {
      "subiectiv": "...",
      "obiectiv": "...",
      "evaluare": "...",
      "plan": "..."
    },
    "retete": [
      {
        "medicament": "Paracetamol",
        "doza": "500mg",
        "frecventa": "3x pe zi",
        "duratie": "7 zile",
        "instructiuni": "După mese"
      }
    ],
    "alerte": ["Febră > 38°C"],
    "rezumat_pacient": "Rezumat pentru pacient..."
  }
}
```

### Template n8n Workflow

Vezi documentația detaliată în descrierea inițială a workflow-ului n8n pentru configurația completă.

---

## 🎨 Componente UI Noi

### 1. MetadataView Component

Afișează metrici enhanced de la n8n:
- **Quality Score**: Progress bar cu culori (0-100)
- **Consultation Type**: Badge color-coded
- **Text Statistics**: Word count, sentence count, speaker count
- **Medical Terms**: Tags cu termeni detectați
- **Validation Status**: Is valid, has diarization, has medical context
- **Warnings**: Lista de avertizări

### 2. Enhanced AnalysisView

Adaugă:
- **Medical Alerts Banner**: Alerte roșii pentru situații critice
- **Detailed Prescriptions**: Format structurat cu doza/frecvență/durată
- **Metadata Integration**: Afișează toate datele enhanced de la n8n

---

## 🔀 Moduri de Funcționare

### Mod 1: Hibrid (Recomandat)

**Configurare în `config.ts`:**
```typescript
features: {
  useLiveTranscription: true,    // Gemini streaming pentru UX
  useN8nForAnalysis: true,       // n8n pentru analysis final
  showQualityMetrics: true,      // Afișează metadata
}
```

**Comportament:**
- 🎙️ **Durante recording**: Gemini live transcription → feedback instant în UI
- 🤖 **După stop**: Audio blob trimis la n8n → analysis complet cu metadata
- 💾 **Rezultat**: SOAP notes + quality score + MongoDB storage

**Avantaje:**
- ✅ User vede transcription în timp real (UX excelent)
- ✅ Backend robust cu n8n (quality scoring, storage, email)
- ✅ Best of both worlds

---

### Mod 2: n8n Only

**Configurare:**
```typescript
features: {
  useLiveTranscription: false,   // Nu folosi Gemini streaming
  useN8nForAnalysis: true,
  showQualityMetrics: true,
}
```

**Comportament:**
- Recording se face local
- La stop, tot audio-ul merge la n8n
- Transcription vine de la Deepgram (nu Gemini)
- Real voice diarization (mai precis)

**Avantaje:**
- ✅ Diarization reală pe voce (Deepgram)
- ✅ Mai puține API calls la Gemini
- ❌ User nu vede text în timp real

---

### Mod 3: Gemini Only (Fallback)

**Configurare:**
```typescript
features: {
  useLiveTranscription: true,
  useN8nForAnalysis: false,      // Fallback la Gemini direct
  showQualityMetrics: false,
}
```

**Comportament:**
- Tot workflow-ul original Google AI Studio
- Folosit doar dacă n8n nu este disponibil

---

## 📊 Metadata Disponibile în UI

Când `useN8nForAnalysis: true`, UI-ul afișează:

### Quality Metrics
```typescript
{
  quality_score: 85,              // 0-100
  quality_label: "Excelent",      // Slab/Acceptabil/Bun/Excelent
  consultation_type: "completă",  // fragment/scurtă/medie/completă/detaliată
  completeness_percent: 85        // 0-100%
}
```

### Text Statistics
```typescript
{
  char_count: 1234,
  word_count: 250,
  sentence_count: 15,
  speaker_count: 2
}
```

### Medical Context
```typescript
{
  medical_terms_found: ["durere", "febr", "diagnostice", "tratament"],
  medical_terms_count: 4,
  has_medical_context: true
}
```

### Validation
```typescript
{
  is_valid: true,
  is_complete_enough: true,
  has_diarization: true,
  warnings: ["Consultație completă - lungime bună"]
}
```

### Enhanced Prescriptions
```typescript
{
  prescriptions: [
    {
      medicament: "Paracetamol",
      doza: "500mg",
      frecventa: "3x pe zi",
      duratie: "7 zile",
      instructiuni: "După mese"
    }
  ]
}
```

### Medical Alerts
```typescript
{
  alerts: [
    "Febră > 38°C detectată",
    "Hipertensiune menționată",
    "Alergie la Penicilină"
  ]
}
```

---

## 🧪 Testing

### Test cu Mock Data

Dacă n8n nu este configurat, aplicația va folosi Gemini direct (fallback).

### Test cu n8n Local

1. Pornește n8n local:
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

2. Importă workflow-ul MediScribe în n8n

3. Setează în `.env`:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/mediscribe-consultation
```

4. Testează aplicația

---

## 🐛 Debugging

### Check n8n Connection

```javascript
import { checkN8nHealth } from './services/n8nService';

const isHealthy = await checkN8nHealth();
console.log('n8n available:', isHealthy);
```

### Log Audio Blob

În `App.tsx`, după recording:
```typescript
console.log('Audio blob size:', audioBlob.size);
console.log('Audio mime type:', audioBlob.type);
```

### n8n Response Errors

Verifică în browser console dacă răspunsul de la n8n este valid:
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 📦 Build pentru Production

```bash
npm run build
```

Asigură-te că:
1. `N8N_WEBHOOK_URL` este setat la production URL
2. n8n workflow-ul este deployed și accessible
3. CORS este configurat corect pe n8n webhook

---

## 🔐 Security Considerations

### Environment Variables
- ❌ **Nu include API keys în cod**
- ✅ Folosește `.env` și `.env.example`
- ✅ Adaugă `.env` în `.gitignore`

### n8n Webhook Security
- Configurează **Basic Auth** pe webhook în n8n
- Folosește **HTTPS** pentru production
- Activează **Rate Limiting** în n8n

### Audio Data
- Audio blob-urile sunt trimise ca **base64** la n8n
- Asigură-te că n8n este hosted pe **server securizat**
- Consideră **encryption** pentru audio medical sensitive

---

## 🤝 Recomandări

### Ce să păstrezi din Google AI Studio:
✅ **Live transcription** - UX excelent pentru feedback real-time
✅ **Interfața UI** - arată profesional și e user-friendly
✅ **React + TypeScript stack** - modern și performant

### Ce să înlocuiești cu n8n:
✅ **Transcription final** - Deepgram oferă diarization reală pe voce
✅ **SOAP generation** - n8n workflow oferă mai multă flexibilitate
✅ **Storage** - MongoDB prin n8n pentru persistență
✅ **Notifications** - Email automat la doctori

---

## 📚 Structura Proiectului

```
MediScribe/
├── services/
│   ├── geminiService.ts      # Live transcription (păstrat)
│   └── n8nService.ts          # n8n integration (nou)
├── components/
│   ├── MetadataView.tsx       # Quality metrics display (nou)
│   ├── AnalysisView.tsx       # Enhanced cu n8n data
│   ├── TranscriptionView.tsx
│   ├── Controls.tsx
│   └── Header.tsx
├── types.ts                   # Enhanced cu n8n types
├── config.ts                  # Feature flags și configurare
├── App.tsx                    # Main app cu hybrid approach
├── .env.example               # Template pentru env vars
└── README_N8N_INTEGRATION.md # Această documentație
```

---

## 🎓 Resurse Suplimentare

- **n8n Documentation**: https://docs.n8n.io/
- **Deepgram API**: https://developers.deepgram.com/
- **Google Gemini API**: https://ai.google.dev/
- **MongoDB**: https://www.mongodb.com/docs/

---

## 📞 Support

Pentru probleme sau întrebări:
1. Verifică logs în browser console
2. Verifică n8n workflow execution logs
3. Testează n8n webhook cu cURL:

```bash
curl -X POST https://your-n8n-instance.com/webhook/mediscribe-consultation \
  -H "Content-Type: application/json" \
  -d '{
    "audio": {
      "data": "base64_test",
      "mimeType": "audio/webm",
      "size": 1234
    },
    "metadata": {
      "patient_id": "test_123",
      "source": "test"
    }
  }'
```

---

**Versiune**: 1.0.0
**Ultima Actualizare**: Octombrie 2025
**Status**: ✅ Production Ready (cu n8n workflow configurat)
