# 🔧 n8n Workflow Setup Guide

This guide will help you set up the n8n workflow for MediScribe from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ An n8n instance (cloud or self-hosted)
- ✅ Deepgram API key ([Sign up here](https://deepgram.com/))
- ✅ Google Gemini API key ([Get it here](https://ai.google.dev/))
- ✅ Google account with access to Google Sheets

## 🚀 Quick Setup (Import Method)

### Step 1: Import Workflow

1. Open your n8n instance
2. Click on **Workflows** in the left sidebar
3. Click **Add Workflow** → **Import from File**
4. Select the `AGENT MEDICAL (3).json` file from the repository
5. The workflow will be imported with all nodes pre-configured

### Step 2: Configure Credentials

After importing, you need to configure the following credentials:

#### A. Deepgram API Key

1. Click on the **Deepgram** node (HTTP Request node)
2. Click on **Credential to connect with**
3. Create new **HTTP Header Auth** credential:
   - **Name**: Deepgram
   - **Header Name**: `Authorization`
   - **Value**: `Token YOUR_DEEPGRAM_API_KEY`
4. Click **Create**

#### B. Google Gemini API Key

1. Click on the **Generate SOAP with Gemini** node
2. Click on **Credential to connect with**
3. Create new **Google PaLM API** credential:
   - **Name**: Google Gemini
   - **API Key**: `YOUR_GEMINI_API_KEY`
4. Click **Create**

#### C. Google Sheets OAuth

1. Click on the **Log to Google Sheets** node
2. Click on **Credential to connect with**
3. Create new **Google Sheets OAuth2** credential:
   - Follow the OAuth flow to authorize n8n
   - Grant permissions to access Google Sheets
4. Complete the authorization

### Step 3: Configure Google Sheets

1. Create a new Google Sheet or use an existing one
2. Add these column headers in the first row:
   ```
   timestamp | data_consultatie | ora_consultatie | nume_pacient | cnp_pacient | 
   soap_subiectiv | soap_obiectiv | soap_evaluare | soap_plan | retete | 
   numar_retete | rezumat_pacient | transcriere_lungime | transcriere_cuvinte | 
   tip_consultatie | completitudine | calitate_score | calitate_label
   ```
3. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```
4. In n8n, click the **Log to Google Sheets** node
5. Under **Document**, select your sheet or paste the ID
6. Under **Sheet**, select the sheet name (usually "Sheet1")

### Step 4: Get Webhook URL

1. Click on the **Webhook Trigger1** node
2. Click **Test URL** or **Production URL** to get the webhook URL
3. Copy the URL (it will look like):
   ```
   https://your-instance.app.n8n.cloud/webhook/medical-assistant
   ```
4. Add this URL to your frontend `.env` file:
   ```env
   VITE_N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/medical-assistant
   ```

### Step 5: Activate Workflow

1. Click the **Active** toggle in the top-right corner
2. Your workflow is now live and ready to receive requests!

---

## 🔨 Manual Setup (From Scratch)

If you prefer to build the workflow manually, follow these steps:

### Node 1: Webhook Trigger

1. Add a **Webhook** node
2. Configure:
   - **HTTP Method**: POST
   - **Path**: `medical-assistant`
   - **Response Mode**: Using 'Respond to Webhook' Node
3. Save the node

### Node 2: Deepgram Transcription

1. Add an **HTTP Request** node (rename to "Deepgram")
2. Configure:
   - **Method**: POST
   - **URL**: `https://api.deepgram.com/v1/listen`
   - **Authentication**: HTTP Header Auth
     - Create credential with:
       - Header: `Authorization`
       - Value: `Token YOUR_DEEPGRAM_KEY`
   - **Query Parameters**: Add these parameters:
     ```
     model: whisper
     language: ro
     punctuate: true
     diarize: true
     smart_format: true
     utterances: true
     ```
   - **Send Body**: Yes
   - **Body Content Type**: Binary Data
   - **Input Data Field Name**: `data`
3. Connect: Webhook → Deepgram

### Node 3: Validate Transcription

1. Add a **Code** node (rename to "Validate Transcription")
2. Copy the JavaScript code from the imported workflow or from below
3. This node:
   - Extracts speaker-separated transcription
   - Validates quality
   - Calculates metadata
4. Connect: Deepgram → Validate Transcription

<details>
<summary>📄 View Validation Code</summary>

```javascript
// See lines 6-7 in AGENT MEDICAL (3).json
// The code is too long to include here, but it:
// - Extracts speaker diarization from Deepgram response
// - Formats text with [DOCTOR] and [PACIENT] labels
// - Calculates quality metrics
// - Validates transcription length
```
</details>

### Node 4: Generate SOAP with Gemini

1. Add a **Google Gemini** node (from LangChain nodes)
2. Configure:
   - **Model**: models/gemini-2.5-flash
   - **Credential**: Your Google Gemini API credential
   - **Message**: Add the prompt (see imported workflow line 28)
   - **JSON Output**: Enabled
   - **Temperature**: 0.3
3. The prompt instructs Gemini to:
   - Generate SOAP report structure
   - Extract patient symptoms (Subjective)
   - Extract doctor observations (Objective)
   - Extract diagnosis (Analysis)
   - Extract treatment plan (Plan)
   - Suggest ICD-10 codes
   - Identify medical alerts
4. Connect: Validate Transcription → Generate SOAP with Gemini

### Node 5: Prepare Data for Sheets

1. Add a **Code** node (rename to "Prepare Data for Sheets")
2. Copy the JavaScript code from the imported workflow
3. This node:
   - Parses Gemini JSON response
   - Formats data for Google Sheets
   - Combines patient data + analysis + metadata
4. Connect: Generate SOAP with Gemini → Prepare Data for Sheets

### Node 6: Log to Google Sheets

1. Add a **Google Sheets** node
2. Configure:
   - **Operation**: Append
   - **Document**: Select your Google Sheet
   - **Sheet**: Select the sheet name
   - **Columns**: Map all fields from "Prepare Data for Sheets" output
     - timestamp → `{{ $json.timestamp }}`
     - data_consultatie → `{{ $json.data_consultatie }}`
     - ... (see imported workflow for full mapping)
3. Connect: Prepare Data for Sheets → Log to Google Sheets

### Node 7: Respond to Webhook

1. Add a **Respond to Webhook** node
2. Configure:
   - **Respond With**: JSON
   - **Response Body**:
     ```javascript
     {{ { 
         analysis: JSON.parse($('Generate SOAP with Gemini').item.json.content.parts[0].text), 
         transcription: $('Validate Transcription').item.json.transcript_with_speakers 
        } 
     }}
     ```
3. Connect: Log to Google Sheets → Respond to Webhook

---

## 🧪 Testing the Workflow

### Test with n8n's Test Workflow

1. Click **Test Workflow** button
2. In another tab, go to your frontend app
3. Enter patient data and record/upload audio
4. Watch the workflow execute in real-time
5. Check each node's output for errors

### Test Webhook Directly (with cURL)

```bash
curl -X POST https://your-instance.app.n8n.cloud/webhook/medical-assistant \
  -F "data=@test-audio.wav" \
  -F "patient_name=Test Pacient" \
  -F "patient_cnp=1900101123456"
```

Expected response:
```json
{
  "analysis": {
    "rezumat": "...",
    "raportSOAP": { ... },
    "diagnosticePosibile": [ ... ],
    "coduriICD10Sugerate": [ ... ],
    "pasiUrmatori": [ ... ],
    "reteta": { ... },
    "alerteMedicale": [ ... ]
  },
  "transcription": "[DOCTOR]: ... [PACIENT]: ..."
}
```

---

## 🔍 Workflow Data Flow

```
┌─────────────────────┐
│ Frontend (Browser)  │
│ - Records audio     │
│ - Sends FormData    │
└──────────┬──────────┘
           │ POST /webhook/medical-assistant
           ▼
┌─────────────────────┐
│ 1. Webhook Trigger  │
│ - Receives audio    │
│ - patient_name      │
│ - patient_cnp       │
└──────────┬──────────┘
           │ Binary audio data
           ▼
┌─────────────────────┐
│ 2. Deepgram API     │
│ - Transcription     │
│ - Diarization       │
│ - Speaker labels    │
└──────────┬──────────┘
           │ JSON with words + speakers
           ▼
┌─────────────────────┐
│ 3. Validate Code    │
│ - Format speakers   │
│ - Quality metrics   │
│ - Metadata          │
└──────────┬──────────┘
           │ transcript_with_speakers
           ▼
┌─────────────────────┐
│ 4. Gemini AI        │
│ - Generate SOAP     │
│ - ICD-10 codes      │
│ - Medical alerts    │
└──────────┬──────────┘
           │ Structured JSON
           ▼
┌─────────────────────┐
│ 5. Prepare Data     │
│ - Parse JSON        │
│ - Format for Sheets │
└──────────┬──────────┘
           │ Formatted data
           ▼
┌─────────────────────┐
│ 6. Google Sheets    │
│ - Append row        │
│ - Log consultation  │
└──────────┬──────────┘
           │ Success
           ▼
┌─────────────────────┐
│ 7. Respond Webhook  │
│ - Return analysis   │
│ - Return transcript │
└──────────┬──────────┘
           │ JSON response
           ▼
┌─────────────────────┐
│ Frontend (Browser)  │
│ - Display results   │
│ - Show SOAP tabs    │
└─────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "Webhook not found"

**Cause**: Workflow is not active or webhook path is incorrect

**Solution**:
1. Ensure workflow is **Active** (toggle in top-right)
2. Check webhook path matches: `/webhook/medical-assistant`
3. Verify the full URL in your frontend `.env`

### Error: "401 Unauthorized" from Deepgram

**Cause**: Invalid or missing Deepgram API key

**Solution**:
1. Verify your Deepgram API key is correct
2. Check the key has not expired
3. Ensure format is: `Token YOUR_KEY` (with "Token " prefix)

### Error: "Speaker diarization not working"

**Cause**: Missing `diarize=true` parameter or audio quality

**Solution**:
1. Verify Deepgram node has `diarize: true` in query parameters
2. Ensure audio has at least 2 clear speakers
3. Check audio quality (no background noise)
4. Test with longer audio (>30 seconds)

### Error: "JSON parse error" in Gemini node

**Cause**: Gemini returned non-JSON response or incomplete JSON

**Solution**:
1. Check the prompt asks for "STRICT JSON format"
2. Verify `jsonOutput: true` is enabled in Gemini node
3. Add error handling in "Prepare Data for Sheets" code
4. Increase temperature to 0.3-0.5 for better formatting

### Error: "Google Sheets permission denied"

**Cause**: OAuth credential needs refresh or insufficient permissions

**Solution**:
1. Re-authorize Google Sheets OAuth credential
2. Ensure credential has "Read and write" permissions
3. Check the Sheet ID is correct
4. Verify sheet name matches exactly

### Workflow times out

**Cause**: Audio file too large or slow processing

**Solution**:
1. Limit audio files to 10 minutes or less
2. Use compressed audio formats (MP3, OGG)
3. Increase n8n timeout settings if self-hosted
4. Check Deepgram and Gemini API response times

---

## 📊 Monitoring & Logs

### View Execution History

1. Go to **Executions** in n8n sidebar
2. Click on any execution to see:
   - Input data
   - Output data for each node
   - Errors and warnings
   - Execution time

### Enable Debugging

1. Click on any node
2. Under **Settings**, enable **Always Output Data**
3. Re-run workflow to see all intermediate data

### Check API Quotas

- **Deepgram**: Check usage at [deepgram.com/console](https://console.deepgram.com/)
- **Gemini**: Check at [ai.google.dev/](https://ai.google.dev/)
- **Google Sheets**: Quota is per Google account

---

## 🔐 Security Best Practices

1. **Use production webhook URL** in production (not test URL)
2. **Add authentication** to webhook if publicly accessible
3. **Rotate API keys** regularly
4. **Restrict Google Sheets** access to specific users
5. **Enable HTTPS** for all connections
6. **Monitor execution logs** for suspicious activity
7. **Set up alerts** for failed executions

---

## 📞 Support

If you encounter issues:

1. Check **n8n Execution Logs** for detailed error messages
2. Review **Deepgram API logs** in Deepgram console
3. Test each node individually using **Execute Node**
4. Consult n8n documentation: [docs.n8n.io](https://docs.n8n.io/)
5. Open an issue on GitHub

---

**🎉 Congratulations!** Your n8n workflow is now configured and ready to power MediScribe!

