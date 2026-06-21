# MindMirror — AI-Powered Cognitive Health Monitoring

> "Your language remembers what your mind forgets."

MindMirror is an AI-powered early cognitive decline detection system using linguistic and acoustic biomarkers, secured by simulated Ethereum blockchain records. Built for **Bharat Academix CodeQuest** by **Team NovaRise** (Aditya S Sheregar).

The platform analyzes speech patterns using acoustic biomarkers and linguistic AI, stores anonymized results on a blockchain for tamper-proof longitudinal tracking, and returns a full emotional + cognitive assessment — all in the user's own language.

---

## 1. Problem Statement

Cognitive decline — including early-stage dementia, Alzheimer's disease, and stress-induced mental fatigue — affects hundreds of millions of people globally. The challenge is that:

- **Early detection is nearly impossible** without clinical-grade assessments, which are expensive, infrequent, and inaccessible in low-resource settings.
- **Patients have no longitudinal record** of their own cognitive patterns between doctor visits (months or years apart).
- **Language is the most natural biomarker** of brain health — the way we speak (speed, fluency, vocabulary richness, pauses, filler words) directly reflects cognitive state — yet this signal is completely untapped in consumer health.
- **Health data is siloed and owned by institutions.** Patients cannot share, monetize, or control their own cognitive data.
- **Multilingual populations are underserved.** Most cognitive health tools are English-only, excluding the majority of the world's population.

> **The gap:** There is no accessible, privacy-first, longitudinal cognitive monitoring tool that works in the user's own language.

---

## 2. Solution Overview

### Core Value Proposition

| For Users | For Researchers | For Clinicians |
|---|---|---|
| Daily cognitive snapshot via voice | Access to anonymized longitudinal data | Trend reports shared with patient consent |
| Emotion + risk monitoring | Marketplace to purchase aggregate datasets | Early warning signals over time |
| Own your data, earn from it | Verified institutional access control | Non-invasive screening supplement |
| Works in 8 languages | IPFS-ready data architecture | Blockchain-verified session records |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                             │
│                                                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐    │
│  │  Web Speech  │   │  Web Audio API  │   │ Speech Synthesis │    │
│  │     API      │   │  (AudioContext) │   │   (TTS Output)   │    │
│  └──────┬───────┘   └────────┬────────┘   └──────────────────┘    │
│         │ rawTranscript      │ acousticMetrics         ↑           │
│         └────────────────────┼────────────────┐        │           │
│                              │                │        │           │
│  ┌───────────────────────────▼────────────────▼──────────────────┐ │
│  │                    CheckIn.jsx (Page)                         │ │
│  │  handleRecordingComplete → POST /api/analyze                  │ │
│  │  useVoiceAssistant(assistantResponse, outputLanguage)         │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │                                      │
│  ┌───────────────────────────▼───────────────────────────────────┐ │
│  │              AppContext (Global State)                        │ │
│  │  sessions[] · mindTokenBalance · accessList · toasts[]        │ │
│  │  → persisted to localStorage                                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP (Vite proxy → port 3001)
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     Express.js Server (port 3001)                   │
│                                                                     │
│  POST /api/analyze                                                  │
│  ├─ Language Detection (4-tier pipeline)                            │
│  ├─ analyzeRawTranscript() → 5 biomarker scores + MindScore        │
│  ├─ detectEmotion() → emotion + confidence                          │
│  ├─ Acoustic metrics adjustment                                     │
│  ├─ Risk level classification                                       │
│  ├─ Localized resource lookup (8 languages)                         │
│  ├─ buildFormattedAssistantResponse()                               │
│  └─ Returns full analysis JSON                                      │
│                                                                     │
│  GET  /api/sessions         → 28 seeded historical sessions         │
│  GET  /api/tokens           → MIND token balance + history          │
│  POST /api/grant-access     → Simulated NFT access grant            │
│  POST /api/revoke-access    → Simulated access revocation           │
│  POST /api/conversation-followup → AI follow-up question           │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Single Check-In Session

