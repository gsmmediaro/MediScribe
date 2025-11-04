# ⚡ MediScribe Quick Start Guide

Get MediScribe running in **5 minutes**!

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] n8n account ([Sign up](https://n8n.io/))
- [ ] Deepgram API key ([Get free key](https://deepgram.com/))
- [ ] Google Gemini API key ([Get free key](https://ai.google.dev/))
- [ ] Google account for Sheets

## 🚀 5-Minute Setup

### Step 1: Clone & Install (1 minute)

```bash
# Clone the repository
git clone https://github.com/gsmmediaro/MediScribe.git
cd MediScribe

# Install dependencies
npm install
```

### Step 2: Set Up Environment (30 seconds)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Add your n8n webhook URL:
```env
VITE_N8N_WEBHOOK_URL=https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/medical-assistant
```

**Don't have the URL yet?** Continue to Step 3 first, then come back.

### Step 3: Import n8n Workflow (2 minutes)

1. **Open n8n** → Go to your n8n instance
2. **Import workflow:**
   - Click **Workflows** → **Import from File**
   - Select `n8n-workflow.json` from the MediScribe folder
   - Workflow will be imported with all nodes

3. **Configure credentials** (click each node and add credentials):

   **A. Deepgram:**
   - Node: "Deepgram"
   - Type: HTTP Header Auth
   - Name: `Authorization`
   - Value: `Token YOUR_DEEPGRAM_KEY`

   **B. Google Gemini:**
   - Node: "Generate SOAP with Gemini"
   - Type: Google PaLM API
   - API Key: `YOUR_GEMINI_KEY`

   **C. Google Sheets:**
   - Node: "Log to Google Sheets"
   - Type: OAuth2
   - Follow OAuth flow to connect your Google account

4. **Get Webhook URL:**
   - Click "Webhook Trigger1" node
   - Copy the **Production URL**
   - Should look like: `https://shadow424.app.n8n.cloud/webhook/medical-assistant`

5. **Update .env:**
   - Paste the webhook URL into your `.env` file
   - Save the file

6. **Activate workflow:**
   - Toggle the **Active** switch (top-right)
   - Workflow is now live! ✅

### Step 4: Set Up Google Sheets (1 minute)

1. **Create new Google Sheet** or use existing
2. **Add column headers** (copy-paste this entire line):
   ```
   timestamp	data_consultatie	ora_consultatie	nume_pacient	cnp_pacient	soap_subiectiv	soap_obiectiv	soap_evaluare	soap_plan	retete	numar_retete	rezumat_pacient	transcriere_lungime	transcriere_cuvinte	tip_consultatie	completitudine	calitate_score	calitate_label
   ```
3. **Get Sheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
4. **Update n8n:**
   - Go back to n8n
   - Click "Log to Google Sheets" node
   - Select your sheet from dropdown
   - Save

### Step 5: Run the App (30 seconds)

```bash
npm run dev
```

Open browser to: **http://localhost:3000**

---

## ✅ Test It!

### Quick Test (2 minutes)

1. **Enter patient data:**
   - Name: `Popescu Ion`
   - CNP: `1900101123456` (or leave empty)

2. **Record audio or upload file:**
   - Click **Start Transcriere** to record
   - Or click **Încarcă fișier** to upload

3. **Wait for processing:**
   - You'll see: 📤 → 🎧 → 🤖
   - Takes 10-30 seconds

4. **View results:**
   - SOAP report appears
   - Check all tabs (Rezumat, Raport SOAP, etc.)
   - Try editing and printing

5. **Verify in Google Sheets:**
   - Open your Google Sheet
   - New row should appear with consultation data

---

## 🐛 Common Issues

### "URL-ul n8n nu este configurat"

**Fix:** Check your `.env` file has the correct webhook URL

```bash
# Verify .env file exists
cat .env

# Should show:
VITE_N8N_WEBHOOK_URL=https://...
```

**Restart dev server** after editing .env:
```bash
# Press Ctrl+C to stop
# Then run again:
npm run dev
```

### "Eroare de la serverul n8n (404)"

**Fix:** n8n workflow is not active

1. Open n8n
2. Open the workflow
3. Click **Active** toggle (should be ON/green)
4. Try again in MediScribe

### "Eroare de la serverul n8n (401/500)"

**Fix:** Missing or invalid credentials

1. Check Deepgram API key
2. Check Gemini API key
3. Check Google Sheets authorization
4. Re-test each node in n8n individually

### No microphone access

**Fix:** Grant browser permissions

1. Click 🔒 icon in address bar
2. Allow microphone
3. Reload page
4. Try recording again

### Speaker separation not working

**Fix:** Ensure diarization is enabled

1. Open n8n workflow
2. Click "Deepgram" node
3. Check query parameters include:
   ```
   diarize: true
   ```
4. Audio should have 2+ clear speakers

---

## 📚 Next Steps

Now that everything works:

1. **Read full documentation:**
   - [README.md](./README.md) - Complete guide
   - [N8N_SETUP.md](./N8N_SETUP.md) - n8n details
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - If you want to contribute

2. **Customize:**
   - Add your doctor's name in the app
   - Upload your signature for prescriptions
   - Adjust Google Sheets columns if needed

3. **Production:**
   - Build for production: `npm run build`
   - Deploy frontend (Vercel, Netlify, etc.)
   - Ensure n8n is on production plan
   - Upgrade Deepgram if needed

4. **Optional improvements:**
   - Add user authentication
   - Set up consultation history database
   - Add data export features
   - Implement dark mode toggle

---

## 🎉 You're Done!

Your MediScribe is now:
- ✅ Running locally
- ✅ Connected to n8n
- ✅ Transcribing with Deepgram
- ✅ Analyzing with Gemini
- ✅ Logging to Google Sheets
- ✅ Ready to use!

---

## 💡 Tips

### Best Practices

1. **Audio Quality:**
   - Use quiet room
   - Speak clearly
   - 30-60 seconds minimum for best results
   - Use external microphone if available

2. **Form Data:**
   - Always enter patient name (required)
   - CNP is optional but helps with records
   - Review generated SOAP before printing

3. **Workflow Monitoring:**
   - Check n8n **Executions** tab regularly
   - Monitor API usage (Deepgram, Gemini)
   - Keep Google Sheets organized

### Keyboard Shortcuts

- `Ctrl+C` - Stop dev server
- `Cmd+K` / `Ctrl+K` - Copy section (in results)
- `Cmd+P` / `Ctrl+P` - Print prescription

---

## 📞 Need Help?

1. **Check documentation** - Most answers are in README.md
2. **View n8n logs** - Executions tab shows detailed errors
3. **GitHub Issues** - Report bugs or ask questions
4. **Email support** - support@mediscribe.ro

---

## 🔄 Updating

To update MediScribe to the latest version:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart dev server
npm run dev
```

---

**Happy documenting! 🏥💙**

*Got it working in 5 minutes? ⭐ Star the repo on GitHub!*

