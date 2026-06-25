# Masroof (مصروف) — Business Logic Document

> **Purpose:** Bridge between BRDs/design docs and implementation. Covers screen inventory, data flows, component changes, and implementation priorities. Handoff artifact for UX design and development.
>
> **Status:** Final Draft v1.0
> **Date:** 2026-06-25
> **Author:** Product Team

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Screen Inventory & DB Contracts](#2-screen-inventory--db-contracts)
3. [Data Flows](#3-data-flows)
4. [Component Changes Needed](#4-component-changes-needed)
5. [Implementation Priority](#5-implementation-priority)
6. [Known Issues to Fix](#6-known-issues-to-fix)
7. [i18n Keys to Add](#7-i18n-keys-to-add)

---

## 1. Current State Summary

### What Already Works

| Area | Status | Notes |
|---|---|---|
| **DB layer (SQLite)** | ✅ Built & ready | 3 tables: `profiles`, `expenses`, `recordings`. Full CRUD repos exist. |
| **Whisper transcription** | ✅ Working | Groq `whisper-large-v3-turbo`, Arabic support, returns text + segments + duration |
| **Gemini extraction** | ✅ Working | Falls back through multiple models, returns `ExpenseRecord[]`, response MIME type JSON |
| **Onboarding UI** | ✅ Built | 4-slide carousel, language toggle, reminder section, dot indicators, skip/next/get-started |
| **Onboarding gate** | ✅ Built | `src/app/index.tsx` checks AsyncStorage flag → redirect to `(tabs)` or show onboarding |
| **Tab layout** | ✅ Built | Custom tab bar with 3 visible tabs (home, history, settings) + broken whisper reference |
| **Home UI** | ✅ Built | Mic button, transcription display, expense extraction display, Header component |
| **History UI** | ✅ Built | Uses `useRecordings` hook, empty state + recording list from filesystem |
| **Settings UI** | ✅ Built | 3 static rows (language, reminders, about) — non-interactive |
| **Header component** | ✅ Built | Avatar + "مرحبا, احمد" greeting — hardcoded, not reading from DB |
| **ExpenseCard** | ✅ Built | Category icon mapping, animated fade-in, confidence warning |
| **RecordingCard** | ✅ Built | Playback via `expo-audio`, delete with confirmation |
| **i18n** | ✅ Built | Arabic + English, AsyncStorage detection, full type inference |
| **Theme system** | ✅ Built | MD3 tokens, `useThemeColors()` hook, light + dark |
| **useRecordings hook** | ✅ Built | Mic lifecycle, transcription dispatch, extraction dispatch — **filesystem only, not DB** |

### What's NOT Wired

| Gap | Impact |
|---|---|
| **No DB reads on Home** | Recent expenses list doesn't exist — only shows just-recorded expenses in-memory |
| **No DB reads on History** | Recording list comes from filesystem (`expo-file-system`), not DB — no transcript/expense linkage |
| **No DB writes in recording pipeline** | After transcription + extraction, nothing is saved to SQLite |
| **No DB profile reads anywhere** | Header shows hardcoded "احمد" name; Settings doesn't reflect DB language/theme |
| **No DB writes from onboarding** | Onboarding completion only sets AsyncStorage flag — no profile created in DB |
| **Settings non-interactive** | Language toggle, reminders, theme, about — all placeholder rows |
| **Broken whisper tab** | `(tabs)/_layout.tsx` references a `whisper` screen that doesn't exist → navigation error |
| **Gemini model name invalid** | `gemini-3.5-flash` doesn't exist; should be `gemini-2.0-flash` or `gemini-1.5-flash` |
| **RTL direction conflict** | `src/i18n/index.ts` forces RTL always; `src/lib/i18n.ts` tries dynamic switching |

---

## 2. Screen Inventory & DB Contracts

### 2.1 Onboarding Gate (`src/app/index.tsx`)

| Property | Detail |
|---|---|
| **Purpose** | First screen app launches into. Checks if user completed onboarding. |
| **Current behavior** | Reads `ONBOARDING_COMPLETED_KEY` from AsyncStorage. If true → redirect to `(tabs)`. If false → show onboarding. |
| **Reads from DB** | Nothing currently. **Should read:** `getProfile()` to check if profile exists (as a secondary gate). |
| **Writes to DB** | Nothing. **Should trigger:** onboarding completion writes profile to DB. |
| **Edge cases** | AsyncStorage cleared but DB profile exists → should skip onboarding. DB profile exists but `onboarding_completed` flag missing → should treat as completed. |

**Changes needed:**
1. At app launch, read profile from DB via `getProfile()`
2. If profile exists → go directly to `(tabs)` even if AsyncStorage flag is missing
3. On onboarding completion → call `createProfile(name)` with user's name (and language from toggle)

### 2.2 Onboarding Screen (`src/screens/onBoarding/`)

| Property | Detail |
|---|---|
| **Purpose** | First-run experience: language selection, value prop, privacy promise, mic/notif setup |
| **Current behavior** | 4 slides, language toggle (Arabic/English), reminder section (add/remove times), skip→next→get-started flow. All preferences stored in AsyncStorage only. |
| **Reads from DB** | Nothing. |
| **Writes to DB** | Nothing. **Should write:** profile creation on "Get Started" tap. |
| **Data at completion** | Currently: AsyncStorage `onboarding_completed=true`, `onboarding_reminders=[...]`, language set in i18n. **Should also:** create profile in DB with name, language, theme='system', reminders_enabled. |

**Missing feature — Profile Name Input:**
- BRD requires asking the user for their name (or at minimum capturing it)
- Current onboarding has NO name input
- **UX decision needed:** Add a text input on slide 3 (or a new slide) for the user's name, OR derive a default from device info
- Recommend: Add name input on the final slide before "Get Started" — simple `TextInput` with placeholder "Your name / اسمك"

**Changes needed:**
1. Add name input field to onboarding (final slide or after language toggle)
2. On `handleFinish`: call `createProfile(name)` to persist to DB
3. On `handleFinish`: pass selected language from toggle to profile creation
4. On `handleFinish`: pass `reminders_enabled` (derived from whether reminders were added) to profile
5. On `handleFinish`: after profile creation, navigate to `(tabs)`

### 2.3 Home Tab (`src/app/(tabs)/index.tsx`)

| Property | Detail |
|---|---|
| **Purpose** | Main screen. Record expenses, see recent ones. |
| **Current behavior** | Mic button → record → transcribe → extract → show extracted expenses in-memory. Header shows hardcoded greeting. No recent expenses list. No DB reads/writes. |
| **Reads from DB** | **Should read (on mount):** `getProfile()` → display name in Header. `getAllExpenses()` → display recent expenses list below mic section. |
| **Writes to DB** | **Should write (on extraction complete):** `insertRecording()` → save recording row. `insertExpenses()` → save extracted expense rows linked via `transcript_id`. |
| **States to handle** | |
| **Loading** | Skeleton shimmer for recent expenses while DB loads (show after first expense recorded) |
| **Empty** | When no expenses: show empty state with mic button only (existing `tapToRecord` text) |
| **Has data** | Section title "آخر المصروفات" + list of ExpenseCard items from DB |
| **Error** | DB read failed → show error state with retry button |

**Changes needed:**
1. Create a new hook `useHomeData()` that loads profile + expenses from DB on mount
2. Pass profile name to Header component (replace hardcoded "احمد")
3. Add "Recent Expenses" section below mic area, populated from DB `getAllExpenses()` (limit to last 5-10)
4. After recording pipeline completes → call `insertRecording()` then `insertExpenses()` then refresh the expenses list
5. Empty state: when no expenses in DB, show mic section only

### 2.4 History Tab (`src/app/(tabs)/history.tsx`)

| Property | Detail |
|---|---|
| **Purpose** | Browse past recordings, play them back, delete them. |
| **Current behavior** | Uses `useRecordings` hook which reads from filesystem (`expo-file-system`). RecordingCard shows filename as text, not transcript. No linkage to expenses. |
| **Reads from DB** | **Should read:** `getAllRecordings()` → each recording has `id`, `transcript`, `duration_ms`, `created_at`. **Should also read:** expenses linked to each recording via `transcript_id`. |
| **Writes to DB** | **Should write (on delete):** `deleteRecording(id)` from recordings table. Cascade: also delete linked expenses or leave orphaned. |
| **States to handle** | |
| **Loading** | Skeleton shimmer while recordings load from DB |
| **Empty** | Current empty state works (icon + title + description) |
| **Has data** | FlatList of RecordingCard items sourced from DB |
| **Error** | DB read failed → show error state |

**Changes needed:**
1. Replace filesystem-based recording list in `useRecordings` with DB-based `getAllRecordings()`
2. RecordingCard: display `transcript` text from DB instead of filename
3. RecordingCard: display formatted `created_at` timestamp from DB
4. On delete: remove from DB + also delete audio file from filesystem
5. Add a "View Expenses" action on each recording card (optional P2 feature) — navigate to a detail view showing linked expenses

### 2.5 Settings Tab (`src/app/(tabs)/settings.tsx`)

| Property | Detail |
|---|---|
| **Purpose** | Configure app preferences: language, theme, reminders, about. |
| **Current behavior** | 3 static rows with icons + chevrons. Non-interactive. |
| **Reads from DB** | **Should read:** `getProfile()` → load current language, theme, reminders_enabled. |
| **Writes to DB** | **Should write:** `updateProfile()` on language change, theme toggle, reminders toggle. |
| **Settings rows (final)** | |
| 1. **Language** | Toggle Arabic/English → updates `i18n.language` + `updateProfile({ language })` + reloads app for RTL direction |
| 2. **Theme** | Toggle light/dark/system → updates profile theme + applies theme via context |
| 3. **Reminders** | Toggle on/off + configure times → updates `reminders_enabled` + schedules/cancels notifications |
| 4. **About** | Static screen with app version, credits, privacy link |

**Changes needed:**
1. **Language row:** Make tappable → open a modal/bottom sheet with Arabic/English options → on select, update i18n + DB profile + force RTL direction reload
2. **Theme row:** Add theme toggle (light/dark/system) → store in DB profile → apply via theme context
3. **Reminders row:** Make tappable → open reminder configuration sheet (reuse ReminderSection component from onboarding) → toggle enable/disable + time picker → store in DB profile + schedule/cancel notifications
4. **About row:** Navigate to a simple about screen (could be a modal or new route in the stack)
5. Load profile from DB on mount to reflect current settings

### 2.6 Profile Setup (New — After Onboarding)

**Not currently implemented.** The BRD requires asking for the user's name during or after onboarding. Current onboarding does NOT have a name field.

**Options:**
- **Option A (recommended):** Add a simple text input on the last onboarding slide before "Get Started"
- **Option B:** Show a one-time profile setup screen immediately after onboarding completion (before home screen)
- **Option C:** Use device name or a default ("User") and let them change it in Settings

**Recommendation:** Option A — add to last slide since users are already in flow.

---

## 3. Data Flows

### 3.1 Recording Pipeline (Voice → DB)

```
User taps mic
    │
    ▼
Start recording (expo-audio)
    │
User taps stop
    │
    ▼
Save audio to filesystem (/documents/recordings/{timestamp}_{id}.m4a)
    │
    ▼
Transcribe via Groq Whisper API
    │
    ├── Success → transcription text, duration_ms
    │       │
    │       ▼
    │   Extract expenses via Gemini API
    │       │
    │       ├── Success → ExpenseRecord[]
    │       │       │
    │       │       ▼
    │       │   Save to DB:
    │       │   ├── insertRecording({ id, transcript, duration_ms })
    │       │   └── insertExpenses([{ ...expense, transcript_id: recordingId }])
    │       │       │
    │       │       ▼
    │       │   Refresh Home screen (reload expenses from DB)
    │       │   Refresh History screen (reload recordings from DB)
    │       │
    │       └── Failure → show error, still save recording with empty expense list
    │
    └── Failure → show transcription error, do not save to DB
```

**Implementation changes to `useRecordings` hook:**
1. After transcription succeeds → save recording to DB via `insertRecording()`
2. After extraction succeeds → save expenses to DB via `insertExpenses()` with `transcript_id`
3. After pipeline completes → emit a refresh signal (or use a shared DB query layer)
4. The hook currently does NOT interact with DB at all

### 3.2 Onboarding Flow (First Launch → Profile Created)

```
App launch
    │
    ▼
Check: profile exists in DB?  
    │
    ├── Yes → redirect to (tabs)
    │
    └── No → Check: onboarding_completed in AsyncStorage?
            │
            ├── Yes (edge case: DB was cleared) → redirect to (tabs)
            │
            └── No → Show OnboardingCarousel
                        │
                    [Slide 0: Language Toggle]
                        │
                    [Slide 1: Voice Value Prop]
                        │
                    [Slide 2: Privacy]
                        │
                    [Slide 3: Name Input + Reminders + Get Started]
                        │
                        ▼
                    User taps "Get Started"
                        │
                        ▼
                    createProfile({
                        name: from text input,
                        language: from toggle,
                        theme: 'system',
                        reminders_enabled: hasReminders ? 1 : 0
                    })
                        │
                        ▼
                    Save onboarding_completed = true (AsyncStorage)
                        │
                        ▼
                    Navigate to (tabs) → Home
```

### 3.3 Settings → Profile Update Flow

```
User opens Settings
    │
    ▼
getProfile() → load current language, theme, reminders_enabled
    │
    ▼
Display current settings in UI

── Language Change ──
User taps Language → selects Arabic/English
    │
    ▼
i18n.changeLanguage(lang) + setDirection(dir)
updateProfile({ language: lang })
Reload app for RTL change (Updates.reloadAsync())

── Theme Change ──
User taps Theme → toggles light/dark/system
    │
    ▼
updateProfile({ theme: newTheme })
Apply theme via context provider

── Reminders Change ──
User taps Reminders → toggles on/off or adds/removes times
    │
    ▼
updateProfile({ reminders_enabled: 0|1 })
Schedule/cancel notifications reactively
```

### 3.4 App Launch Flow (Every Subsequent Launch)

```
App launch
    │
    ▼
Init DB via getDb()
    │
    ▼
Read profile from DB via getProfile()
    │
    ├── Profile exists:
    │       ├── Apply stored language → i18n.changeLanguage(profile.language)
    │       ├── Apply stored theme → setTheme(profile.theme)
    │       └── Show home screen (skip onboarding)
    │
    └── No profile exists:
            └── Show onboarding (first launch or data wipe)
```

---

## 4. Component Changes Needed

### 4.1 New Components to Create

| Component | File | Purpose | Priority |
|---|---|---|---|
| `useHomeData` hook | `src/hooks/useHomeData.ts` | Loads profile + recent expenses from DB, provides refresh function | P0 |
| `ProfileNameInput` | `src/components/ProfileNameInput.tsx` | Text input for user's name on onboarding slide 3 | P1 |
| `SettingsLanguageSheet` | `src/components/settings/LanguageSheet.tsx` | Bottom sheet/modal for language selection in settings | P1 |
| `SettingsThemePicker` | `src/components/settings/ThemePicker.tsx` | Theme selector (light/dark/system) | P2 |
| `SettingsReminderSheet` | `src/components/settings/ReminderSheet.tsx` | Reminder configuration (reuse ReminderSection logic) | P1 |
| `AboutScreen` | `src/app/about.tsx` | Simple about/info screen | P2 |

### 4.2 Components to Modify

| Component | Changes | Priority |
|---|---|---|
| **`src/app/index.tsx`** (onboarding gate) | Add DB profile check alongside AsyncStorage flag. On `handleFinish`, call `createProfile()`. | P0 |
| **`src/hooks/useRecorings.ts`** | Add DB integration: after transcription → `insertRecording()`, after extraction → `insertExpenses()`. Rename file to fix typo (`useRecordings.ts`). | P0 |
| **`src/app/(tabs)/_layout.tsx`** | Remove broken `whisper` tab reference. Only 3 tabs: index, history, settings. | P0 |
| **`src/components/Header.tsx`** | Accept `name` prop from parent instead of hardcoded "احمد". Accept `avatarUri` prop. | P0 |
| **`src/app/(tabs)/index.tsx`** (Home) | Add recent expenses section from DB. Pass profile name to Header. Add empty state. | P0 |
| **`src/app/(tabs)/history.tsx`** | Switch from filesystem-based to DB-based recordings. Display transcript from DB. | P0 |
| **`src/components/cards/RecordingCard.tsx`** | Accept `transcript`, `createdAt` as props (from `RecordingRow`). Display transcript text. | P0 |
| **`src/types/index.d.ts`** | Update `IRecording` interface to match `RecordingRow` from DB (add `transcript`, `durationMs`, `createdAt`, remove `text`, `time`). | P0 |
| **`src/app/(tabs)/settings.tsx`** | Make rows interactive. Wire to DB profile. Add theme toggle. | P1 |
| **`src/screens/onBoarding/index.tsx`** | Add name input. Wire `handleFinish` to call `createProfile()`. | P1 |
| **`src/i18n/index.ts`** | Resolve RTL direction conflict: dynamic switching based on stored language (remove the forced `isRTL = true`). | P1 |
| **`src/services/gemini.ts`** | Fix model name: `gemini-3.5-flash` → `gemini-2.0-flash` (or remove invalid entry). | P1 |
| **`src/screens/onBoarding/constants.ts`** | Update SLIDE_COUNT if adding name input (either new slide or extend slide 3). | P1 |

### 4.3 UI States Per Screen

| Screen | Loading | Empty | Has Data | Error |
|---|---|---|---|---|
| **Home** | Skeleton shimmer for expenses | Mic button + "Tap to record" text (existing) | Mic + recent expenses list | Error toast + retry |
| **History** | Skeleton for recordings list | Archive icon + empty text (existing) | RecordingCard FlatList | Error toast + retry |
| **Settings** | None (reads are sync-fast) | N/A (always has rows) | Rows with current values | Error toast for save failures |
| **Onboarding** | None (offline, instant) | N/A | Slide content + name input | Permission errors handled inline |

---

## 5. Implementation Priority

### Phase 1 — Core Data Wiring (P0) — ~3 days

**Goal:** Make the app functional end-to-end with real data persistence.

| # | Task | Files affected | Dependency |
|---|---|---|---|
| 1 | **Fix tab layout** — remove broken `whisper` tab reference | `src/app/(tabs)/_layout.tsx` | None |
| 2 | **Wire recording pipeline to DB** — after transcription → `insertRecording()`, after extraction → `insertExpenses()` | `src/hooks/useRecorings.ts`, `src/app/(tabs)/index.tsx` | #1 |
| 3 | **Wire Home to DB** — load `getProfile()` + `getAllExpenses()` on mount, show recent expenses | `src/hooks/useHomeData.ts` (new), `src/app/(tabs)/index.tsx`, `src/components/Header.tsx` | #2 |
| 4 | **Wire History to DB** — replace filesystem list with `getAllRecordings()`, display transcripts | `src/app/(tabs)/history.tsx`, `src/components/cards/RecordingCard.tsx`, `src/types/index.d.ts` | #2 |
| 5 | **Wire onboarding to DB** — `createProfile()` on completion, pass name + language | `src/app/index.tsx`, `src/screens/onBoarding/index.tsx` | None |

### Phase 2 — Onboarding Name Input & Profile Setup (P1) — ~1 day

| # | Task | Files affected |
|---|---|---|
| 6 | Add name `TextInput` to onboarding slide 3 | `src/screens/onBoarding/index.tsx`, `src/screens/onBoarding/SlideContent.tsx` |
| 7 | Pass name + language + reminders to `createProfile()` on completion | `src/screens/onBoarding/index.tsx`, `src/app/index.tsx` |

### Phase 3 — Interactive Settings (P1) — ~2 days

| # | Task | Files affected |
|---|---|---|
| 8 | Implement language switch in Settings | `src/app/(tabs)/settings.tsx`, `src/i18n/index.ts` |
| 9 | Implement reminders toggle in Settings (reuse onboarding logic) | `src/app/(tabs)/settings.tsx` |
| 10 | Implement theme toggle (light/dark/system) | `src/app/(tabs)/settings.tsx`, `src/app/_layout.tsx` |
| 11 | Implement About screen | `src/app/about.tsx` (new) |

### Phase 4 — Polish & Fixes (P1-P2) — ~1 day

| # | Task | Priority |
|---|---|---|
| 12 | Fix Gemini model name: `gemini-3.5-flash` → `gemini-2.0-flash` | P1 |
| 13 | Resolve RTL direction conflict between `src/i18n/index.ts` and `src/lib/i18n.ts` | P1 |
| 14 | Add proper loading/error states for all DB operations | P1 |
| 15 | Fix typo: rename `useRecorings.ts` → `useRecordings.ts` | P2 |
| 16 | Add missing i18n keys (`recordings.noTranscription`, `recordings.transcribing`) | P1 |
| 17 | Refactor `languagePicker.tsx` to use tokens (not hardcoded colors) | P2 |

---

## 6. Known Issues to Fix

These must be addressed before or during implementation:

| # | Issue | File(s) | Fix |
|---|---|---|---|
| 1 | **Missing whisper tab** — causes navigation crash | `src/app/(tabs)/_layout.tsx` | Remove `<Tabs.Screen name="whisper" />` |
| 2 | **Broken Gemini model** — `gemini-3.5-flash` doesn't exist | `src/services/gemini.ts` Line 67 | Change to `gemini-2.0-flash` or remove from list |
| 3 | **RTL forced always** — `isRTL = true` hardcoded | `src/i18n/index.ts` Line 12 | Use dynamic detection from stored language |
| 4 | **RTL direction conflict** — two files managing RTL | `src/i18n/index.ts` vs `src/lib/i18n.ts` | Unify into one; the i18n setup should own it |
| 5 | **Filename typo** — `useRecorings.ts` | `src/hooks/useRecorings.ts` | Rename to `useRecordings.ts` |
| 6 | **Hardcoded colors in component** — `languagePicker.tsx` | `src/components/languagePicker.tsx` | Refactor to use NativeWind tokens |
| 7 | **Theme label swapped** — `:root` labeled "dark" but uses light values | `src/app/global.css` | Swap the comments/variable names to match actual values |
| 8 | **Missing i18n keys** — referenced but not defined | Arabic: `recordings.noTranscription`, `recordings.transcribing` | Add keys to translations |
| 9 | **Env file tracked** — `.env` committed in git | `.env` | Add to `.gitignore` |
| 10 | **IRecording type mismatch** — doesn't match DB schema | `src/types/index.d.ts` | Align with `RecordingRow` from `src/db/recording-repo.ts` |

---

## 7. i18n Keys to Add

The following keys are referenced in the codebase but missing from translations:

| Key | Arabic | English |
|---|---|---|
| `recordings.noTranscription` | اضغط على الميكروفون للتسجيل | Tap the microphone to record |
| `recordings.transcribing` | جاري نسخ الصوت... | Transcribing... |
| `home.extractingExpense` | جاري تحليل المصروف... | Extracting expense... |

**Keys needed for new features:**

| Key | Arabic | English |
|---|---|---|
| `settings.theme` | المظهر | Theme |
| `settings.theme.light` | فاتح | Light |
| `settings.theme.dark` | داكن | Dark |
| `settings.theme.system` | تلقائي | System |
| `settings.notifications` | الإشعارات | Notifications |
| `settings.notifications.enabled` | مفعلة | Enabled |
| `settings.notifications.disabled` | معطلة | Disabled |
| `settings.languageChanged` | تم تغيير اللغة إلى {{language}} | Language changed to {{language}} |
| `common.retry` | حاول مرة أخرى | Try again |
| `common.error` | حدث خطأ ما | Something went wrong |
| `home.recentExpenses` | آخر المصروفات | Recent Expenses |
| `profile.enterName` | أدخل اسمك | Enter your name |
| `profile.namePlaceholder` | اسمك (مثال: أحمد) | Your name (e.g., Ahmed) |

---

## Appendix A: DB Table Reference

### `profiles` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | INTEGER | `1` | Single-row table (singleton) |
| `name` | TEXT | — | User's display name |
| `avatar_uri` | TEXT | `null` | Optional avatar image path |
| `language` | TEXT | `'ar'` | `'ar'` or `'en'` |
| `theme` | TEXT | `'system'` | `'light'`, `'dark'`, or `'system'` |
| `reminders_enabled` | INTEGER | `1` | `0` or `1` |
| `created_at` | TEXT | — | ISO 8601 |
| `updated_at` | TEXT | — | ISO 8601 |

### `expenses` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | INTEGER | AUTOINCREMENT | PK |
| `item` | TEXT | — | What was paid for |
| `price` | REAL | — | Amount spent |
| `currency` | TEXT | `'جنيه'` | Currency code/name |
| `sub_category` | TEXT | — | Specific category |
| `main_category` | TEXT | — | Broad category |
| `description` | TEXT | — | Arabic description |
| `confidence` | REAL | `0` | 0.0–1.0 |
| `merchant` | TEXT | `null` | Store/merchant name |
| `transcript_id` | TEXT | `null` | FK → recordings.id |
| `created_at` | TEXT | — | ISO 8601 |
| `updated_at` | TEXT | — | ISO 8601 |

### `recordings` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | TEXT | — | UUID or timestamp-based, PK |
| `transcript` | TEXT | — | Whisper transcription |
| `duration_ms` | INTEGER | `0` | Recording duration in ms |
| `created_at` | TEXT | — | ISO 8601 |

---

## Appendix B: Wireframe Reference (Screen-by-Screen)

### Home Screen (After DB Wiring)

```
┌──────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}            │  ← Header (from DB profile)
├──────────────────────────────────────┤
│                                      │
│           [ 🎤 Mic Button ]          │  ← 80dp, bg-primary
│           اضغط للتسجيل               │
│                                      │
│  ──── آخر المصروفات ────             │  ← Section if expenses exist
│  ┌──────────────────────────┐        │
│  │  🍔 restaurant    ٤٥٠ ج  │        │  ← ExpenseCard from DB
│  │  Carrefour - أكل البيت  │        │
│  └──────────────────────────┘        │
│  ┌──────────────────────────┐        │
│  │  🚗 car          ٨٥ ج    │        │
│  │  Uber to office          │        │
│  └──────────────────────────┘        │
│                                      │
├──────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات │  ← Tab bar (3 tabs only)
└──────────────────────────────────────┘
```

### History Screen (After DB Wiring)

```
┌──────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}            │  ← Header
├──────────────────────────────────────┤
│                                      │
│   ┌────────────────────────────┐     │
│   │  🎤 ٢:٣٠ م - أمس           │     │  ← RecordingCard (from DB)
│   │  "دفعت ٤٥٠ جنيه في..."     │     │     Transcript text
│   │           🗑️ ▶️            │     │     Delete + Play
│   └────────────────────────────┘     │
│   ┌────────────────────────────┐     │
│   │  🎤 ٩:١٥ ص - أمس           │     │
│   │  "Uber ride to the..."     │     │
│   │           🗑️ ▶️            │     │
│   └────────────────────────────┘     │
│                                      │
├──────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات │
└──────────────────────────────────────┘
```

### Settings Screen (After DB Wiring)

```
┌──────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}            │  ← Header
├──────────────────────────────────────┤
│  الإعدادات                           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  🌐 اللغة          العربية › │    │  ← Current: Arabic
│  ├──────────────────────────────┤    │
│  │  ☀️ المظهر       تلقائي    › │    │  ← Current: System
│  ├──────────────────────────────┤    │
│  │  🔔 التذكيرات        مفعلة › │    │  ← Current: Enabled
│  ├──────────────────────────────┤    │
│  │  ℹ️ عن التطبيق              › │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات │
└──────────────────────────────────────┘
```

---

*End of Document — Business Logic for Masroof (مصروف)*