```
User speaks
    ↓
SpeechRecognition API (lang: hi-IN / ta-IN / en-US / etc.)
    ↓
rawTranscript (exact, unmodified speech text)
    ↓ parallel
Web Audio API → acousticMetrics {avgVolume, volumeVariation,
                                  pitchVariation, pauseDuration,
                                  pauseFrequency, emotionalIntensity}
    ↓
POST /api/analyze {rawTranscript, acousticMetrics, speechLanguage, duration}
    ↓
[Server] Language Detection → detectedLang (hi / ta / te / en / ...)
    ↓
[Server] analyzeRawTranscript() → {scores, mindScore}
    ↓
[Server] Acoustic adjustment → refined scores
    ↓
[Server] detectEmotion() → {emotion, confidence}
    ↓
[Server] LOCALIZED_RESOURCES[detectedLang] → all localized outputs
    ↓
[Server] buildFormattedAssistantResponse() → assistantResponse
    ↓
Response JSON → client
    ↓
useVoiceAssistant(assistantResponse, outputLanguage)
    → SpeechSynthesisUtterance.lang = hi-IN / ta-IN / en-US / ...
    → getVoices() (async) → select native language voice
    → auto-play after 800ms delay
```

---

## 4. Features

### 4.1 Core User Features

#### Voice Check-In (Primary Flow)
- **One-tap recording**: Large central microphone button, minimal background distraction, and smooth wave visualizers. Tap mic → speak naturally for 30–60 seconds → stop.
- **Live real-time transcript**: Speech-to-text displayed exactly as the user speaks. No server-side refinement, translation, or correction is done to this display transcript.
- **Language auto-detection**: Fully automatic language detection. The user never needs to select a language.
- **Supported languages**: English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Spanish (Español), French (Français).
- **Acoustic capture**: Real-time volume, pitch variance, pause frequency, and emotional intensity measured via the client-side Web Audio API.

#### Analysis Results Dashboard
Results are presented clearly in the following hierarchy:
1. **What You Said** — Raw, unmodified speech recognition transcript in the user's spoken language.
2. **Emotional Snapshot** — Detected emotion (Happy / Calm / Stressed / Anxious / Sad / Excited / Motivated / Lonely / Angry / Neutral) with confidence score.
3. **AI Voice Response** — Localized voice response synthesized and auto-played in the matching detected language.
4. **What This Means** — Plain-language cognitive assessment summary.
5. **Suggested Actions** — Personalized and localized actionable recommendations.
6. **Trend Insights** — Visual comparison against previous sessions.
7. **Risk Status** — 4-tier risk classification (Low Concern / Monitor / Elevated Concern / High Concern) represented by visual status dots.
8. **Conversation Summary** — Contextual summary of the check-in content.
9. **Detailed Analysis** (Expandable) — Access to all 5 cognitive biomarker scores, detailed acoustic metrics, and the associated blockchain TX hashes.

#### MindScore™
A composite index (0–100) representing overall cognitive clarity:
$$\text{MindScore} = \text{average}(\text{wordFindingSpeed}, \text{vocabularyDiversity}, \text{sentenceComplexity}, \text{semanticCoherence}, \text{phonemicFluency})$$

#### Cognitive Biomarkers (5 dimensions)

| Biomarker | Signal Measured | Algorithm |
|---|---|---|
| **Word Finding Speed** | Filler words, pauses before nouns | `95 - (fillers × 4) - (repetitions × 5) - (pauses × 1.5)` |
| **Vocabulary Diversity** | Type-Token Ratio (unique words / total words) | `TTR × 120 + 20`, clamped [30–98] |
| **Sentence Complexity** | Average clause depth + subordinating conjunctions | `(avgSentLen × 2) + (conjunctions × 5) + 40 - (fragments × 3)` |
| **Semantic Coherence** | Topic consistency, referential clarity | TTR-adjusted coherence baseline |
| **Phonemic Fluency** | Self-corrections, speaking rate deviation from 130 WPM | `95 - (corrections × 6) - (repetitions × 4) - WPM_penalty` |

### 4.2 Dashboard & Analytics
- **28-day MindScore™ trend chart** (using Recharts AreaChart)
- **Biomarker Radar Chart** comparing the 5 cognitive dimensions
- **Session History Table** displaying details and blockchain transaction hashes
- **7-day & 30-day rolling averages** with check-in streak tracking
- **Per-session drill-down** capability

### 4.3 Wallet & Token Economy (MIND Token)
- **Simulated Wallet**: Simulated Ethereum Sepolia wallet (pre-configured addresses).
- **Earning Mechanism**: Earn **50 MIND** per check-in, streak bonuses (+100–200 MIND), and marketplace data sharing (+150–800 MIND).
- **Data Marketplace**: Users can choose to grant or revoke research data access requested by institutions (e.g., Stanford, AIIMS, Novartis) in exchange for MIND tokens.
- **Access Management**: Control who has read permissions to your historical data reports.

