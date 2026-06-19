# Masroof (مصروف) — System Design Document

**Voice-First Personal Finance Assistant for the Egyptian Market**

---

## 1. Document Control

| Field | Value |
|---|---|
| **Document ID** | SD-001 |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Date** | 2026-06-13 |
| **Author** | Architecture Team |
| **Classification** | Internal — Confidential |
| **Primary Artifact Source** | BRD-001 (BRD-main.md v2.0) |

### Change History

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 1.0 | 2026-06-13 | Architecture Team | Initial system design document based on BRD-001 v2.0 |

---

## 2. Table of Contents

1. [Document Control](#1-document-control)
2. [Table of Contents](#2-table-of-contents)
3. [System Overview & Architecture Vision](#3-system-overview--architecture-vision)
4. [Architecture Principles & Constraints](#4-architecture-principles--constraints)
5. [System Context Diagram](#5-system-context-diagram)
6. [Container / Component Architecture](#6-container--component-architecture)
7. [Detailed Component Design](#7-detailed-component-design)
8. [Data Architecture](#8-data-architecture)
9. [AI/ML Architecture](#9-aiml-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Offline Architecture](#11-offline-architecture)
12. [Performance Design](#12-performance-design)
13. [Reminder System Architecture](#13-reminder-system-architecture)
14. [Phase 6 Cloud Architecture](#14-phase-6-cloud-architecture)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Monitoring & Observability](#16-monitoring--observability)
17. [Key Technical Decisions & Trade-offs](#17-key-technical-decisions--trade-offs)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Appendices](#19-appendices)

---

## 3. System Overview & Architecture Vision

### 3.1 Architecture Philosophy

Masroof is a **local-first, offline-capable, AI-native** mobile application. The architecture is shaped by three foundational commitments:

1. **Voice-first interaction model** — the primary user interface is speech, not taps. The entire technology stack is designed around capturing, processing, and responding to voice input with minimal latency.
2. **Privacy by default** — all sensitive processing (speech recognition, language understanding, data extraction) happens on-device. No audio or financial data ever leaves the device unless the user explicitly opts into cloud backup (Phase 6).
3. **Incremental intelligence** — each phase adds a layer of understanding on top of the previous one, from raw audio capture (Phase 1) to proactive financial insight (Phase 5). The data model and API surfaces are designed for backward compatibility across all six phases.

### 3.2 Key Architectural Drivers

| Driver | Implication |
|---|---|
| **Offline-first** | SQLite as primary data store; no network dependency for Phase 1–5 features; local notification scheduling; model inference runs on-device |
| **Voice-first** | Audio capture pipeline must be low-latency (<500ms activation); Whisper.cpp must be warm-loaded; review screen is optional (auto-save for high-confidence) |
| **On-device AI** | Two ML models (Whisper.cpp ~450MB, Gemma 3n ~2–4GB quantized) must coexist within an <80MB app binary — implies download-after-install or streaming model loading |
| **RTL + Arabic** | Expo's I18n system, Cairo font, Eastern Arabic numeral rendering, and RTL layout mirroring must be tested at every screen; date/time/currency formatting is locale-aware |
| **Phase 6 optionality** | Cloud is a bolt-on layer, not a dependency. The NestJS backend, PostgreSQL, and S3 storage are entirely optional and never assumed by the core data layer. All sync is pull-based, user-initiated, or scheduled locally |

### 3.3 Vision-to-Architecture Mapping

| Product Level (from BRD) | Architectural Layer | Phase |
|---|---|---|
| **Record** | Audio capture → Whisper.cpp → SQLite ticket storage | Phase 1 |
| **Understand** | Gemma 3n NLU pipeline → structured extraction → expense schema | Phase 2–3 |
| **Organize** | Normalization engine (LLM + rules) → canonical entity resolution | Phase 4 |
| **Analyze** | Local aggregation engine → analytics views → notification triggers | Phase 5 |
| **Advise** | Recommendation engine → adaptive reminder tuning | Phase 5 |
| **Anticipate** | (future) predictive models → proactive alerts | Post-Phase 6 |

---

## 4. Architecture Principles & Constraints

### 4.1 Design Principles

| Principle | Rationale |
|---|---|
| **Local data is the source of truth** | The SQLite database on-device is authoritative. Cloud is a replica. This eliminates sync complexity in the critical path |
| **Process voice synchronously, everything else async** | The recording → transcription → extraction pipeline must feel instantaneous (<10s total). Analytics, normalization, and backup run on idle/background |
| **Progressive disclosure of intelligence** | The app delivers value in Phase 1 (voice recording + playback) without needing the AI layers. Each phase's features degrade gracefully if models are not yet downloaded |
| **Entity resolution before analytics** | Normalization (Phase 4) is a prerequisite for reliable analytics (Phase 5). Without canonical merchants/categories, dashboards produce misleading aggregates |
| **Encryption at rest is non-negotiable** | Financial data on a mobile device is highly sensitive. SQLCipher encryption is enabled from Phase 1, even though cloud backup is Phase 6 |
| **Notifications are local-first** | expo-notifications with local scheduling avoids server dependency for the core habit loop. Remote push supplements in Phase 6 for cross-device notification sync |

### 4.2 Constraints

| Constraint | Details |
|---|---|
| **App binary size** | <80 MB including on-device models. Whisper.cpp + Gemma 3n quantized must fit within this budget. Models may need to be downloaded post-install |
| **Target device** | Mid-range Android (Redmi Note 12, Samsung A-series) and iPhone (XS/11/SE). RAM: 4–6 GB. Neural engine support varies |
| **Offline reliability** | 100% of Phase 1–5 features must function without internet. This includes transcription, NLU extraction, notification scheduling, and analytics computation |
| **Battery budget** | <2% additional drain per 10 recordings. Inference should use hardware accelerators (ANE on iOS, NNAPI/GPU on Android) where available |
| **Audio storage** | 90-day retention default. A 30-second PCM recording at 16kHz mono is ~480KB. At 5 recordings/day → ~72MB/month. Auto-pruning required |
| **RTL support** | 100% of screens must render correctly in RTL. This includes animations, gesture directions, and navigation transitions |

---

## 5. System Context Diagram

### 5.1 External Actors

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM CONTEXT                                 │
│                           Masroof (مصروف)                               │
│                                                                         │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │                     Masroof Mobile App                       │    │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │    │
│    │  │ Voice    │ │ Whisper  │ │ Gemma    │ │ SQLite       │   │    │
│    │  │ Capture  │ │ .cpp     │ │ 3n NLU   │ │ (SQLCipher)  │   │    │
│    │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │    │
│    │                                                              │    │
│    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │    │
│    │  │ Notif.   │ │ Render   │ │ I18n/RTL │ │ File System  │   │    │
│    │  │ Engine   │ │ Engine   │ │          │ │ (Audio/Expt) │   │    │
│    │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                         ▲              ▲                               │
│          ┌──────────────┘              └──────────────┐                │
│          ▼                                             ▼               │
│  ┌──────────────────┐                      ┌──────────────────┐        │
│  │   User (Person)  │                      │ OS Notification  │        │
│  │  • Speaks into   │                      │  System          │        │
│  │    microphone    │                      │  • Local push    │        │
│  │  • Taps UI       │                      │  • Deep-link     │        │
│  │  • Views info    │                      │  • Badge count   │        │
│  └──────────────────┘                      └──────────────────┘        │
│                                                                         │
│                           ═══════ Phase 6 ═══════                      │
│                      ┌──────────────────────────────────┐              │
│                      │     Cloud Backup Service         │              │
│                      │  ┌────────┐ ┌────────┐ ┌──────┐ │              │
│                      │  │ NestJS  │ │Postgres│ │  S3  │ │              │
│                      │  │  API    │ │        │ │      │ │              │
│                      │  └────────┘ └────────┘ └──────┘ │              │
│                      └──────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 System Boundary

| Boundary | Inside (Phase 1–5) | Outside (Phase 6+) | Future |
|---|---|---|---|
| **User Identity** | Device-local UUID | Email + passwordless auth | OAuth (Google/Apple) |
| **Data Storage** | SQLCipher + file system | PostgreSQL + S3 | Data lake for analytics |
| **Notifications** | expo-notifications (local) | Remote push via FCM/APNs | Cross-device sync |
| **AI Inference** | On-device (Whisper.cpp, Gemma 3n) | (none — always on-device) | Federated fine-tuning |
| **Backup** | Manual export (JSON/CSV) | Scheduled E2E encrypted backup | Continuous sync |

---

## 6. Container / Component Architecture

### 6.1 Layered Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  expo-router (file-based routing) · src/app/                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ Home     │ │ Record   │ │ Review   │ │ History  │ │ Settings │  │   │
│  │  │ Screen   │ │ Screen   │ │ Screen   │ │ Screen   │ │ Screen   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │                                                                      │   │
│  │  Shared UI Components (src/components/)                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐          │   │
│  │  │ MicBtn   │ │ Ticket   │ │ Expense  │ │ Category     │          │   │
│  │  │          │ │ Card     │ │ Card     │ │ Chip         │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐          │   │
│  │  │ Waveform │ │ Skeleton │ │ Chart    │ │ Analytics    │          │   │
│  │  │ Viewer   │ │ Loader   │ │ (Victory)│ │ Card         │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│  APPLICATION / ORCHESTRATION LAYER                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Hooks & Services (src/hooks/, src/services/)                        │   │
│  │  ┌───────────────┐ ┌──────────────┐ ┌─────────────────────┐        │   │
│  │  │ useRecording  │ │ useTicket    │ │ useExtraction       │        │   │
│  │  │ (audio mgmt)  │ │ (CRUD)       │ │ (NLU orchestration) │        │   │
│  │  └───────────────┘ └──────────────┘ └─────────────────────┘        │   │
│  │  ┌───────────────┐ ┌──────────────┐ ┌─────────────────────┐        │   │
│  │  │ useReminders  │ │ useAnalytics │ │ useNormalization    │        │   │
│  │  │ (notif mgmt)  │ │ (aggregation)│ │ (entity resolution) │        │   │
│  │  └───────────────┘ └──────────────┘ └─────────────────────┘        │   │
│  │  ┌───────────────┐ ┌──────────────┐ ┌─────────────────────┐        │   │
│  │  │ useBackup     │ │ useAuth     │ │ useSettings          │        │   │
│  │  │ (Phase 6)     │ │ (Phase 6)   │ │ (preferences)        │        │   │
│  │  └───────────────┘ └──────────────┘ └─────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│  AI/ML LAYER                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────────────────┐   ┌──────────────────────────────┐    │   │
│  │  │  Whisper.cpp Service     │   │  Gemma 3n Service            │    │   │
│  │  │  ┌────────────────────┐  │   │  ┌────────────────────────┐  │    │   │
│  │  │  │ Audio Preprocessor │  │   │  │ Prompt Builder        │  │    │   │
│  │  │  │ (16kHz mono PCM)   │  │   │  │ (Arabic/EN templates)  │  │    │   │
│  │  │  ├────────────────────┤  │   │  ├────────────────────────┤  │    │   │
│  │  │  │ Whisper.cpp Runtime│  │   │  │ Gemma 3n Runtime       │  │    │   │
│  │  │  │ (CoreML / NNAPI)   │  │   │  │ (MediaPipe/XNNPACK)    │  │    │   │
│  │  │  ├────────────────────┤  │   │  ├────────────────────────┤  │    │   │
│  │  │  │ Post-processor     │  │   │  │ Response Parser        │  │    │   │
│  │  │  │ (diarization)      │  │   │  │ (JSON extraction)      │  │    │   │
│  │  │  └────────────────────┘  │   │  └────────────────────────┘  │    │   │
│  │  └──────────────────────────┘   └──────────────────────────────┘    │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────┐   ┌──────────────────────────────┐    │   │
│  │  │  Normalization Engine    │   │  Recommendation Engine       │    │   │
│  │  │  (Phase 4)               │   │  (Phase 5)                   │    │   │
│  │  │  ┌────────────────────┐  │   │  ┌────────────────────────┐  │    │   │
│  │  │  │ Alias Matcher      │  │   │  │ Pattern Detector      │  │    │   │
│  │  │  ├────────────────────┤  │   │  ├────────────────────────┤  │    │   │
│  │  │  │ Canonical Resolver │  │   │  │ Trend Analyzer         │  │    │   │
│  │  │  ├────────────────────┤  │   │  ├────────────────────────┤  │    │   │
│  │  │  │ User Feedback Loop │  │   │  │ Budget Monitor         │  │    │   │
│  │  │  └────────────────────┘  │   │  └────────────────────────┘  │    │   │
│  │  └──────────────────────────┘   └──────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────────────┐   ┌────────────────────────────────┐      │   │
│  │  │  SQLCipher Database   │   │  File System                   │      │   │
│  │  │  (expo-sqlite + sqlcipher) │  ├────────────────────────────┤      │   │
│  │  │  ┌────────────────────┤   │  │  audio/ (WAV 16kHz mono)   │      │   │
│  │  │  │ tickets            │   │  │  exports/ (JSON, CSV, PDF) │      │   │
│  │  │  │ expenses           │   │  │  models/ (GGUF, XNNPACK)   │      │   │
│  │  │  │ items              │   │  │  logs/                     │      │   │
│  │  │  │ merchants          │   │  └────────────────────────────┘      │   │
│  │  │  │ categories         │   └────────────────────────────────┘      │   │
│  │  │  │ normalization_map  │                                           │   │
│  │  │  │ budgets            │                                           │   │
│  │  │  │ reminder_config    │                                           │   │
│  │  │  │ settings           │                                           │   │
│  │  │  └────────────────────┘                                           │   │
│  │  └───────────────────────────────────────────────────────────────────┘   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│  CLOUD LAYER (Phase 6 — Optional)                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  NestJS API   │  │  PostgreSQL  │  │  S3 Storage   │              │   │
│  │  │  (REST/gRPC) │  │  (accounts,  │  │  (encrypted   │              │   │
│  │  │              │  │   backups)   │  │   blobs)      │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Container Breakdown by Phase

| Container | Phase | Technology | Key Responsibility |
|---|---|---|---|
| **Home Screen** | 1 | expo-router (index.tsx) | Voice zone, mic button, recent tickets, spending summary |
| **Record Screen** | 1 | src/app/record.tsx | Audio capture, waveform display, recording state machine |
| **Review Screen** | 2 | src/app/review/[id].tsx | Structured expense display, field editing, voice correction |
| **History Screen** | 1 | src/app/history.tsx | Paginated ticket/expense list with search and filters |
| **Analytics Dashboard** | 5 | src/app/analytics/ | Charts, breakdowns, trends, drill-down navigation |
| **Settings Screen** | 1 | src/app/settings/ | Reminder config, model management, export, backup (Phase 6) |
| **WhisperService** | 1 | src/services/whisper.ts | Model loading, audio preprocessing, transcription, confidence |
| **GemmaService** | 2 | src/services/gemma.ts | Prompt construction, inference orchestration, response parsing |
| **SqliteDatabase** | 1 | src/services/database.ts | Schema migrations, CRUD, indexed queries, encryption init |
| **NotificationService** | 1 | src/services/notifications.ts | Local scheduling, suppression logic, deep-link handler |
| **NormalizationEngine** | 4 | src/services/normalization.ts | Alias matching, canonical resolution, user feedback ingestion |
| **AnalyticsEngine** | 5 | src/services/analytics.ts | Aggregation queries, trend computation, insight generation |
| **BackupService** | 6 | src/services/backup.ts | Encryption, upload, restore, schedule management |

---

## 7. Detailed Component Design

### 7.1 Audio Capture Pipeline

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│ Mic Tap  │───▶│ AudioSession  │───▶│ Audio Buffer   │───▶│ Whisper.cpp  │
│          │    │ (AVAudioRec  │    │ (16kHz mono    │    │ Inference    │
│          │    │  .start())   │    │  PCM, ring buf)│    │              │
└──────────┘    └──────────────┘    └────────────────┘    └──────┬───────┘
                                                                  │
                                                                  ▼
┌──────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│ Ticket   │◀───│ Save to      │◀───│ Post-process   │◀───│ Transcript   │
│ Created  │    │ SQLite +     │    │ (timestamps,   │    │ (raw text)   │
│          │    │ File System  │    │  VAD segments) │    │              │
└──────────┘    └──────────────┘    └────────────────┘    └──────────────┘
```

**Key interfaces:**

```typescript
// src/services/recording.ts
interface RecordingService {
  startRecording(): Promise<AudioSession>;
  stopRecording(): Promise<RecordingResult>;
  cancelRecording(): void;
  getAmplitude(): Observable<number>; // waveform data
}

interface RecordingResult {
  audioUri: string;        // path to saved WAV file
  durationMs: number;
  sampleRate: number;      // always 16000
  channels: number;        // always 1 (mono)
  peakAmplitude: number;
}
```

**Audio preprocessing (before Whisper.cpp):**

| Step | Operation | Rationale |
|---|---|---|
| Sample rate conversion | 48kHz → 16kHz | Whisper expects 16kHz; reduces data by 3x |
| Mono downmix | Stereo → mono | Voice input is mono; reduces processing |
| Voice activity detection (VAD) | Silence trimming before + after | Reduces inference time; improves transcription focus |
| Normalization | Peak amplitude → -3dB | Consistent volume levels improve transcription accuracy |
| Format conversion | CAF/MP4 → WAV | Whisper.cpp best supported format |

### 7.2 Transcription Service (Whisper.cpp)

```typescript
// src/services/whisper.ts
interface WhisperService {
  loadModel(modelPath: string): Promise<boolean>;
  transcribe(audioUri: string, options?: TranscriptionOptions): Promise<TranscriptionResult>;
  unloadModel(): void;
}

interface TranscriptionOptions {
  language?: 'ar' | 'en' | 'auto';    // default 'auto'
  temperature?: number;                // default 0.0 for deterministic
  maxSegmentLength?: number;           // characters
  suppressNonSpeech?: boolean;         // default true
}

interface TranscriptionResult {
  text: string;                        // full transcript
  segments: TranscriptSegment[];       // timed segments
  language: string;                    // detected language
  confidence: number;                  // 0-1 overall confidence
  durationMs: number;                  // processing time
}
```

**Model loading strategy:**

| Strategy | Detail |
|---|---|
| **Model variant** | `ggml-small-q5_1` (~460MB) for initial load; `ggml-large-v3-q5_0` optional (~1.2GB) for accuracy-critical use |
| **Load timing** | On first recording; show loading state ("Loading speech model..."). Keep warm in memory while app is foregrounded |
| **Memory pressure** | On `didReceiveMemoryWarning`, unload model and reload on next recording. Show brief loading state |
| **Quantization** | 5-bit quantization provides near-lossless quality at ~50% size reduction vs float16 |

### 7.3 Structured Extraction Service (Gemma 3n)

```typescript
// src/services/gemma.ts
interface GemmaService {
  loadModel(modelPath: string): Promise<boolean>;
  extractExpense(transcript: string, context?: ExtractionContext): Promise<ExtractionResult>;
  correctField(expenseId: string, correction: FieldCorrection): Promise<ExtractionResult>;
  extractItems(transcript: string, context?: ItemContext): Promise<ItemizedResult>;
  unloadModel(): void;
}

interface ExtractionContext {
  recentMerchants?: string[];
  knownCategories?: string[];
  userPreferences?: { currency: string; locale: string };
}

interface ExtractionResult {
  expense: Partial<StructuredExpense>;
  confidence: {
    overall: number;
    amount: number;
    merchant: number;
    category: number;
    date: number;
  };
  rawResponse: string;     // Gemma's raw output for audit
  processingTimeMs: number;
}
```

**Prompt engineering strategy:**

The prompt sent to Gemma 3n is a carefully crafted template with few-shot examples:

```
You are Masroof, a financial assistant for the Egyptian market.
Extract expense information from the following Arabic/English transcript.

Rules:
- Amount: extract in EGP (Egyptian Pounds). Handle Eastern Arabic numerals (٤٥٠ → 450).
- Merchant: brand/business name. Use English name if known, else Arabic.
- Category: one of [Food, Groceries, Transportation, Utilities, Shopping, Entertainment,
  Healthcare, Education, Housing, Business, Other]
- Date: if not specified, use today. Handle colloquial: امبارح, النهارده, السبت اللي فات
- Currency: default EGP
- Items: if multiple items mentioned, extract individually with prices

Examples:

Transcript: "دفعت ٤٥٠ جنيه في Carrefour على أكل البيت"
Output: {"amount": 450, "currency": "EGP", "merchant": "Carrefour",
         "category": "Groceries", "date": "2026-06-13",
         "items": [], "notes": "أكل البيت"}

Transcript: "{{transcript}}"
Output:
```

**Confidence scoring:**

| Score Range | Action |
|---|---|
| >= 0.90 | Auto-save (if user has opted into auto-save mode) |
| 0.70 – 0.89 | Show review screen with green confidence indicator |
| 0.50 – 0.69 | Show review screen with yellow indicator; highlight low-confidence fields |
| < 0.50 | Show review screen with red indicator; request user confirmation before saving |

### 7.4 Review Screen with Voice Correction

```
┌──────────────────────────────────────┐
│  تقييم المصروف  (Review Expense)     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ٤٥٠  ج.م                      │  │  ← amount (tap to edit)
│  │ Carrefour                      │  │  ← merchant (tap to edit)
│  │ البقالة (Groceries)            │  │  ← category (tap → chip picker)
│  │ 13 يونيو 2026                  │  │  ← date (tap → date picker)
│  │                                │  │
│  │ "دفعت ٤٥٠ جنيه في Carrefour   │  │  ← original transcript
│  │  على أكل البت"                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  [   تصحيح صوتي  ]  [  حفظ  ]       │
│   (Voice Correct)   (Save)         │
└──────────────────────────────────────┘
```

**Voice correction flow:**

1. User taps a field (e.g., category)
2. Microphone activates with overlay: "قول التصحيح" (Say the correction)
3. Audio → Whisper.cpp → Gemma 3n (with correction context: "field: category, current: Groceries, transcript: ...")
4. Gemma returns: `{"field": "category", "new_value": "Food", "confidence": 0.95}`
5. Field updates inline on the review screen
6. If confidence < 0.60 or no change detected → fallback to keyboard editing

### 7.5 Normalization Engine (Phase 4)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NORMALIZATION ENGINE                            │
│                                                                      │
│  Raw Input ──▶ ┌────────────────┐ ┌─────────────────┐ ┌──────────┐  │
│  "ماكدونالدز" │  Alias Lookup  │ │  Fuzzy Matcher   │ │ Canonical│  │
│                │  (exact match  │ │  (Levenshtein,   │ │ Resolver │  │
│                │   in aliases)  │ │   soundex for    │ │          │  │
│                └────────┬───────┘ │   Arabic)        │ │          │  │
│                         │         └────────┬────────┘ │          │  │
│                         └──────────────────┘          │          │  │
│                                                        │          │  │
│  ┌────────────────┐                                    │          │  │
│  │  LLM Normalizer │  (if both above fail)             │          │  │
│  │  Gemma 3n:      │──────────────────────────────────▶│          │  │
│  │  "Normalize this│                                   │          │  │
│  │   merchant name │                                   └──────────┘  │
│  │   for Egyptian  │                                       │         │
│  │   market"       │                                       ▼         │
│  └────────────────┘                               ┌────────────────┐ │
│                                                    │  New Alias     │ │
│                                                    │  Created in    │ │
│                                                    │  normaliza-    │ │
│                                                    │  tion_map      │ │
│                                                    └────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Alias resolution strategy (priority order):**

1. **Exact match** — case-insensitive, diacritic-insensitive lookup in `normalization_map`
2. **Strict fuzzy** — Levenshtein distance <= 2 for Latin, <= 3 for Arabic (Arabic has richer morphology)
3. **Tokenized fuzzy** — split by whitespace, match majority of tokens (handles "Carrefour Market" vs "Carrefour")
4. **LLM resolution** — call Gemma 3n with context: `"Normalize this merchant name to its canonical form: [input]. Known merchants: [list]. Egyptian context."`
5. **User prompt** — if LLM confidence < 0.70, ask user: "Is [input] the same as [suggested]? Or create new?"

---

## 8. Data Architecture

### 8.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────────┐
│     ticket       │       │      expense          │
├──────────────────┤       ├──────────────────────┤
│ id (UUID) PK     │◀─────┼── ticket_id (FK)      │
│ audio_uri        │  1    │ id (UUID) PK          │
│ transcript_text  │  to   │ amount DECIMAL(12,2)  │
│ duration_ms      │   1   │ currency VARCHAR(3)   │
│ language_detected│       │ merchant_id (FK) ─────┼────┐
│ recording_tz     │       │ category_id (FK) ─────┼──┐ │
│ confidence       │       │ date DATE              │  │ │
│ created_at       │       │ confidence DECIMAL(3,2)│  │ │
│ updated_at       │       │ extracted_json TEXT    │  │ │
│ is_deleted BOOL  │       │ notes TEXT             │  │ │
└──────────────────┘       │ created_at             │  │ │
                           │ updated_at             │  │ │
                           └──────────────────────┘  │  │
                                │                   │  │
                                │ 1                 │  │
                                ▼                   │  │
                           ┌──────────────────┐     │  │
                           │      item         │     │  │
                           ├──────────────────┤     │  │
                           │ id (UUID) PK     │     │  │
                           │ expense_id (FK)  │     │  │
                           │ name TEXT        │     │  │
                           │ price DECIMAL    │     │  │
                           │ category_id (FK)─┼─────┼──┤
                           │ product_id (FK)─┼─────┤  │
                           │ quantity INT     │     │  │
                           │ created_at       │     │  │
                           └──────────────────┘     │  │
                                                    │  │
┌──────────────────┐         ┌──────────────────┐   │  │
│   merchant       │         │   category        │   │  │
├──────────────────┤         ├──────────────────┤   │  │
│ id (UUID) PK     │         │ id (UUID) PK     │◀──┘  │
│ canonical_name   │         │ name TEXT        │      │
│ name_ar TEXT     │         │ name_ar TEXT     │      │
│ name_en TEXT     │         │ parent_id (FK)   │      │
│ icon TEXT        │         │ icon TEXT        │      │
│ color TEXT       │         │ color TEXT       │      │
│ created_at       │         │ sort_order INT   │      │
│ updated_at       │         │ created_at       │      │
└──────────────────┘         └──────────────────┘      │
       │                                               │
       │                                               │
┌──────────────────┐         ┌──────────────────┐      │
│ normalization_map│         │   product         │      │
├──────────────────┤         ├──────────────────┤      │
│ id (UUID) PK     │         │ id (UUID) PK     │      │
│ entity_type ENUM │         │ canonical_name   │      │
│  (merchant|      │         │ name_ar TEXT     │      │
│   category|      │         │ name_en TEXT     │      │
│   product)       │         │ category_id (FK)─┼──────┘
│ raw_value TEXT   │         │ created_at       │
│ canonical_id (FK)│         │ updated_at       │
│ confidence DEC   │         └──────────────────┘
│ source ENUM      │
│  (exact|fuzzy|   │
│   llm|user)      │
│ user_confirmed   │
│ created_at       │
└──────────────────┘

┌──────────────────┐       ┌──────────────────────┐
│ budgets           │       │ reminder_config       │
├──────────────────┤       ├──────────────────────┤
│ id (UUID) PK     │       │ id (UUID) PK          │
│ category_id (FK) │       │ slot_index INT        │
│ amount DECIMAL   │       │ label TEXT            │
│ period ENUM      │       │ hour INT              │
│  (weekly|monthly)│       │ minute INT            │
│ start_date DATE  │       │ enabled BOOL          │
│ end_date DATE    │       │ days_of_week BITMASK  │
│ created_at       │       │ created_at            │
│ updated_at       │       │ updated_at            │
└──────────────────┘       └──────────────────────┘
```

### 8.2 Key Schemas (DDL)

```sql
-- Phase 1: Core ticket storage
CREATE TABLE ticket (
    id              TEXT PRIMARY KEY,          -- UUID v4
    audio_uri       TEXT NOT NULL,             -- relative path in app sandbox
    transcript_text TEXT,                      -- null until transcribed
    duration_ms     INTEGER NOT NULL,
    language_detected TEXT,                    -- 'ar', 'en', 'mixed'
    recording_tz    TEXT DEFAULT 'Africa/Cairo',
    confidence      REAL,                      -- Whisper confidence 0.0–1.0
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    is_deleted      INTEGER DEFAULT 0
);

CREATE INDEX idx_ticket_created ON ticket(created_at DESC);
CREATE INDEX idx_ticket_deleted ON ticket(is_deleted);

-- Phase 2: Structured expense
CREATE TABLE expense (
    id              TEXT PRIMARY KEY,
    ticket_id       TEXT NOT NULL REFERENCES ticket(id),
    amount          REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'EGP',
    merchant_id     TEXT REFERENCES merchant(id),
    category_id     TEXT REFERENCES category(id),
    date            TEXT NOT NULL,             -- YYYY-MM-DD
    confidence      REAL,                      -- Gemma overall confidence
    extracted_json  TEXT,                      -- raw Gemma output for audit
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_expense_date ON expense(date DESC);
CREATE INDEX idx_expense_merchant ON expense(merchant_id);
CREATE INDEX idx_expense_category ON expense(category_id);

-- Phase 3: Item-level detail
CREATE TABLE item (
    id              TEXT PRIMARY KEY,
    expense_id      TEXT NOT NULL REFERENCES expense(id),
    name            TEXT NOT NULL,
    price           REAL NOT NULL,
    category_id     TEXT REFERENCES category(id),
    product_id      TEXT REFERENCES product(id),
    quantity        INTEGER DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_item_expense ON item(expense_id);

-- Phase 4: Normalization
CREATE TABLE merchant (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL UNIQUE,
    name_ar         TEXT,
    name_en         TEXT,
    icon            TEXT,
    color           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE category (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    name_ar         TEXT NOT NULL,
    parent_id       TEXT REFERENCES category(id),
    icon            TEXT,
    color           TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL,
    name_ar         TEXT,
    name_en         TEXT,
    category_id     TEXT REFERENCES category(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE normalization_map (
    id              TEXT PRIMARY KEY,
    entity_type     TEXT NOT NULL CHECK (entity_type IN ('merchant', 'category', 'product')),
    raw_value       TEXT NOT NULL,
    canonical_id    TEXT NOT NULL,             -- references merchant/category/product id
    confidence      REAL,
    source          TEXT NOT NULL CHECK (source IN ('exact', 'fuzzy', 'llm', 'user')),
    user_confirmed  INTEGER DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_norm_entity ON normalization_map(entity_type, raw_value);

-- Phase 5: Budgets
CREATE TABLE budget (
    id              TEXT PRIMARY KEY,
    category_id     TEXT NOT NULL REFERENCES category(id),
    amount          REAL NOT NULL,
    period          TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
    start_date      TEXT NOT NULL,
    end_date        TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Phase 1: Reminder configuration
CREATE TABLE reminder_config (
    id              TEXT PRIMARY KEY,
    slot_index      INTEGER NOT NULL CHECK (slot_index BETWEEN 0 AND 2),
    label           TEXT,
    hour            INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    minute          INTEGER NOT NULL CHECK (minute BETWEEN 0 AND 59),
    enabled         INTEGER DEFAULT 1,
    days_of_week    INTEGER DEFAULT 127,       -- BITMASK: Sun=1, Mon=2, ..., Sat=64
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE daily_spending_log (
    id              TEXT PRIMARY KEY,
    date            TEXT NOT NULL UNIQUE,      -- YYYY-MM-DD
    total_amount    REAL NOT NULL DEFAULT 0,
    expense_count   INTEGER NOT NULL DEFAULT 0,
    last_updated    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Phase 5: Adaptive reminder analytics
CREATE TABLE recording_pattern (
    id              TEXT PRIMARY KEY,
    day_of_week     INTEGER NOT NULL,          -- 0=Sun, 6=Sat (Egypt)
    hour_bucket     INTEGER NOT NULL,          -- 0–23
    recording_count INTEGER NOT NULL DEFAULT 0,
    week_count      INTEGER NOT NULL DEFAULT 0,
    last_updated    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_pattern_day_hour ON recording_pattern(day_of_week, hour_bucket);
```

### 8.3 Data Flow Diagrams

**Recording pipeline (Phase 1):**

```
User taps mic ──▶ AudioSession.start()
    │
    ▼
[Audio buffer fills] ──▶ [Waveform displayed on UI]
    │
    ▼
[User taps stop] or [silence timeout (3s)]
    │
    ├──▶ Save audio to file: audio/{uuid}.wav
    │
    ▼
[Whisper.cpp transcribe]
    │
    ├──▶ [Loading skeleton shown on UI]
    │
    ▼
[Transcription complete]
    │
    ├──▶ Save ticket to SQLite (ticket table)
    ├──▶ Display transcript on UI
    ├──▶ [Haptic feedback + success animation]
    │
    ▼
[If Phase 2 enabled] ──▶ Gemma 3n extraction (async, shown below)
    │
    ▼
[User dismisses or edits]
```

**Extraction pipeline (Phase 2):**

```
Transcript ready ──▶ GemmaService.extractExpense()
    │
    ├──▶ Build prompt with few-shot examples + transcript
    ├──▶ Run Gemma 3n inference
    ├──▶ Parse JSON response
    │
    ▼
[Validation & confidence scoring]
    │
    ├──▶ amount > 0? date valid? currency recognized?
    ├──▶ Check each field confidence threshold
    │
    ▼
[Decision: auto-save or show review]
    │
    ├─── auto-save: ──▶ Save structured expense → link to ticket
    │                  ──▶ Update daily_spending_log
    │                  ──▶ Navigate to home (brief success toast)
    │
    └─── review: ──▶ Navigate to review screen with extraction result
                     ──▶ Pre-fill editable fields
                     ──▶ Enable voice correction on tap
```

**Sync pipeline (Phase 6):**

```
[User: "Back up now"] or [Scheduled trigger]
    │
    ▼
[BackupService.runBackup()]
    │
    ├──▶ 1. Export all data from SQLite to JSON
    ├──▶ 2. Collect audio files modified since last backup
    ├──▶ 3. Build backup manifest (checksums, version, timestamp)
    ├──▶ 4. Encrypt manifest + data payload (AES-256-GCM)
    │       Key derived from user passphrase (Argon2id)
    ├──▶ 5. Upload encrypted blob to S3 via NestJS presigned URL
    ├──▶ 6. Record backup metadata in local SQLite
    │
    ▼
[Restore flow]
    │
    ├──▶ 1. Fetch backup list from NestJS
    ├──▶ 2. Select backup (latest or specific timestamp)
    ├──▶ 3. Download encrypted blob
    ├──▶ 4. Decrypt on-device (user provides passphrase)
    ├──▶ 5. Validate integrity (checksum verification)
    ├──▶ 6. Replace or merge into local SQLite (user choice)
```

---

## 9. AI/ML Architecture

### 9.1 Speech Recognition Pipeline (Whisper.cpp)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      WHISPER.CPP SPEECH RECOGNITION                       │
│                                                                           │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ Raw Audio│  │ Preprocessor  │  │ Whisper.cpp  │  │ Post-processor │   │
│  │          │  │              │  │ Runtime      │  │                │   │
│  │ • 48kHz  │──▶  • Resample   │──▶  • Encoder   │──▶  • Timestamps  │   │
│  │ • Stereo │  │    to 16kHz  │  │  • Decoder   │  │  • VAD segments│   │
│  │ • Float  │  │  • Mono mix  │  │  • Cross-attn│  │  • Confidence  │   │
│  │          │  │  • VAD trim  │  │  • Beam size │  │  • Language    │   │
│  │          │  │  • Norm → -3dB│  │  • Temp=0    │  │    detection   │   │
│  └──────────┘  └──────────────┘  └──────────────┘  └────────────────┘   │
│                                                                           │
│  Model variants:                                                          │
│    • Base model: ggml-small-q5_1 (~460MB) — 10-20x realtime on CPU       │
│    • High-accuracy: ggml-large-v3-q5_0 (~1.2GB) — 3-5x realtime          │
│    • Strategy: Start with small, offer large as optional download         │
│                                                                           │
│  Hardware acceleration:                                                   │
│    • iOS: CoreML backend via ctransformers                                │
│    • Android: NNAPI/GPU via Vulkan backend (whisper.cpp v1.7+)           │
│    • Fallback: CPU with int8 quantization                                │
└──────────────────────────────────────────────────────────────────────────┘
```

**Model loading strategy:**

| Event | Action |
|---|---|
| App install | Prompt to download Whisper model (~460MB) on first launch with Wi-Fi |
| First mic tap | If model not downloaded, show progress bar with "Downloading speech model..." |
| App foreground | Check if model is loaded; if not, preload into memory |
| Memory warning | Unload model; reload on next recording with loading spinner |
| Model update | Check for updated GGUF models on app start; lazy download |

**Performance targets:**

| Metric | Target (mid-range device) |
|---|---|
| Transcription latency (5s audio) | <1s real-time |
| Transcription latency (30s audio) | <3s post-recording |
| Memory usage (loaded model) | ~600MB (small-q5) |
| Battery per 10 recordings | <2% at full charge |

### 9.2 NLU Pipeline (Gemma 3n)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      GEMMA 3n NLU PIPELINE                                │
│                                                                           │
│  Transcript ──▶ ┌──────────────────────────────────────────────────┐    │
│                  │  Prompt Builder                                  │    │
│                  │  • System prompt (role, rules, Egyptian context) │    │
│                  │  • Few-shot examples (3-5, selected dynamic)     │    │
│                  │  • User transcript                               │    │
│                  │  • Output format specification (JSON schema)     │    │
│                  └────────────────────┬─────────────────────────────┘    │
│                                       ▼                                  │
│                  ┌──────────────────────────────────────────────────┐    │
│                  │  Gemma 3n Inference                              │    │
│                  │  • Model: Gemma 3n (3.6B params, 4-bit quantized)│    │
│                  │  • Backend: MediaPipe / XNNPACK on Android       │    │
│                  │  • Backend: CoreML on iOS                        │    │
│                  │  • Context window: 4096 tokens (sufficient)      │    │
│                  │  • Temperature: 0.0 (deterministic extraction)   │    │
│                  │  • Max output tokens: 256                        │    │
│                  │  • Inference time target: <2s                    │    │
│                  └────────────────────┬─────────────────────────────┘    │
│                                       ▼                                  │
│                  ┌──────────────────────────────────────────────────┐    │
│                  │  Response Parser                                 │    │
│                  │  • JSON extraction from markdown-wrapped output  │    │
│                  │  • Schema validation (required fields, types)    │    │
│                  │  • Confidence scoring per field                  │    │
│                  │  • Post-processing: date normalization,          │    │
│                  │    currency detection, Arabic numeral conversion │    │
│                  └────────────────────┬─────────────────────────────┘    │
│                                       ▼                                  │
│                               StructuredExpense                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Dynamic few-shot selection:**

The system maintains a pool of ~20 exemplar utterances with ground-truth labels covering:

- Simple single-item expenses (Arabic, English, mixed)
- Multi-item expenses with explicit prices
- Expenses with implicit dates ("امبارح")
- Expenses with implicit merchants ("بقالة" → category inferred, merchant null)
- Correction utterances ("لا ده مش أكل..")
- Edge cases: large numbers, currency variations, time references

Selection is based on transcript length, detected language, and similarity to stored exemplars (cosine similarity on sentence embeddings, computed once on-device via a small encoder).

**Fallback strategies:**

| Scenario | Fallback |
|---|---|
| Gemma output not valid JSON | Re-prompt with stricter schema constraint; max 2 retries |
| Confidence < 0.50 | Show keyboard-first review screen; flag all fields as unconfirmed |
| Gemma inference timeout (>5s) | Use rule-based extraction (regex for amounts, known merchants, common categories) |
| Model not loaded | Show loading state; offer text-based entry as fallback |
| Out-of-vocabulary merchant | Leave merchant field empty; highlight for user to fill |

### 9.3 Normalization Engine (Phase 4)

**Hybrid architecture:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   NORMALIZATION ENGINE (HYBRID)                          │
│                                                                          │
│  Input raw_value ──▶                                                  │
│                        │                                                │
│           ┌────────────┴────────────┐                                   │
│           ▼                         ▼                                   │
│  ┌─────────────────┐    ┌─────────────────────┐                        │
│  │  Rule-based      │    │  LLM-based           │                       │
│  │  Matcher         │    │  Matcher             │                       │
│  │                   │    │                      │                       │
│  │  • Exact match    │    │  • Gemma 3n prompt   │                       │
│  │  • Case-fold      │    │    "Normalize this   │                       │
│  │  • Diacritic-strip│    │     merchant name"   │                       │
│  │  • Levenshtein    │    │  • Batch resolution   │                       │
│  │  • Token overlap  │    │    (queue of pending  │                       │
│  │  • Soundex (Ar)   │    │     normalizations)   │                       │
│  └────────┬──────────┘    └──────────┬──────────┘                        │
│           │                          │                                   │
│           ▼                          ▼                                   │
│     ┌──────────────────────────────────────┐                            │
│     │  Confidence Aggregator                │                            │
│     │  • If rule-based confidence > 0.95 →  │                            │
│     │    accept without LLM                 │                            │
│     │  • If 0.70–0.95 → use LLM for         │                            │
│     │    confirmation                       │                            │
│     │  • If < 0.70 → LLM primary, then      │                            │
│     │    ask user if LLM also < 0.70        │                            │
│     └────────────────┬─────────────────────┘                            │
│                      ▼                                                   │
│              ┌──────────────────┐                                       │
│              │  Alias Storage   │                                       │
│              │  • normalization_map table                               │
│              │  • Incremental: new alias → DB immediately               │
│              │  • User correction → update confidence, set             │
│              │    user_confirmed=1                                      │
│              └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**LLM prompt for normalization:**

```
You are a normalization assistant for Masroof, a finance app in Egypt.

Given a merchant name, category name, or product name, map it to
its most common canonical form. Consider Egyptian spelling variants,
English/Arabic equivalents, and common abbreviations.

Input: "ماك"
Canonical: "McDonald's"
Confidence: 0.97

Input: "كارفور"
Canonical: "Carrefour"
Confidence: 0.99

Input: "{{raw_value}}"
Canonical:
```

### 9.4 Adaptive Reminder Timing (Phase 5)

**Algorithm:**

```
1. For each recorded expense, extract (day_of_week, hour_bucket)
2. Accumulate counts in recording_pattern table
3. After 14+ days of data, compute:
   - Peak recording hour per day_of_week
   - Second peak (if exists)
   - Recording consistency score (std_dev of recording times)
4. If current reminder slot differs from peak hour by >2 hours,
   and confidence in peak is high (>20 recordings in that bucket):
   → Suggest shift: "You usually log around 8:45 AM. Move reminder?"
5. If user accepts, update reminder_config
6. Re-evaluate every 30 days
```

**Suppression logic detail:**

```
Before firing reminder N at time T:
  SELECT COUNT(*) FROM expense
  WHERE created_at > datetime(T, '-120 minutes')

  If count > 0:
    → Suppress this reminder
    → Log suppression event (for analytics)
    → Do NOT reschedule (cap is 3/day, no need to "make up")
  Else:
    → Fire notification
```

---

## 10. Security Architecture

### 10.1 On-Device Encryption (SQLCipher)

```
┌─────────────────────────────────────────────────────────────┐
│                   SQLCipher Architecture                     │
│                                                              │
│  App Launch ──▶ Initialize DB with key                      │
│                    │                                         │
│                    ▼                                         │
│  ┌──────────────────────────────┐                           │
│  │  Key Derivation              │                           │
│  │                             │                           │
│  │  Key material sources:      │                           │
│  │  1. Device-specific key     │                           │
│  │     (iOS Keychain / Android  │                           │
│  │      EncryptedSharedPrefs)  │                           │
│  │  2. User passphrase (opt.)   │                           │
│  │     for backup encryption    │                           │
│  │                             │                           │
│  │  Combined via HMAC-SHA256   │                           │
│  └──────────────┬──────────────┘                           │
│                 │                                           │
│                 ▼                                           │
│  ┌──────────────────────────────┐                           │
│  │  SQLCipher PRAGMA key        │                           │
│  │  AES-256-CBC                 │                           │
│  │  PBKDF2 (64000 iterations)   │                           │
│  │  HMAC-SHA512 per page        │                           │
│  └──────────────────────────────┘                           │
│                                                              │
│  Result: Full database encryption at rest                    │
│  - Schema, data, indexes all encrypted                       │
│  - Even raw file inspection reveals nothing                  │
│  - Performance overhead: ~5-15% on typical queries           │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 E2E Backup Encryption (Phase 6)

```
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   Device       │            │   Network      │            │    Cloud      │
│                │            │                │            │               │
│  Backup data   │            │                │            │               │
│  (JSON blob)   │            │                │            │               │
│       │        │            │                │            │               │
│       ▼        │            │                │            │               │
│  Encrypt       │            │                │            │               │
│  AES-256-GCM   │            │                │            │               │
│  + Argon2id    │───────────▶│  HTTPS POST    │───────────▶│  Ciphertext   │
│  key derivation│            │  (TLS 1.3)     │            │  stored in S3 │
│       │        │            │                │            │               │
│       ▼        │            │                │            │               │
│  Key =         │            │                │            │  Server has   │
│  Hash(pass     │            │                │            │  ZERO ability │
│  phrase + salt)│            │                │            │  to decrypt   │
│                │            │                │            │               │
│  Salt stored   │            │                │            │               │
│  with blob     │            │                │            │               │
└───────────────┘            └───────────────┘            └───────────────┘
```

### 10.3 Key Management

| Key Purpose | Storage | Derivation | Rotation |
|---|---|---|---|
| **SQLCipher DB key** | iOS: Keychain (kSecClassGenericPassword) | Random 256-bit, generated on first launch | App reinstall only |
| **Backup encryption key** | Not stored — derived from user passphrase each time | Argon2id(passphrase + salt), 128MB memory, 3 iterations | Every backup generates new salt |
| **Biometric app lock key** | iOS: Keychain with biometric ACL | Random 128-bit, stored as access control | User disable/reset |
| **TLS session keys** | OS-managed | Standard TLS 1.3 handshake | Per session |

### 10.4 Authentication (Phase 6)

```typescript
// Zero-knowledge password verification
interface AuthService {
  // On account creation:
  // 1. User provides email + passphrase
  // 2. Device computes: verifier = SHA-256(Argon2id(passphrase, salt))
  // 3. Server stores: email, salt, verifier_hash (double-hashed)
  // 4. Server NEVER receives passphrase

  createAccount(email: string, passphrase: string): Promise<void>;

  // On login:
  // 1. Server sends salt for this email
  // 2. Device computes: proof = Argon2id(passphrase, salt)
  // 3. Device sends: SHA-256(proof) to server
  // 4. Server compares with stored verifier_hash
  login(email: string, passphrase: string): Promise<SessionToken>;

  // Passwordless (magic link):
  requestMagicLink(email: string): Promise<void>;
  verifyMagicLink(token: string): Promise<SessionToken>;
}
```

---

## 11. Offline Architecture

### 11.1 Core Principle

Masroof is **offline-first**, not offline-only. The device is the primary compute and storage node. The cloud (Phase 6) is a replica for backup and multi-device sync.

### 11.2 What Works Offline (Phase 1–5)

| Feature | Offline Capability | Mechanism |
|---|---|---|
| Voice recording | ✅ Full | Local audio capture, no network |
| Speech transcription | ✅ Full | On-device Whisper.cpp |
| NLU extraction | ✅ Full | On-device Gemma 3n |
| Structured expense display | ✅ Full | SQLite queries |
| Search & history | ✅ Full | SQLite FTS5 |
| Analytics computation | ✅ Full | Local aggregation from SQLite |
| Notification reminders | ✅ Full | expo-notifications local scheduling |
| Voice correction | ✅ Full | On-device pipeline |
| Data export (JSON/CSV) | ✅ Full | Local file generation |
| Normalization | ✅ Full | Local LLM + rule-based |
| **Cloud backup** | ❌ (graceful degradation) | Hide backup UI; show "Available when online" |
| **Multi-device sync** | ❌ (graceful degradation) | Last-sync timestamp; queue changes locally |

### 11.3 Sync Strategy (Phase 6)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SYNC STRATEGY                                    │
│                                                                          │
│  Architecture: Device-primary with cloud replica                        │
│  Sync direction: Device → Cloud (backup), Cloud → Device (restore)      │
│                                                                          │
│  Backup flow:                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. Export local DB to JSON (transactionally consistent snapshot)│   │
│  │  2. Collect new/changed audio files since last backup            │   │
│  │  3. Build manifest with checksums (SHA-256 per file + overall)   │   │
│  │  4. Encrypt payload with user's key (AES-256-GCM)                │   │
│  │  5. Upload to S3 via NestJS presigned URL                        │   │
│  │  6. Record backup metadata locally + in PostgreSQL               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Conflict resolution: Last-write-wins (LWW)                             │
│  - Each record has updated_at timestamp                                │
│  - During restore: compare updated_at; keep most recent                │
│  - Change log table for audit: who changed what, when                  │
│                                                                          │
│  Restore options:                                                        │
│  - Full replace: wipe local DB, restore from snapshot                   │
│  - Selective merge: restore specific categories or date ranges          │
│  - Preview before restore: show summary of what will change             │
└────────────────────────────────────────────────────────────────────────┘
```

### 11.4 Data Locality Decision

| Data Type | Primary Location | Cloud Copy | Rationale |
|---|---|---|---|
| Audio recordings | Device file system | Phase 6 (encrypted) | Large files; need immediate access for playback |
| Transcriptions | SQLite | Phase 6 (in backup JSON) | Small, fast queries |
| Structured expenses | SQLite | Phase 6 (in backup JSON) | Primary analytics data |
| Normalization mappings | SQLite | Phase 6 (in backup JSON) | User-specific normalization |
| Budgets | SQLite | Phase 6 (in backup JSON) | User configuration |
| Reminder config | SQLite (expo-notifications) | Not backed up | Device-specific scheduling |
| ML models | Device file system (models/) | Not backed up | Redownload from CDN if needed |
| Settings | SQLite (settings table) | Phase 6 (in backup JSON) | User preferences |

---

## 12. Performance Design

### 12.1 Caching Strategy

| Layer | Strategy | Invalidation |
|---|---|---|
| **SQLite queries** | Prepared statements for frequent queries (daily total, category breakdown) | None — SQLite cache is LRU by page |
| **Analytics results** | Materialized daily snapshot in `daily_spending_log` table | Recompute on new expense save + 5min debounce |
| **Model weights** | Keep in memory while app is foregrounded; mmap() for fast load | Unload on memory warning |
| **Audio waveform** | Pre-computed low-res waveform for list view; full-res on detail view | Regenerated if audio file changes (never) |
| **Image assets** | expo-asset bundling; no runtime caching needed | N/A |
| **Network responses** | Not applicable (offline-first; cloud is Phase 6) | N/A |

### 12.2 Model Quantization

| Model | Full Precision | Quantized | Size Reduction | Accuracy Impact |
|---|---|---|---|---|
| Whisper small | float16 ~920MB | q5_1 ~460MB | 50% | <1% WER degradation |
| Whisper large-v3 | float16 ~3.1GB | q5_0 ~1.2GB | 61% | <2% WER degradation |
| Gemma 3n | float16 ~7GB | 4-bit ~2.2GB | 68% | ~1-3% task accuracy loss |

### 12.3 Lazy Loading & Progressive Enhancement

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PROGRESSIVE LOADING                                │
│                                                                          │
│  App Start (cold):                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  T0: Splash screen (Expo default splash)                         │   │
│  │  T0: Initialize SQLCipher DB (load keychain key)                 │   │
│  │  T0: Load settings from SQLite                                    │   │
│  │  T1: Render home screen (no model loaded)                        │   │
│  │  T2: Preload Whisper model in background (if enough RAM)         │   │
│  │  T3: Show "Ready" state — mic button fully functional            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Recording flow:                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  T0: Tap mic → AudioSession.start() → immediate UI response      │   │
│  │  T0: Begin recording (waveform animates)                         │   │
│  │  T1: If model not loaded: start loading, show "Preparing..."     │   │
│  │  T2: Stop recording → Whisper inference begins                   │   │
│  │  T3: Transcription returned → Gemma extraction begins            │   │
│  │  T4: Result displayed (total <10s target)                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Background work (idle priority):                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  • Normalization resolution for new expenses                     │   │
│  │  • Analytics pre-computation (daily spending log)                 │   │
│  │  • Audio file pruning (delete files older than 90 days)          │   │
│  │  • Model update check (app store review)                         │   │
│  │  • Export compilation (if PDF requested)                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.4 Batch Processing

| Operation | Trigger | Batch Window | Notes |
|---|---|---|---|
| **Daily spending log update** | New expense saved | Inline (single query) | Lightweight; no delay needed |
| **Normalization of pending aliases** | 10+ new unresolved entities | Background, 5s debounce | Called from normalization engine |
| **Analytics materialization** | Expense saved + 5s debounce | Background, max 500ms | Update daily_spending_log + aggregate tables |
| **Audio file pruning** | App background + 24h since last | Background, max 2s | Configurable retention period |
| **Backup (Phase 6)** | Schedule-based or manual | Foreground (with progress) | Long-running; show progress bar |

### 12.5 Power Optimization

| Technique | Impact |
|---|---|
| **Whisper inference on NPU** (ANE on iOS, NNAPI on Android) | 3-5x faster than CPU, ~60% less energy |
| **Audio VAD before inference** | Avoids processing silence; ~30% less inference per recording |
| **Gemma speculative decoding** | ~2x faster decoding for structured JSON output |
| **Idle model unloading** | Save ~500MB RAM when app backgrounded |
| **Batch normalization** | Queue + debounce avoids per-expense LLM calls |

---

## 13. Reminder System Architecture

### 13.1 Local Notification Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      REMINDER SYSTEM (Phase 1–5)                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  NotificationService (src/services/notifications.ts)            │    │
│  │                                                                  │    │
│  │  Responsibilities:                                              │    │
│  │  • Schedule local notifications based on reminder_config        │    │
│  │  • Implement suppression logic (recent activity check)          │    │
│  │  • Handle notification tap (deep-link to recording screen)      │    │
│  │  • Track fired vs. suppressed reminders for analytics           │    │
│  │  • Daily cap enforcement (max 3/day)                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Notification Flow                                               │    │
│  │                                                                  │    │
│  │  1. App startup / foreground:                                    │    │
│  │     → Cancel all existing scheduled notifications                │    │
│  │     → Read reminder_config from SQLite                           │    │
│  │     → For each enabled slot:                                     │    │
│  │       → Check if within quiet hours → skip if yes               │    │
│  │       → Schedule via expo-notifications scheduleNotificationAsync│    │
│  │       → Store notification IDs in SQLite for later cancellation  │    │
│  │                                                                  │    │
│  │  2. At fire time (iOS/Android deliver notification):             │    │
│  │     → Before showing: run suppression check                      │    │
│  │       (how? iOS: use UNNotificationServiceExtension to check)    │    │
│  │       → On Android: expo-notifications handles locally           │    │
│  │     → If suppressed: remove notification silently, log event     │    │
│  │     → If shown: present with deep-link payload                   │    │
│  │                                                                  │    │
│  │  3. User taps notification:                                      │    │
│  │     → expo-router navigates to /record screen                    │    │
│  │     → Microphone activates immediately (or after 500ms animation)│    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Suppression Logic Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  SUPPRESSION LOGIC (REQ-1.7)                             │
│                                                                          │
│  Trigger: Reminder about to fire at slot S (time T)                     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Check 1: Has any expense been recorded in last 120 minutes?    │    │
│  │                                                                  │    │
│  │  SELECT COUNT(*) FROM expense                                    │    │
│  │  WHERE created_at >= datetime('now', '-120 minutes')             │    │
│  │                                                                  │    │
│  │  If count > 0 → SUPPRESS this reminder                          │    │
│  │  If count = 0 → PROCEED to fire notification                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Check 2: Daily cap (REQ-1.9)                                    │    │
│  │                                                                  │    │
│  │  SELECT COUNT(*) FROM notification_logs                         │    │
│  │  WHERE date = today AND type = 'reminder' AND was_shown = 1     │    │
│  │                                                                  │    │
│  │  If count >= 3 → SUPPRESS (cap reached)                         │    │
│  │  If count < 3 → PROCEED                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Note: Suppression is per-slot. Suppressed 1:30PM does not cancel       │
│  7:00PM. The 120-min window is rolling.                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.3 Adaptive Timing Algorithm (Phase 5)

```typescript
interface AdaptiveTimingService {
  analyzePatterns(): Promise<TimeShiftSuggestion[]>;
  suggestShift(currentSlot: ReminderConfig): Promise<TimeShiftSuggestion | null>;
  acceptShift(suggestionId: string): Promise<void>;
  declineShift(suggestionId: string): Promise<void>;
}

interface TimeShiftSuggestion {
  currentSlot: ReminderConfig;
  suggestedHour: number;
  suggestedMinute: number;
  confidence: number;          // how clear is the peak?
  recordingsInPeak: number;    // how many recordings in peak bucket
  totalRecordings: number;     // total recordings in analysis window
  messageAr: string;           // "عادةً بتسجل مصروفاتك حوالي ٨:٤٥ الصبح..."
  messageEn: string;           // "You usually log expenses around 8:45 AM..."
}
```

### 13.4 Spending Pulse Notification (Phase 5)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SPENDING PULSE (REQ-5.7)                              │
│                                                                          │
│  Schedule: Daily, evening (configurable, default 8:00 PM)              │
│  Precondition: User has recorded ≥1 expense today                      │
│                                                                          │
│  Content generation:                                                     │
│  1. Compute today_total = SUM(expense.amount) WHERE date = today       │
│  2. Compute daily_avg = AVG(expense.amount) OVER (last 30 days)        │
│  3. Compute pct_diff = (today_total - daily_avg) / daily_avg * 100     │
│  4. Select template:                                                     │
│     ┌──────────────────────────────────────────────────────────────┐   │
│     │  pct_diff > +20%: "Today: XXX EGP · +Y% above your average" │   │
│     │  pct_diff < -20%: "Today: XXX EGP · Y% below average 👍"    │   │
│     │  otherwise:     "Today: XXX EGP · Your daily average: YYY"  │   │
│     └──────────────────────────────────────────────────────────────┘   │
│  5. Deep-link: tap → /analytics/daily?date=today                       │
│                                                                          │
│  Suppression rules:                                                      │
│  - Do NOT fire if user has 0 expenses today (avoid discouragement)      │
│  - Do NOT fire if user has not used app in 7+ days (re-engagement       │
│    handled by reminder, not pulse)                                      │
│  - Respect quiet hours                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.5 Notification Categories

| Category | Identifier | Action | Phase |
|---|---|---|---|
| **Reminder** | `masroof_reminder` | Tap → /record | 1 |
| **Spending Pulse** | `masroof_pulse` | Tap → /analytics/daily | 5 |
| **Budget Alert** | `masroof_budget` | Tap → /analytics/budget/[id] | 5 |
| **Inflation Alert** | `masroof_inflation` | Tap → /analytics/product/[id] | 3 |
| **Backup Complete** | `masroof_backup` | Tap → /settings/backup | 6 |

---

## 14. Phase 6 Cloud Architecture

### 14.1 NestJS Service Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLOUD BACKEND (NestJS)                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  API Gateway (REST over HTTPS)                                   │   │
│  │  • Rate limiting: 100 req/min per user                           │   │
│  │  • Authentication: JWT (access + refresh tokens)                 │   │
│  │  • CORS: mobile app only                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Authentication Module                                            │   │
│  │  • POST /auth/register    — Create account (email + verifier)    │   │
│  │  • POST /auth/login       — Authenticate (zero-knowledge proof)  │   │
│  │  • POST /auth/magic-link  — Request passwordless login           │   │
│  │  • POST /auth/refresh     — Refresh access token                 │   │
│  │  • DELETE /auth/account   — Delete account + all data            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Backup Module                                                    │   │
│  │  • POST /backup/start       — Initiate backup (returns presigned │   │
│  │                                upload URL)                       │   │
│  │  • POST /backup/complete    — Confirm backup upload complete     │   │
│  │  • GET  /backup/list        — List available backups             │   │
│  │  • GET  /backup/:id/metadata— Get backup manifest (size, date,   │   │
│  │                                entity counts, checksum)          │   │
│  │  • POST /backup/:id/restore — Request restore (returns presigned │   │
│  │                                download URL)                     │   │
│  │  • DELETE /backup/:id       — Delete a specific backup           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Device Management Module                                         │   │
│  │  • GET  /devices            — List linked devices                │   │
│  │  • POST /devices/register   — Register this device               │   │
│  │  • DELETE /devices/:id      — Revoke device access               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Premium Subscription Module (Future)                             │   │
│  │  • GET  /subscription        — Current plan & status             │   │
│  │  • POST /subscription/iap    — Verify in-app purchase receipt     │   │
│  │  • POST /subscription/cancel — Cancel auto-renewal               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 14.2 Database Schema (PostgreSQL)

```sql
-- Core account
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    verifier_hash   VARCHAR(64) NOT NULL,       -- SHA-256 of Argon2id output
    salt            VARCHAR(64) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,                  -- soft delete
    is_premium      BOOLEAN DEFAULT FALSE
);

-- Device registrations
CREATE TABLE devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID REFERENCES accounts(id),
    device_name     VARCHAR(255),
    device_type     VARCHAR(50),                  -- 'ios', 'android'
    push_token      TEXT,
    last_sync_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ                   -- if revoked
);

-- Backup metadata
CREATE TABLE backups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID REFERENCES accounts(id),
    size_bytes      BIGINT NOT NULL,
    encrypted_key   BYTEA,                         -- wrapped key (for support)
    checksum        VARCHAR(64) NOT NULL,           -- SHA-256 of plaintext
    entity_counts   JSONB,                          -- {tickets: 150, expenses: 120, ...}
    s3_key          VARCHAR(512) NOT NULL,
    version         INTEGER DEFAULT 1,             -- backup format version
    status          VARCHAR(20) DEFAULT 'pending', -- pending, complete, failed
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backups_account ON backups(account_id, created_at DESC);

-- Subscription/payment records (future)
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID REFERENCES accounts(id),
    plan            VARCHAR(50) NOT NULL,          -- 'monthly', 'annual'
    provider        VARCHAR(50),                   -- 'app_store', 'play_store'
    receipt_data    TEXT,
    valid_until     TIMESTAMPTZ NOT NULL,
    auto_renew      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 14.3 Backup/Restore Flow

```
┌───────────────┐         ┌────────────────┐         ┌────────────────┐
│   Mobile App  │         │   NestJS API   │         │   S3 Storage   │
└──────┬────────┘         └───────┬────────┘         └───────┬────────┘
       │                         │                          │
       │  POST /backup/start     │                          │
       │────────────────────────▶│                          │
       │                         │  Generate presigned PUT  │
       │                         │  URL (valid 15 min)      │
       │  { upload_url,          │                          │
       │    backup_id }          │                          │
       │◀────────────────────────│                          │
       │                         │                          │
       │  PUT {encrypted blob}   │                          │
       │  to upload_url          │                          │
       │───────────────────────────────────────────────────▶│
       │                         │                          │
       │  201 Created            │                          │
       │◀──────────────────────────────────────────────────│
       │                         │                          │
       │  POST /backup/complete  │                          │
       │  { backup_id,           │                          │
       │    checksum,            │                          │
       │    size_bytes }         │                          │
       │────────────────────────▶│                          │
       │                         │  Verify checksum         │
       │                         │  Update backup metadata  │
       │  { status: "complete" } │                          │
       │◀────────────────────────│                          │
       │                         │                          │
```

### 14.4 Cloud Infrastructure (Target Deployment)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT TOPOLOGY (Phase 6)                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Google Cloud Run (or AWS ECS Fargate)                              │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                │  │
│  │  │  NestJS API          │  │  NestJS API          │                │  │
│  │  │  (container)         │  │  (container)         │                │  │
│  │  │  min: 2, max: 10     │  │  min: 2, max: 10     │                │  │
│  │  └──────────────────────┘  └──────────────────────┘                │  │
│  │                                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  Cloud Load Balancer (HTTPS, TLS termination at edge)       │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Managed PostgreSQL (Cloud SQL / RDS)                               │  │
│  │  • db.t4g.micro (dev), db.t4g.small (prod)                         │  │
│  │  • Automated backups: daily, 7-day retention                       │  │
│  │  • Point-in-time recovery enabled                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  S3-Compatible Object Storage (Cloud Storage / S3)                  │  │
│  │  • Bucket: masroof-backup-{env}                                     │  │
│  │  • Lifecycle: auto-delete backups older than 6 months (free tier)   │  │
│  │  • Server-side encryption: AES-256 (customer keys optional)         │  │
│  │  • Presigned URLs for upload/download (no direct client access)     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Deployment Architecture

### 15.1 Build Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BUILD PIPELINE                                   │
│                                                                          │
│  Developer pushes to main ──▶ GitHub Actions (or EAS)                   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Step 1: Lint & Type Check                                      │   │
│  │  • npm run lint (expo lint)                                     │   │
│  │  • TypeScript strict check (tsc --noEmit)                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Step 2: Unit Tests (if available)                               │   │
│  │  • npm run test (Jest + React Native Testing Library)            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Step 3: Build (EAS Build)                                      │   │
│  │  • eas build --platform ios --profile production                 │   │
│  │  • eas build --platform android --profile production             │   │
│  │  • Result: .ipa + .aab binaries                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Step 4: Submit to Stores (EAS Submit)                           │   │
│  │  • eas submit --platform ios                                     │   │
│  │  • eas submit --platform android                                 │   │
│  │  • TestFlight / Internal Testing track                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.2 Release Strategy

| Phase | Channel | Distribution | Update Mechanism |
|---|---|---|---|
| **Alpha** | Internal | EAS Build + ad-hoc | Full build each time |
| **Beta** | TestFlight + Google Play Closed | 200–500 testers | EAS Update (OTA) for JS-only changes |
| **Production** | App Store + Google Play | Public | EAS Update (OTA) for JS; full build for native changes |

### 15.3 OTA Updates (Expo Updates)

```typescript
// app.json / app.config.ts
{
  "expo": {
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id",
      "checkAutomatically": "ON_LOAD"
    },
    "runtimeVersion": {
      "policy": "nativeVersion"   // OTA updates only when native code unchanged
    }
  }
}
```

**Update policy:**

| Change Type | Requires Store Update? | Can OTA? |
|---|---|---|
| JS/TS code (components, hooks, services) | No | ✅ EAS Update |
| expo-router route changes | No | ✅ EAS Update |
| expo-* config plugin changes | Yes | ❌ Full build |
| Native module additions | Yes | ❌ Full build |
| Model file updates (GGUF) | No | ✅ Over-the-air download (CDN) |
| SQLite schema migration | No | ✅ Rollforward migration in code |

### 15.4 Environment Matrix

| Environment | EAS Profile | API URL | Model Source | Notes |
|---|---|---|---|---|
| **Development** | `development` | localhost | Local filesystem | Metro bundler, dev client |
| **Staging** | `preview` | staging.api.masroof.app | CDN staging bucket | For QA + testers |
| **Production** | `production` | api.masroof.app | CDN production bucket | App Store binary |

---

## 16. Monitoring & Observability

### 16.1 Crash Reporting

| Tool | Integration | What It Captures |
|---|---|---|
| **Sentry** (expo-sentry) | Automatic via Sentry Expo plugin | JavaScript crashes, native crashes, breadcrumbs, user context (anonymous ID only) |
| **expo-error-recovery** | Built-in | Auto-restart on JS thread crash |

### 16.2 Performance Monitoring

| Metric | Tool | Implementation |
|---|---|---|
| **App cold start time** | Custom (Sentry transaction) | `Sentry.startTransaction({name: "app-cold-start"})` in app entry |
| **Transcription latency** | Custom metric | Time from recording stop to transcript available |
| **Extraction latency** | Custom metric | Time from transcript to structured output |
| **SQLite query performance** | Custom | Log slow queries (>100ms) to Sentry breadcrumbs |
| **Model load time** | Custom metric | Time to initialize Whisper.cpp / Gemma 3n |
| **Memory pressure** | Sentry native breadcrumbs | Automatic on iOS/Android |
| **Battery impact** | Custom (app-level) | Track recordings per battery % drop |

### 16.3 Privacy-Preserving Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   PRIVACY-PRESERVING ANALYTICS                           │
│                                                                          │
│  Principle: No personally identifiable information (PII) ever leaves     │
│  the device unless the user explicitly initiates a backup.               │
│                                                                          │
│  What we track (anonymous only):                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  • App opens (session start/end, no user ID)                    │   │
│  │  • Recording events (count, duration buckets, not transcript)   │   │
│  │  • Transcription latency (aggregate, not per-transcript)        │   │
│  │  • Extraction confidence distribution (histogram, not values)   │   │
│  │  • Review screen interactions (accept/edit/voice-correction)    │   │
│  │  • Notification action rates (fired vs. tapped)                │   │
│  │  • Screen transitions (navigation timing, not path)            │   │
│  │  • Error rates (crashes, failed transcriptions, failed extracts)│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  What we NEVER track:                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ❌ Audio recordings                                              │   │
│  │  ❌ Transcript text                                               │   │
│  │  ❌ Expense amounts or merchant names                             │   │
│  │  ❌ User email or device identifiers                              │   │
│  │  ❌ Location data                                                 │   │
│  │  ❌ IP addresses (anonymized at network level)                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Tool: PostHog (self-hosted or EU cloud) with on-device filtering       │
│  • All events logged to local SQLite first                             │
│  • Batch upload every 15 mins (if online)                              │
│  • Events contain only aggregate/numeric data                          │
│  • User opt-out at any time in Settings                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.4 Logging Strategy

| Log Level | Events | Destination | Retention |
|---|---|---|---|
| **ERROR** | Crashes, failed recordings, failed transcriptions, DB errors | Sentry + local log file | 30 days local |
| **WARN** | Slow queries, model load failures, suppressed notifications | Sentry + local log file | 7 days local |
| **INFO** | Recording start/stop, extraction complete, backup complete | Local log file only | 7 days |
| **DEBUG** | Detailed pipeline timing, model outputs (dev builds only) | Console + local log file | Not in production |

---

## 17. Key Technical Decisions & Trade-offs

| ID | Decision | Chosen Approach | Alternatives Considered | Rationale |
|---|---|---|---|---|
| **T-01** | **AI inference location** | On-device (Whisper.cpp + Gemma 3n) | Cloud API (OpenAI Whisper + GPT-4o) | Privacy, offline capability, no recurring API costs. Trade-off: larger app bundle, slower model iteration |
| **T-02** | **Local database** | SQLite via SQLCipher (raw expo-sqlite) | WatermelonDB, Realm, MMKV | SQLite: mature, single-file backup, excellent query capabilities. SQLCipher: battle-tested encryption. WatermelonDB adds reactive layer but is another dependency |
| **T-03** | **Notification system** | Local (expo-notifications) Phase 1–5 | Remote push (FCM/APNs) | Offline-first requirement. Local notifications work without internet. Remote push adds server complexity unnecessary for Phase 1–5 |
| **T-04** | **Expo managed vs bare** | Expo SDK 56 managed | Bare React Native (expo prebuild) | Development velocity. OTA updates. If native modules block us, we drop to dev client or prebuild. Not a permanent commitment |
| **T-05** | **LLM model size** | Gemma 3n (3.6B, 4-bit quantized ~2.2GB) | Gemma 2B (~1.5GB), Phi-3-mini (~2GB), Llama 3.2 1B (~800MB) | Best accuracy-to-size ratio for Arabic NLU. 3.6B provides sufficient capacity for few-shot extraction. If device constraints arise, fallback to distilled models |
| **T-06** | **Whisper model variant** | small-q5_1 (~460MB) default, large-v3 optional | tiny (~75MB), base (~150MB), medium (~770MB) | small gives best accuracy/speed trade-off for Egyptian Arabic. tiny/base insufficient accuracy for mixed-language. large is optional download for high-accuracy users |
| **T-07** | **Normalization approach** | Hybrid: rule-based + LLM | Pure rule-based, pure LLM | Rules are fast and cheap for common cases. LLM handles edge cases and novel variants. Hybrid avoids LLM latency on 90%+ of lookups |
| **T-08** | **Backup encryption** | Client-side AES-256-GCM, Argon2id key derivation | Server-side encryption, TLS-only | Zero-knowledge architecture. Server cannot decrypt user data under any circumstances. User controls the key |
| **T-09** | **Sync model** | Device-primary, LWW conflict resolution, pull-based | CRDT (Automerge/Yjs), server-primary | Simplicity. Local-first means device is source of truth. LWW is sufficient for personal finance (last edit wins). CRDT adds complexity without clear benefit for single-user data |
| **T-10** | **RTL approach** | Expo I18n + RTL mirroring in styles | react-native-rtl, i18n-js | Expo's built-in RTL support handles most cases. Custom layouts use `I18nManager` + mirrored style maps. Avoids third-party dependency |
| **T-11** | **Model delivery** | Download post-install (CDN) | Bundled in app binary | Binary size constraint (<80MB). Models (460MB + 2.2GB) cannot ship with app. Download on first launch with Wi-Fi. Offer optional download later |
| **T-12** | **Audio format** | WAV 16kHz 16-bit mono PCM | AAC/M4A, OPUS, FLAC | Whisper.cpp prefers raw PCM for lowest latency. No compression needed for short recordings (<30s). If storage becomes concern, add OPUS compression + decode before inference |

---

## 18. Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Contingency |
|---|---|---|---|---|---|
| **R-01** | **Whisper.cpp insufficient accuracy for Egyptian Arabic code-switching** | Medium | Critical | Beta testing with 200+ Egyptian users; collect dialect-specific utterances; fine-tune or adapt model | Fallback: text-only input mode; cloud-based transcription with privacy wrapper (user opt-in) |
| **R-02** | **Gemma 3n too slow on mid-range devices (>5s inference)** | Medium | High | 4-bit quantization; speculative decoding; target NPU/GPU acceleration | Distill to smaller model (Gemma 2B); implement progressive disclosure (show partial results) |
| **R-03** | **Model download size deters installs** | Medium | Medium | Show download progress; defer model download past onboarding; Wi-Fi-only default; explain value before download | Bundle tiny Whisper model (~75MB) for immediate use; download full model in background |
| **R-04** | **SQLCipher performance degradation with large datasets** | Low (Phase 1–4) | Medium | Index strategy; pagination; database VACUUM on schedule; archive old audio | Consider Wasm-based SQLite optimization; implement DB sharding by year |
| **R-05** | **Battery drain from on-device inference** | Medium | Medium | NPU acceleration; model unloading when backgrounded; VAD trim audio before inference; batch processing | User-configurable quality setting (fast/accurate); reduce model size on battery-saver mode |
| **R-06** | **Arabic numeral rendering inconsistencies** | Low | Medium | Cairo font covers all Unicode ranges; explicit numeral formatting with Intl.NumberFormat; comprehensive RTL test matrix | Platform-specific numeral workaround; CSS `font-variant-numeric: traditional` for Eastern Arabic |
| **R-07** | **User privacy concerns about microphone** | Low | High | Clear privacy policy; local-first architecture; transparency screen during onboarding; no audio leaves device | Allow text-only mode without microphone permission; contextual permission prompts |
| **R-08** | **expo-sqlite + SQLCipher compatibility issues** | Low | Medium | Pin compatible versions; test encryption round-trip on both platforms early | Fallback to expo-secure-store for sensitive fields; implement raw SQLCipher bindings if needed |
| **R-09** | **Notification suppression not reliable on iOS** | Medium | Medium | iOS limits local notification modification. Use `UNNotificationServiceExtension` for suppression check | Accept higher false-fire rate on iOS; rely on daily cap as backup; educate users about iOS notification settings |
| **R-10** | **Regulatory: Egyptian data protection law changes** | Low | High | Local-first architecture inherently compliant; transparent data practices; legal review before Phase 6 cloud launch | Phase 6 cloud features may need regional data residency; use Egypt-based cloud provider if required |

---

## 19. Appendices

### Appendix A: References

| Document | Source | Date |
|---|---|---|
| BRD-main.md v2.0 (BRD-001) | Product Team | 2026-06-13 |
| BRD Summary v1.0 | Product Team | 2026-06-13 |
| DESIGN.md | Design Team | Latest |
| AGENTS.md | Engineering | Latest |
| Expo SDK 56 Documentation | docs.expo.dev | 2026 |
| Whisper.cpp GitHub | ggerganov/whisper.cpp | Latest |
| Gemma 3n Documentation | ai.google.dev/gemma | 2026 |
| SQLCipher Documentation | www.zetetic.net/sqlcipher | Latest |

### Appendix B: Glossary

| Term (Arabic) | Term (English) | Definition |
|---|---|---|
| مصروف | **Masroof** | Arabic for "expense" or "allowance"; the product name |
| تذكرة | **Ticket** | A raw voice recording + transcript pair before structured extraction |
| استخلاص منظم | **Structured Extraction** | Parsing natural language into structured JSON fields (amount, merchant, category, date) |
| تفصيل | **Itemization** | Breaking down a single expense into individual products/line items |
| توحيد | **Normalization** | Converting variant names into a canonical form |
| — | **Voice-First** | Primary interaction mode is voice; UI is secondary |
| — | **Local-First** | Core functionality works offline; user owns their data |
| — | **End-to-End Encryption** | Data encrypted on-device; decrypted only by the user |
| — | **Adaptive Reminder Timing** | System learns user behavior and suggests optimized reminder schedules |
| — | **Spending Pulse** | Daily notification comparing today's spending to historical average |
| — | **Suppression Logic** | Skip reminders if expense recently logged |
| — | **Personal Inflation Tracker** | Monitors price changes for frequently purchased products |
| — | **SQLCipher** | SQLite with AES-256 encryption at rest |
| — | **Whisper.cpp** | C++ implementation of OpenAI Whisper for on-device ASR |
| — | **Gemma 3n** | Google's 3.6B parameter on-device LLM for NLU tasks |

### Appendix C: File Tree (Key Modules)

```
src/
├── app/                          # expo-router file-based routes
│   ├── index.tsx                  # Home screen (voice zone + recent tickets)
│   ├── record.tsx                 # Recording screen
│   ├── review/[id].tsx           # Expense review screen
│   ├── history.tsx               # Ticket/expense history list
│   ├── analytics/
│   │   ├── index.tsx             # Analytics dashboard
│   │   ├── daily.tsx             # Daily breakdown
│   │   ├── category/[id].tsx     # Category drill-down
│   │   └── merchant/[id].tsx     # Merchant drill-down
│   └── settings/
│       ├── index.tsx              # Settings home
│       ├── reminders.tsx          # Reminder configuration
│       ├── models.tsx             # Model management (download/delete)
│       ├── backup.tsx             # Backup settings (Phase 6)
│       └── account.tsx            # Account management (Phase 6)
├── components/                    # Shared UI components
│   ├── MicButton.tsx
│   ├── TicketCard.tsx
│   ├── ExpenseCard.tsx
│   ├── CategoryChip.tsx
│   ├── WaveformViewer.tsx
│   ├── SkeletonLoader.tsx
│   ├── ChartView.tsx
│   └── AnalyticsCard.tsx
├── services/                      # Business logic services
│   ├── recording.ts               # Audio capture + state machine
│   ├── whisper.ts                 # Whisper.cpp binding
│   ├── gemma.ts                   # Gemma 3n binding
│   ├── database.ts                # SQLCipher initialization + migrations
│   ├── notifications.ts           # Local notification scheduling
│   ├── normalization.ts           # Normalization engine (Phase 4)
│   ├── analytics.ts               # Analytics computation (Phase 5)
│   ├── backup.ts                  # Backup/restore (Phase 6)
│   └── auth.ts                    # Authentication (Phase 6)
├── hooks/                         # React hooks
│   ├── useRecording.ts
│   ├── useTicket.ts
│   ├── useExtraction.ts
│   ├── useReminders.ts
│   ├── useAnalytics.ts
│   └── useNormalization.ts
├── types/                         # TypeScript type definitions
│   ├── expense.ts
│   ├── ticket.ts
│   ├── notification.ts
│   └── analytics.ts
├── utils/                         # Utility functions
│   ├── audio.ts                   # Audio preprocessing
│   ├── locale.ts                  # RTL, numerals, date formatting
│   ├── currency.ts                # Currency parsing + formatting
│   └── confidence.ts              # Confidence scoring utilities
└── constants/
    ├── categories.ts              # Default category taxonomy
    └── reminders.ts               # Default reminder slots
```

### Appendix D: Migration Strategy by Phase

| Phase | Schema Changes | Data Migration | Model Changes |
|---|---|---|---|
| **1** | Create: ticket, reminder_config, settings | None | Download Whisper small |
| **2** | Create: expense (FK to ticket), category, merchant | Backfill expense from existing tickets | Download Gemma 3n |
| **3** | Create: item, product | Migrate existing expenses to support items | None |
| **4** | Create: normalization_map | Create canonical entities from existing data | None |
| **5** | Create: budget, daily_spending_log, recording_pattern | Compute historical aggregates | None |
| **6** | Add cloud sync metadata columns | None (cloud is new, not migration) | None |

All migrations are rollforward-only. Old schema versions are dropped after migration completion. Schema version stored in SQLite `PRAGMA user_version`.

### Appendix E: Testing Strategy

| Test Type | Scope | Tool | Frequency |
|---|---|---|---|
| **Unit tests** | Services, utilities, hooks | Jest | CI (every push) |
| **Component tests** | UI components | React Native Testing Library | CI |
| **Integration tests** | Recording → transcription → extraction pipeline | Detox (E2E) | Nightly |
| **Model accuracy tests** | Ground-truth test set (500+ utterances) | Python script (offline) | Per model update |
| **Regression tests** | Critical flows (record, review, save) | Detox | CI |
| **RTL visual tests** | All screens in RTL mode | Maestro (screenshot diff) | CI |
| **Performance tests** | Cold start, transcription latency, query speed | Custom benchmarks | Weekly |
| **Beta testing** | Real-world usage with 200–500 users | TestFlight + Play Console | Per phase |

---

*This document is a living artifact. Technology choices, component boundaries, and implementation details should evolve as the product progresses through its phases and as new information emerges from development, testing, and market feedback.*

---

**Document prepared by:** Architecture Team  
**Last updated:** 2026-06-13  
**Next review:** Upon completion of Phase 1 development or significant architectural change
