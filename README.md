# MindMirror — AI-Powered Multilingual Cognitive Health Monitoring

> "Your language remembers what your mind forgets."

MindMirror is an AI-powered early cognitive health monitoring system using voice biomarkers, secured by simulated Ethereum blockchain records. It enables users to monitor their cognitive clarity and emotional well-being by simply speaking naturally for 30–60 seconds.

Built for **Bharat Academix CodeQuest** by **Team NovaRise** (Aditya S Sheregar).

---

## 🚀 Key Features

### 1. Zero-Setup Voice Check-In (Primary Flow)
- **One-Tap Recording**: A clean, premium landing interface focusing on a large central microphone button with a dynamic, moving neural network canvas mesh background.
- **Live Real-Time Transcript**: Speech recognition is displayed on the screen in real-time as the user speaks.
- **Raw Language Preservation**: The transcript preserves the exact words spoken (including pauses, repetitions, and grammar mistakes) with no server-side rewrites, corrections, or translations.

### 2. Intelligent Multilingual Pipeline
- **Auto-Language Detection**: The system automatically detects the language of the speaker without requiring any manual selector (supports **English, Hindi, Tamil, Telugu, Kannada, Malayalam, Spanish, French**).
- **End-to-End Localization**: If you speak Hindi, the system returns Hindi transcriptions, computes emotional/cognitive metrics on the Hindi text, generates Hindi recommendations, and synthesizes the AI response in a native Hindi voice.
- **Acoustic Capture**: Analyzes volume variation, pitch variation, pause frequency, and emotional intensity in real-time using the browser's Web Audio API.

### 3. Emotional Snapshot & Voice Assistant
- **Acoustic + Linguistic Emotion Analysis**: Detects emotional states (Happy, Calm, Stressed, Anxious, Sad, Excited, Motivated, Lonely, Angry, Neutral) using a composite classifier.
- **Integrated Voice Assistant**: The AI voice assistant is embedded directly inside the Emotional Snapshot. The response (10–15 seconds, max 20 seconds) auto-plays immediately after analysis completes.
- **Voice Controls**: Standard play/pause/stop buttons with a synchronized voice waveform visualizer.

### 4. Consolidated Analysis Results
The dashboard presents check-in results in a user-first visual hierarchy:
1. **What You Said**: The exact raw transcription.
2. **Emotional Snapshot**: The core mood, confidence score, and voice response playback.
3. **What This Means**: A clear, localized cognitive summary.
4. **Suggested Actions**: Personalized, actionable health recommendations.
5. **Trend Insights**: Rolling comparison against historical baseline data.
6. **Risk Status**: 4-tier color-coded safety level (Low Concern 🟢, Monitor 🟡, Elevated Concern 🟠, High Concern 🔴).
7. **Conversation Summary**: Short contextual description of the check-in content.

### 5. Expandable Detailed Analysis
All technical, clinical, and developer metrics are nested in an expandable **Detailed Analysis** accordion:
- **MindScore™ radial gauge**: A composite score (0–100) representing overall cognitive clarity.
- **5 Cognitive Biomarkers**: Detailed ratings for Word Finding Speed, Vocabulary Diversity, Sentence Complexity, Semantic Coherence, and Phonemic Fluency.
- **Biomarker Radar Chart**: Interactive Recharts radar graphic comparing the 5 dimensions.
- **Blockchain Transaction Hash**: Simulated transaction details matching Ethereum Sepolia standards.

### 6. Simulated Blockchain & Data Marketplace
- **MIND Token Economy**: Users earn **50 MIND** per daily check-in, streak bonuses, and marketplace data sharing.
- **Data Marketplace**: Users can choose to grant or revoke research data access requested by institutions (e.g., Stanford, AIIMS, Novartis) in exchange for MIND tokens.
- **Access Control**: Logged on a simulated blockchain mimicking NFT mints and burns.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Animations**: Framer Motion & HTML5 Canvas API (Neural mesh background)
- **Charts**: Recharts (Trend and Radar charts)
- **Styling**: Tailwind CSS v3
- **State**: React Context API (AppContext & I18nContext)
- **Audio APIs**: Web Speech API (`SpeechRecognition`), Web Audio API (`AudioContext`, `AnalyserNode`), Web Speech Synthesis API (`SpeechSynthesisUtterance`)

### Backend
- **Runtime**: Node.js v23+
- **Framework**: Express.js
- **Environment**: ESM/CJS JavaScript, hot reload with `node --watch`
- **Default Port**: 3001

---

## 📦 Project Structure

```
mindmirror/
├── client/                     # React + Vite frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Mic, Gauge, Radar, Waveform)
│   │   ├── context/            # Global App and Translation state (AppContext, I18nContext)
│   │   ├── hooks/              # Custom hooks (CountUp, Toast)
│   │   ├── pages/              # Router Pages (Home, CheckIn, Dashboard, Wallet)
│   │   ├── index.css           # Tailwind design tokens
│   │   └── main.jsx            # Application entry point
├── server/                     # Node.js + Express.js backend API
│   ├── index.js                # Core API logic, statistical NLP parser, language detection
└── package.json                # Monorepo workspaces definition
```

---

## ⚙️ Setup & Execution

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

---

## 🔌 API Endpoints

All backend APIs are served by default from `http://localhost:3001`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyzes raw transcript + acoustic metrics to return localized emotion & cognitive analysis |
| `GET` | `/api/sessions` | Retrieves the list of historical check-in sessions |
| `GET` | `/api/tokens` | Retrieves mock MIND token balance and earning history |
| `POST` | `/api/grant-access` | Simulates minting a data access NFT for a requesting clinician |
| `POST` | `/api/revoke-access` | Revokes data access permissions, burning the mock access NFT |
| `POST` | `/api/conversation-followup` | Generates a contextual follow-up question based on the user's transcript |

---

## 🔒 Privacy & Security

- **No audio storage**: Raw audio is parsed for acoustic metrics locally in the browser and discarded. Audio is never sent to the server.
- **Hashed On-Chain Registry**: Access control is logged on the simulated blockchain mimicking NFT mints and burns.
- **Zero Real API Keys**: The entire project is mock-integrated, meaning it requires zero external API keys (no Google Cloud, OpenAI, or database keys required).

---

## 👥 Team

**Team NovaRise** — Bharat Academix CodeQuest  
Lead Developer: Aditya S Sheregar