### 4.4 Privacy & Access Control
- **No audio storage**: Raw audio is parsed for acoustic metrics locally and discarded; only the text transcript and numeric scores are processed.
- **Hashed On-Chain Registry**: Access control is logged on the simulated blockchain mimicking NFT mints and burns.

### 4.5 Multilingual Intelligence
- **8 UI translation catalogs** (handled via React Context i18n).
- **Native script display** (Devanagari, Tamil, Telugu, Kannada, Malayalam, etc.).
- **Voice synthesis matching** (Hindi voices for Hindi transcripts, etc.).

---

## 5. Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v3
- **State**: React Context API (AppContext & I18nContext)
- **Storage**: localStorage
- **Speech Input**: Web Speech API (`SpeechRecognition`)
- **Audio Analysis**: Web Audio API (`AudioContext`, `AnalyserNode`)
- **Voice Output**: Web Speech Synthesis API (`SpeechSynthesisUtterance`)
- **Canvas Rendering**: HTML5 Canvas API (Neural mesh background animation)

### Backend
- **Runtime**: Node.js v23+
- **Framework**: Express.js
- **Environment**: ESM/CJS JavaScript, hot reload with `node --watch`
- **Default Port**: 3001

---

## 6. API Reference

All backend APIs are served by default from `http://localhost:3001`.

### `POST /api/analyze`
Submits a voice session transcript and acoustic metrics to generate a localized cognitive and emotional analysis.

**Request Body:**
```json
{
  "sessionId": "session-1750123456789",
  "duration": 47,
  "prompt": "Talk about anything for 30–60 seconds.",
  "rawTranscript": "आज मैं बहुत खुश हूँ क्योंकि...",
  "avgConfidence": 92,
  "acousticMetrics": {
    "avgVolume": 0.14,
    "volumeVariation": 0.05,
    "pitchVariation": 38,
    "pauseDuration": 3.2,
    "pauseFrequency": 4.1,
    "emotionalIntensity": 52
  },
  "speechLanguage": "hi-IN",
  "aiReplyOption": "speech",
  "uiLang": "hi"
}
```

**Response Body (abbreviated):**
```json
{
  "sessionId": "session-1750123456789",
  "mindScore": 76.4,
  "trend": 2.1,
  "scores": {
    "wordFindingSpeed": 82,
    "vocabularyDiversity": 74,
    "sentenceComplexity": 71,
    "semanticCoherence": 83,
    "phonemicFluency": 76
  },
  "biomarkerDetails": {
    "wordFindingSpeed": { "status": "Excellent", "explanation": "..." }
  },
  "emotion": "Happy",
  "emotionConfidence": 88,
  "emotionExplanation": "आप आज सकारात्मक और ऊर्जावान लग रहे हैं...",
  "summary": "आपने इस सत्र में...",
  "whatThisMeans": "आपके संज्ञानात्मक संकेतक आज...",
  "assistantResponse": "आप आज खुश लग रहे हैं। ...",
  "actions": ["...", "..."],
  "trendInsights": ["..."],
  "moodTrend": [{ "session": "Session 22", "mood": "Happy" }],
  "risk": {
    "level": "Low Concern",
    "color": "green",
    "dot": "🟢",
    "label": "🟢 कम चिंता",
    "explanation": "..."
  },
  "acousticMetrics": {
    "avgVolume": 0.14,
    "volumeVariation": 0.05,
    "pitchVariation": 38,
    "pauseDuration": 3.2,
    "pauseFrequency": 4.1,
    "emotionalIntensity": 52
  },
  "transcript": "आज मैं बहुत खुश हूँ क्योंकि...",
  "rawTranscript": "आज मैं बहुत खुश हूँ क्योंकि...",
  "transcriptConfidence": 92,
  "detectedLanguage": "hi",
  "outputLanguage": "hi",
  "txHash": "0x7f3a9c2d...",
  "blockNumber": 19847341,
  "gasUsed": 22148,
  "network": "Ethereum Sepolia",
  "contract": "CognitiveVault.sol",
  "timestamp": "2026-06-22T00:00:00.000Z"
}
```

