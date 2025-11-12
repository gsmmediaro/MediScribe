# 🩺 MediScribe - Ghid Complet pentru Doctori

**Asistentul tău AI pentru documentație medicală rapidă în limba română**

---

## 📋 Cuprins

1. [De ce MediScribe?](#de-ce-mediscribe)
2. [Caracteristici Principale](#caracteristici-principale)
3. [Cum Folosesc MediScribe?](#cum-folosesc-mediscribe)
4. [Verificare Medicamente & Siguranță](#verificare-medicamente--siguranță)
5. [Istoric Pacienți](#istoric-pacienți)
6. [Scurtături Tastatură](#scurtături-tastatură)
7. [Sfaturi pentru Rezultate Optime](#sfaturi-pentru-rezultate-optime)
8. [Confidențialitate & Securitate](#confidențialitate--securitate)
9. [Întrebări Frecvente](#întrebări-frecvente)
10. [Suport Tehnic](#suport-tehnic)

---

## 🎯 De ce MediScribe?

### Problemele pe care le rezolvă

- ❌ **Ore întregi** petrecute scriind rapoarte după consultații
- ❌ **Oboseală** și risc de erori la sfârșitul zilei
- ❌ **Documentație incompletă** sau neclară
- ❌ **Verificare manuală** a interacțiunilor medicamentoase
- ❌ **Coduri ICD-10** dificil de reținut

### Soluția MediScribe

- ✅ **2-3 minute** pentru raport SOAP complet
- ✅ **Transcriere automată** cu separare doctor-pacient
- ✅ **Verificare automată** a interacțiunilor medicamentoase
- ✅ **Sugestii automate** de coduri ICD-10
- ✅ **Istoric complet** al consultațiilor
- ✅ **100% în limba română** cu diacritice corecte

---

## ⭐ Caracteristici Principale

### 1. 🎙️ Transcr ierea Inteligentă

- **Înregistrare LIVE** direct din browser
- **Încărcare fișiere** audio (WAV, MP3, WebM, OGG, M4A)
- **Separare automată** vorbitori (doctor vs. pacient)
- **Limbă română nativă** cu recunoaștere Deepgram Whisper
- **Anulare zgomot** și eco pentru calitate maximă

### 2. 📝 Raport SOAP Automat

Generează instant raport structurat:

```
S (Subiectiv) - Simptomele pacientului
O (Obiectiv)  - Observațiile tale medicale
A (Analiza)   - Diagnostic și evaluare
P (Plan)      - Tratament și pași următori
```

### 3. 💊 Verificare Medicamente (RAG)

MediScribe verifică automat:

- ✅ **Nomenclatorul medicamentelor din România** (Supabase)
- ✅ **Coduri RxCUI** (RxNorm NIH)
- ✅ **Interacțiuni medicamentoase** între toate medicamentele prescrise
- ✅ **Alergii** menționate în conversație
- ✅ **Alerte medicale** în raportul final

**Tehnologie:** AI Agent cu RAG (Retrieval-Augmented Generation)

### 4. 🏥 Coduri ICD-10

- Sugestii automate bazate pe diagnostic
- Până la 3 coduri relevante per consultație
- Ușor de copiat în sistem DES/SIUI

### 5. 📋 Rețete Profesionale

- Template românesc cu toate detaliile
- Medicamente și dozaje extrase automat
- Loc pentru semnătură digitală
- Export PDF pentru tipărire

### 6. 🗂️ Istoric Pacienți

- **Salvare automată** a fiecărei consultații
- **Căutare rapidă** după nume, CNP, diagnostic
- **Export JSON** pentru backup
- **Până la 100 consultații** salvate local
- **Date în siguranță** - nu părăsesc browserul

---

## 🚀 Cum Folosesc MediScribe?

### Pași Simpli (2-3 minute)

#### 1. Pregătire (10 sec)
```
🔹 Deschide MediScribe în browser
🔹 Introdu numele pacientului (obligatoriu)
🔹 Introdu CNP-ul (opțional, dar recomandat)
```

#### 2. Înregistrare (durata consultației)

**Varianta A - Înregistrare LIVE:**
```
🔹 Apasă "Start Transcriere" (sau Ctrl+R)
🔹 Desfășoară consultația normal
🔹 Apasă "Stop & Procesează"
```

**Varianta B - Încarcă fișier:**
```
🔹 Apasă "Încarcă fișier" (sau Ctrl+U)
🔹 Selectează fișierul audio (max 50MB)
🔹 Așteaptă procesarea
```

#### 3. Procesare (30-60 sec)
```
⏳ Transcrierea Deepgram...
🤖 Analiza Gemini cu verificare medicamente...
📊 Generare raport SOAP...
```

#### 4. Revizie & Export (1-2 min)
```
📋 Verifică raportul SOAP
💊 Revizuiește rețetele și alertele
✏️ Editează dacă e necesar
🖨️ Tipărește sau salvează
```

### Exemplu Real

```
Pacient: Ion Popescu, CNP: 1900101123456
Durată consultație: 4 minute
Timp procesare: 45 secunde

Rezultat:
✅ Raport SOAP complet
✅ 2 medicamente prescrise
✅ 1 alertă: "Posibilă interacțiune între Aspirin și Ibuprofen"
✅ Cod ICD-10 sugerat: J06.9 (Infecție acută a tractului respirator superior)
✅ Salvat în istoric
```

---

## 💊 Verificare Medicamente & Siguranță

### Cum Funcționează?

MediScribe folosește un **AI Agent cu 3 unelte (Tools)**:

#### 1. search_nomenclator (Supabase)
- Caută medicamentul în **Nomenclatorul oficial din România**
- Extrage **DCI-ul** (substanța activă)
- Exemplu: "Paracetamol 500mg" → DCI = "Paracetamolum"

#### 2. get_rxcui (RxNorm)
- Obține codul **RxCUI standardizat** pentru substanța activă
- Exemplu: "Paracetamolum" → RxCUI = "161"

#### 3. verificare_interactiune (RxNorm)
- Verifică **interacțiunile** între TOATE medicamentele prescrise
- Primește: "161+5640+10582" (coduri pentru 3 medicamente)
- Returnează: Lista completă de interacțiuni

### Ce Alerte Primești?

```
⚠️ ALERTĂ: Interacțiune medicamentoasă detectată
   Aspirin (Acidum acetylsalicylicum) + Ibuprofen

   Descriere: Risc crescut de sângerare gastrointestinală.
   Mecanism: Ambele inhibă COX-1, efecte aditive.
   Severitate: Moderată
   Recomandare: Monitorizați pacientul pentru semne de sângerare.
```

### Limitări

⚠️ **RxNorm este o bază de date americană** - poate să nu conțină toate medicamentele românești.

**Soluție:** MediScribe folosește **Nomenclatorul românesc** pentru a găsi DCI-ul, apoi caută DCI-ul în RxNorm.

💡 **Recomandare:** Verifică manual alertele și folosește-le ca **ghid**, nu ca decizie finală.

---

## 🗂️ Istoric Pacienți

### Funcționalități

#### 📁 Salvare Automată
- Fiecare consultație procesată se salvează automat
- Până la 100 de consultații (cele mai recente)
- Salvare locală în browser (localStorage)

#### 🔍 Căutare Rapidă
Caută după:
- Nume pacient
- CNP
- Data consultației
- Diagnostic
- Cuvinte cheie din raport SOAP

#### 💾 Export & Backup
- Export JSON cu toate datele
- Backup înainte de ștergere
- Import în viitor (funcție planificată)

#### 🗑️ Ștergere
- Șterge consultații individuale
- Șterge tot istoricul odată
- Confirmare înainte de ștergere

### Cum Accesez Istoricul?

```
🖱️ Click pe butonul "Istoric" din header
⌨️ SAU apasă Ctrl+H

📋 Vezi lista de consultații
🔍 Caută pacient specific
🖱️ Click pe consultație pentru a vedea detalii complete
```

### Date Salvate per Consultație

```json
{
  "id": "unique-id",
  "patientName": "Ion Popescu",
  "patientCnp": "1900101123456",
  "date": "05.11.2025",
  "time": "14:30:15",
  "analysis": {
    "rezumat": "...",
    "raportSOAP": {...},
    "diagnosticePosibile": [...],
    "coduriICD10Sugerate": [...],
    "reteta": {...},
    "alerteMedicale": [...]
  },
  "transcription": "[DOCTOR]: ... [PACIENT]: ..."
}
```

---

## ⌨️ Scurtături Tastatură

### Navigare
- `Ctrl + H` - Deschide istoricul pacienților
- `Ctrl + K` - Afișează ghidul de scurtături
- `ESC` - Închide ferestrele modale

### Înregistrare
- `Ctrl + R` - Start/Stop înregistrare
- `Ctrl + U` - Încarcă fișier audio

### Rezultate
- `Ctrl + P` - Tipărește raportul
- `Ctrl + S` - Salvează în istoric (automat)
- `Ctrl + N` - Consultație nouă

💡 **Apasă `Ctrl+K` oricând** pentru a vedea lista completă de scurtături.

---

## 💡 Sfaturi pentru Rezultate Optime

### 🎤 Calitatea Audio

**DO:**
- ✅ Vorbește clar, cu voce normală
- ✅ Plasează microfonul la 30-50cm distanță
- ✅ Folosește cască cu microfon pentru claritate maximă
- ✅ Închide ușa pentru a reduce zgomotul extern

**DON'T:**
- ❌ Nu șopti sau vorbești prea încet
- ❌ Evită zgomotul de fond excesiv (aparate, ventilatoare)
- ❌ Nu acoperi microfonul cu mâna

### ⏱️ Durata Consultației

| Durata | Tip Consultație | Calitate SOAP |
|--------|----------------|---------------|
| < 1 min | Fragment | Incomplet, lipsesc secțiuni |
| 1-2 min | Scurtă | Parțial, diagnostic posibil incomplet |
| 2-5 min | Medie | Bun, majoritatea secțiunilor complete |
| 5-10 min | Completă | Foarte bun, toate detaliile |
| > 10 min | Detaliată | Excelent, documentație completă |

💡 **Recomandat:** Minimum 2-3 minute pentru raport SOAP util.

### 👥 Diarization (Separare Vorbitori)

Pentru cea mai bună separare doctor-pacient:

1. **Identifică-te la început:**
   ```
   "Bună ziua, sunt Dr. Popescu. Care este problema dumneavoastră?"
   ```

2. **Vorbește primul** (ești marcat automat ca "DOCTOR")

3. **Lasă pacientul să vorbească** (marcat ca "PACIENT")

4. **Evită vorbitul simultan** (confundă sistemul)

### 📝 Structura Consultației

Pentru raport SOAP complet, asigură-te că acoperi:

```
[PACIENT]
- Simptome (ce simte, de când, intensitate)
- Istoric medical relevant
- Medicamente curente
- Alergii

[DOCTOR]
- Examinare fizică (observații, măsurători)
- Diagnostic (evaluare, ipoteze)
- Plan de tratament (medicamente, doze, durată)
- Investigații necesare
- Control/follow-up
```

---

## 🔒 Confidențialitate & Securitate

### Date Personale

#### Ce se Salvează Local (în Browser)?
- ✅ Istoric consultații (localStorage)
- ✅ Preferințe utilizator
- ✅ Semnătura digitală (dacă este încărcată)

#### Ce se Trimite la Servere?
- 🔹 **Audio** → n8n → Deepgram (transcriere) → Google Gemini (analiză)
- 🔹 **Nume pacient & CNP** → n8n → Google Sheets (logging)
- 🔹 **Transcriere** → Google Gemini pentru SOAP

#### Ce NU se Salvează Permanent?
- ❌ Audio-ul (se șterge după transcriere)
- ❌ Date în cloud (doar logging în Google Sheets pentru monitorizare)

### GDPR Compliance

✅ **Date minimale** - doar ce e necesar pentru funcționare
✅ **Consimțământ** - pacientul trebuie informat
✅ **Drepturi** - datele din localStorage pot fi șterse oricând
✅ **Transparență** - acest ghid explică exact ce se întâmplă cu datele

### Recomandări

1. **Informează pacientul** că consultația este înregistrată
2. **Obține consimțământ verbal** (poate fi inclus în transcriere)
3. **Șterge datele** din istoric dacă pacientul solicită
4. **Export backup** periodic pentru siguranță

---

## ❓ Întrebări Frecvente

### General

**Î: Este MediScribe gratuit?**
R: Depinde de configurația ta. Trebuie să ai acces la n8n, Deepgram API și Google Gemini API. Costurile variază în funcție de utilizare.

**Î: Funcționează offline?**
R: Nu, necesită conexiune la internet pentru transcriere (Deepgram) și analiză (Gemini). Istoricul salvat poate fi văzut offline.

**Î: Pot folosi MediScribe pe telefon?**
R: Da, interfața este responsive și funcționează pe mobile, dar experiența e optimizată pentru desktop/laptop.

### Calitate & Precizie

**Î: Cât de precis este raportul SOAP?**
R: Acuratețea depinde de:
- Calitatea audio (mic clar = SOAP precis)
- Durata consultației (mai lungă = mai complete)
- Structura conversației (clar organizată = mai bună extracție)

**Recomandat:** Verifică ÎNTOTDEAUNA raportul înainte de a-l folosi.

**Î: Pot edita raportul generat?**
R: Da, toate secțiunile SOAP sunt editabile. Poți modifica orice text înainte de a tipări sau salva.

**Î: Ce fac dacă lipsesc informații din SOAP?**
R: Sistemul scrie `[INFORMAȚIE LIPSĂ]` unde nu găsește date în transcriere. Poți completa manual aceste secțiuni.

### Verificare Medicamente

**Î: Cât de sigură este verificarea interacțiunilor?**
R: MediScribe folosește RxNorm (NIH), o bază de date medicală recunoscută. ÎNSĂ:
- ⚠️ Nu include toate medicamentele românești
- ⚠️ Poate rata interacțiuni rare
- ⚠️ Este un **instrument auxiliar**, nu înlocuiește judecata ta medicală

**Î: Ce fac dacă primesc o alertă de interacțiune?**
R:
1. Citește descrierea interacțiunii
2. Evaluează severitatea
3. Decide dacă ajustezi tratamentul
4. Documentează decizia în raport

### Istoric & Date

**Î: Cât timp se păstrează istoricul?**
R: Istoric local: La infinit (până îl ștergi sau îți golești cache-ul browserului)
Google Sheets: Permanent (până ștergi manual)

**Î: Pot recupera consultații șterse?**
R: Nu din localStorage. Dacă ai export JSON, poți reimporta (funcție planificată).

**Î: Ce se întâmplă dacă schimb browserul?**
R: Istoricul local se pierde (este specific browser-ului). Recomandare: Export periodic.

### Probleme Tehnice

**Î: Primesc eroarea "Nu am putut accesa microfonul"**
R:
1. Verifică permisiunile browserului (Settings → Privacy → Microphone)
2. Permite acces pentru site-ul MediScribe
3. Verifică că microfonul este conectat și funcționează

**Î: Transcrierea este goală sau prea scurtă**
R:
- Verifică volumul microfonului
- Vorbește mai tare și mai clar
- Asigură-te că înregistrezi minimum 30 secunde
- Testează cu un fișier audio cunoscut

**Î: Raportul SOAP conține informații greșite**
R:
- Verifică transcrierea (tab "Transcriere")
- Dacă transcrierea e corectă dar SOAP-ul greșit, raporteaz ă dezvoltatorului
- Editează manual secțiunile incorecte

---

## 🆘 Suport Tehnic

### Raportare Probleme

**GitHub Issues:**
https://github.com/gsmmediaro/MediScribe/issues

**Informații necesare:**
- Descriere problemă
- Pași pentru reproducere
- Screenshot-uri (dacă e relevant)
- Browser și versiune
- Mesaje de eroare

### Actualizări

MediScribe este în dezvoltare activă. Verifică periodic pentru:
- 🐛 Bug fixes
- ✨ Funcționalități noi
- 📚 Documentație îmbunătățită
- 🔒 Patch-uri de securitate

### Contribuții

Ești programator? Contribuie la MediScribe:
- Fork repository-ul
- Citește CONTRIBUTING.md
- Trimite Pull Request
- Alătură-te comunității de developeri medicali

---

## 🎓 Resurse Adiționale

### Documentație Tehnică
- `README.md` - Setup general
- `N8N_SETUP.md` - Configurare backend n8n
- `CONTRIBUTING.md` - Ghid pentru dezvoltatori

### API-uri Folosite
- **Deepgram Whisper** - Transcriere audio
- **Google Gemini 2.5 Flash** - Analiză AI
- **RxNorm (NIH)** - Verificare interacțiuni
- **Supabase** - Nomenclator medicamente România

---

## 📞 Contact

**Echipa MediScribe**
- Email: gsmmediaro@gmail.com
- GitHub: https://github.com/gsmmediaro/MediScribe

---

## 📄 Licență

Copyright © 2025 MediScribe
Toate drepturile rezervate.

---

**Mulțumim că folosești MediScribe! Împreună facem medicina mai eficientă. 🩺**

---

*Ultima actualizare: 5 Noiembrie 2025*
*Versiune: 2.0 (Enhanced for Doctors)*