### `GET /api/sessions`
Retrieves a list of historical check-in sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-1",
      "mindScore": 84.2,
      "scores": {
        "wordFindingSpeed": 88,
        "vocabularyDiversity": 82,
        "sentenceComplexity": 80,
        "semanticCoherence": 89,
        "phonemicFluency": 82
      },
      "txHash": "0x...",
      "date": "2026-06-21T18:00:00.000Z"
    }
  ],
  "total": 28,
  "currentMindScore": 71.3,
  "trend30Day": -4.2,
  "streak": 12
}
```

### `GET /api/tokens`
Retrieves mock MIND token balance and earning history.

**Response:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "ethBalance": "0.0847",
  "mindBalance": 1240,
  "earningHistory": [
    {
      "date": "2026-06-22",
      "activity": "Daily check-in #28",
      "mindEarned": 50,
      "status": "Confirmed",
      "txHash": "0x..."
    }
  ]
}
```

### `POST /api/grant-access`
Simulates minting a data access NFT for a requesting clinician/institution.

**Request:**
```json
{
  "name": "Dr. Meera Nair",
  "role": "Neurologist"
}
```

**Response:**
```json
{
  "success": true,
  "accessId": "access-175012345",
  "nftTokenId": 4821,
  "txHash": "0x...",
  "grantedAt": "2026-06-22T00:00:00.000Z"
}
```

### `POST /api/revoke-access`
Revokes access permissions, burning the mock access NFT.

**Request:**
```json
{
  "accessId": "access-175012345"
}
```

**Response:**
```json
{
  "success": true,
  "accessId": "access-175012345",
  "txHash": "0x...",
  "revokedAt": "2026-06-22T00:00:00.000Z"
}
```

### `POST /api/conversation-followup`
Generates a contextual follow-up question based on the user's transcript in their detected language.

**Request:**
```json
{
  "transcript": "आज मैं बहुत खुश हूँ...",
  "speechLanguage": "hi-IN"
}
```

**Response:**
```json
{
  "followUpQuestion": "यह जानकर बहुत खुशी हुई। आज आपकी खुशी का मुख्य कारण क्या रहा?"
}
```

---

## 7. AI & ML Pipeline Details

MindMirror uses client-side audio analysis combined with statistical NLP matching algorithms in the Node.js backend.

### 7.1 Language Detection Pipeline (4-Tier)
1. **Unicode Script Detection**: Inspects characters to map native scripts directly:
   - Devanagari `[\u0900–\u097F]` $\rightarrow$ `hi` (Hindi)
   - Tamil `[\u0B80–\u0BFF]` $\rightarrow$ `ta` (Tamil)
   - Telugu `[\u0C00–\u0C7F]` $\rightarrow$ `te` (Telugu)
   - Kannada `[\u0C80–\u0CFF]` $\rightarrow$ `kn` (Kannada)
   - Malayalam `[\u0D00–\u0D7F]` $\rightarrow$ `ml` (Malayalam)
2. **BCP-47 Tag Priority**: Checks browser-reported `SpeechRecognition.lang` tag (e.g. `hi-IN` $\rightarrow$ `hi`).
3. **Romanized Script Matching**: Scans English text for common transliterated words.
   - Hindi words: `['main', 'aaj', 'mujhe', 'hoon', 'hai', 'kya', ...]`
   - Tamil words: `['naan', 'ennakku', 'romba', 'illa', ...]`
   - Telugu words: `['nenu', 'meeru', 'chala', 'undi', ...]`
4. **Fallback**: Default to English (`en`).

### 7.2 Cognitive Biomarker Analysis (`analyzeRawTranscript`)
- **Speaking Rate (WPM)**: Clamped rating relative to standard 130 words per minute.
- **Filler Recognition**: Detects fillers using localized regex rules (`um`, `uh`, `hmm`, `well`, etc.).
- **Pause & Repeat Flags**: Extracts pauses (`...`, punctuation groupings) and repetitive phrase patterns.

### 7.3 Emotion Detection (`detectEmotion`)
Identifies emotions using a composite classifier evaluating:
- **Acoustics**: Volume variation, pitch variation, pause frequencies.
- **Keywords**: Emotional keyword weight matching across 10 defined categories.
- **MindScore Context**: Modulates confidence levels based on cognitive indices.

### 7.4 Acoustic Biomarker Capture (Client-Side)
- **`avgVolume`**: Evaluated as Root Mean Square (RMS) amplitude.
- **`pitchVariation`**: Extracted via Fast Fourier Transform (FFT) dominant frequency variance.
- **`pauseDuration`**: Accumulated periods where RMS amplitude falls below `0.01`.

### 7.5 Voice Assistant TTS Matching
Ensures voice outputs match the spoken language:
- Map ISO-639 language codes to country locales (e.g. `hi` $\rightarrow$ `hi-IN`).
- Asynchronously queries `speechSynthesis.getVoices()` to load localized voices.
- Exclude English voices when speaking Indian languages.

---

## 8. Simulated Blockchain Details

The app simulates blockchain interactions using realistic Ethereum metrics:
- **Transaction Hashes**: Generates unique `0x` hex hashes.
- **Block Numbers**: Increments sequentially from a mock base block number (`19847293`).
- **Gas Usage**: Varies from `21000` to `23000` gas units per NFT registration.

---

## 9. Database & Storage Architecture

Currently runs a stateless Node backend + client-side persistent storage.

### localStorage Keys
- `mm_sessions`: Stores list of session logs.
- `mm_wallet`: Stores mock wallet connection data.
- `mm_access_list`: Stores sharing consent records.
- `mm_lang`: User's UI language configuration.

---

## 10. Future Roadmap

### Phase 1 — Foundation (Current)
- ✅ Voice check-in with real-time transcript
- ✅ 5 cognitive biomarker analysis
- ✅ Emotion detection (10 emotions)
- ✅ 8-language support (UI + analysis + voice)
- ✅ MindScore™ trend tracking
- ✅ Simulated blockchain records
- ✅ MIND token wallet
- ✅ Data access marketplace (UI)

### Phase 2 — Real Integrations (Q3 2026)
- 🔲 **Ethereum Sepolia deployment** of `CognitiveVault.sol` and `AccessNFT.sol` smart contracts
- 🔲 **MetaMask / WalletConnect** integration for real wallet signing
- 🔲 **IPFS/Filecoin** storage of biomarker score hashes
- 🔲 **Real-time API backend** (PostgreSQL + Supabase)
- 🔲 **User accounts** with JWT authentication

### Phase 3 — Clinical Intelligence (Q4 2026)
- 🔲 **True AI model** (fine-tuned Whisper + speech biomarker model) replacing statistical NLP
- 🔲 **Multilingual NLP** using `facebook/seamless-m4t` or Google Cloud Speech-to-Text v2
- 🔲 **Cognitive baseline calibration** — personalized baseline per user, not global
- 🔲 **Anomaly detection** — flagging statistically significant drops in MindScore

### Phase 4 — Ecosystem (2027)
- 🔲 **Mobile apps** (React Native) with background daily reminders
- 🔲 **Wearable integration** — Apple Watch / Garmin heart rate + HRV as additional signals
- 🔲 **Research data marketplace** — on-chain smart contract marketplace for aggregate datasets

---

## 11. Appendix: Component Map

```
client/src/
├── App.jsx                    # Root router + layout
├── index.css                  # Global styles + Tailwind
├── main.jsx                   # React entry point
├── components/
│   ├── Background.jsx         # Animated neural background (canvas + Framer Motion)
│   ├── BiomarkerCard.jsx      # Individual biomarker score card
│   ├── BlockchainRecord.jsx   # Tx hash / block record display
│   ├── MindScoreGauge.jsx     # SVG radial gauge for MindScore
│   ├── Navbar.jsx             # Top navigation bar
│   ├── SkeletonLoader.jsx     # Loading skeleton UI
│   ├── Toast.jsx              # Toast notification system
│   └── WaveformRecorder.jsx   # Mic recorder + live transcript + audio analysis
├── context/
│   ├── AppContext.jsx          # Global state: sessions, wallet, access, toasts
│   └── I18nContext.jsx         # 8-language translation system + locale state
├── hooks/
│   └── useCountUp.js           # Animated number counting hook
└── pages/
    ├── CheckIn.jsx             # Primary check-in + analysis results page
    ├── Dashboard.jsx           # Historical analytics + charts
    ├── Home.jsx                # Landing page
    └── Wallet.jsx              # MIND token wallet + data marketplace
```

---

## 12. Setup and Execution

### Prerequisites
- Node.js 18+
- npm 9+

### Monorepo Startup (Concurrent Dev Mode)
To launch both client and server simultaneously, run the following from the root directory:
```bash
cd MindMirror
npm install
npm run dev
```

- **Client Site**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
