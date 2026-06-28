# Masroof (مصروف) — Implementation-Focused Design Plan

**Document ID:** DP-IMP-001  
**Version:** 1.0  
**Status:** Final — Ready for Development  
**Date:** 2026-06-25  
**Target:** Phase 1 Core Data Wiring

---

## Table of Contents

1. [Scope & Priorities](#1-scope--priorities)
2. [Screen Design Specs](#2-screen-design-specs)
   - [A. Home Screen](#a-home-screen-indextsx)
   - [B. History Screen](#b-history-screen-historytsx)
   - [C. Settings Screen](#c-settings-screen-settingstsx)
   - [D. Profile Setup (New Flow)](#d-profile-setup-new-flow)
   - [E. Onboarding Wiring](#e-onboarding-wiring)
   - [F. Tab Layout Fix](#f-tab-layout-fix)
3. [Component Design Specs](#3-component-design-specs)
   - [useHomeData hook](#usehomedata-hook)
   - [useExpenses hook](#useexpenses-hook)
   - [useProfile hook](#useprofile-hook)
   - [NameInputSheet](#nameinputsheet)
   - [RecordingCard — Updated](#recordingcard--updated)
   - [ExpenseCard — Updated](#expensecard--updated)
   - [Settings Rows — Interactive](#settings-rows--interactive)
4. [Visual Design Guidelines](#4-visual-design-guidelines)
5. [Implementation Notes](#5-implementation-notes)
6. [i18n Keys to Add](#6-i18n-keys-to-add)
7. [Known Issues to Fix During Implementation](#7-known-issues-to-fix-during-implementation)
8. [Appendix: DB Schema Reference](#8-appendix-db-schema-reference)

---

## 1. Scope & Priorities

### Phase 1 — Core Data Wiring (P0, ~3 days)

Make the app functional end-to-end with real data persistence.

| # | Task | Priority |
|---|---|---|
| 1 | Fix tab layout — remove broken `whisper` tab | P0 |
| 2 | Wire recording pipeline to DB (insertRecording + insertExpenses after extraction) | P0 |
| 3 | Wire Home to DB (load profile + recent expenses, display below mic) | P0 |
| 4 | Wire History to DB (replace filesystem list with getAllRecordings) | P0 |
| 5 | Wire onboarding to DB (createProfile on completion) | P0 |

### Phase 2 — Interactive Settings & Profile Setup (P1, ~2 days)

| # | Task | Priority |
|---|---|---|
| 6 | Add name input on onboarding slide 3 | P1 |
| 7 | Make Settings rows interactive (language, theme, reminders, about) | P1 |

### Phase 3 — Polish & Fixes (P1-P2, ~1 day)

| # | Task | Priority |
|---|---|---|
| 8 | Fix Gemini model name | P1 |
| 9 | Resolve RTL direction conflict | P1 |
| 10 | Add proper loading/error states for all DB operations | P1 |
| 11 | Fix typo: rename `useRecorings.ts` → `useRecordings.ts` | P2 |

---

## 2. Screen Design Specs

### A. Home Screen (`index.tsx`)

#### Layout Structure

```
┌──────────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}                 │  ← Header (from DB profile)
├──────────────────────────────────────────┤
│                                          │
│  ┌── Voice Recording Zone ────────────┐  │
│  │            🎤 (80dp)               │  │  ← bg-primary rounded-full
│  │         اضغط للتسجيل               │  │
│  │    ▏▌▐▌▐  (waveform placeholder)   │  │
│  │                                     │  │
│  │  ┌─ Processing States ─────────┐   │  │
│  │  │  Transcribing... spinner    │   │  │  ← During isTranscribing
│  │  │  Extracting... spinner      │   │  │  ← During isExtracting
│  │  │  Extracted expense cards    │   │  │  ← After extraction
│  │  └─────────────────────────────┘   │  │
│  └─────────────────────────────────────┘  │
│                                          │
│  ┌── Recent Expenses (from DB) ───────┐  │
│  │  آخر المصروفات                     │  │  ← section-title
│  │  ┌─ ExpenseCard ───────────────┐   │  │
│  │  │ 🍔 restaurant      ٤٥٠ ج   │   │  │  ← bg-surface-bright rounded-[20px]
│  │  │ Carrefour - أكل البيت       │   │  │
│  │  └────────────────────────────┘   │  │
│  │  ┌─ ExpenseCard ───────────────┐   │  │
│  │  │ 🚗 car             ٨٥ ج     │   │  │
│  │  │ Uber to office              │   │  │
│  │  └────────────────────────────┘   │  │
│  └─────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات     │
└──────────────────────────────────────────┘
```

#### States

| State | UI | Implementation |
|---|---|---|
| **Loading** | Skeleton shimmer placeholders for expense list (3 cards, `bg-surface-container-high` with animated pulse) | Show when `useHomeData` is fetching. Use `Animated` shimmer. |
| **Empty (no expenses)** | Mic section only. No "Recent Expenses" heading. Just the mic + tap to record text. | Check `expenses.length === 0`. Hide section entirely. |
| **Has data** | Mic section + "آخر المصروفات" heading + FlatList of ExpenseCard items from DB | Show all sections. Limit to last 10 expenses. |
| **Recording in progress** | Mic button shows stop icon. Waveform animates. Status text changes to `t('home.recording')`. | Existing behavior from `useRecordings`. |
| **Transcribing** | Spinner + "جاري نسخ الصوت..." text | `isTranscribing === true` |
| **Extracting** | Spinner + "جاري تحليل المصروف..." text | `isExtracting === true` |
| **Extraction complete** | Expense cards appear with fade-in animation | `expenseRecords.length > 0` |
| **Error (DB read failed)** | Error toast + retry button | Catch in `useHomeData`, show `t('common.error')` + retry CTA |

#### Key Interactive Elements

| Element | Behavior |
|---|---|
| **Mic button** | Tap → start/stop recording. Same existing `handleRecordingToggle`. No change. |
| **ExpenseCard** | Tap → navigate to expense detail (future phase). For now, tappable with haptic feedback. |
| **Recent expenses list** | Auto-refreshes after new recording pipeline completes. |

#### Data Flow

```
On mount:
  useHomeData() → getProfile() + getAllExpenses()
    ├── Profile → Header(name)
    └── Expenses[] → Recent Expenses section (limit 10)

After recording pipeline:
  Transcription complete → insertRecording() → ... → Extraction complete → insertExpenses()
    → Refresh expenses list via useHomeData().refresh()
```

#### Changes to `src/app/(tabs)/index.tsx`

```typescript
// New hook to replace inline data fetching
import { useHomeData } from '@/hooks/useHomeData';

// Inside component:
const { profile, expenses, isLoading, refresh } = useHomeData();

// Pass profile name to Header:
<Header name={profile?.name} avatarUri={profile?.avatar_uri} />

// After recording pipeline completes, add:
// In handleRecordingToggle or a useEffect on expenseRecords:
// when expenseRecords changes and has items, call refresh()
```

### B. History Screen (`history.tsx`)

#### Layout Structure

```
┌──────────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}                 │  ← Header
├──────────────────────────────────────────┤
│                                          │
│  ┌── Recording List ──────────────────┐  │
│  │  ┌─ RecordingCard ──────────────┐  │  │
│  │  │ 🎤 ٢:٣٠ م - أمس              │  │  │  ← Timestamp from DB
│  │  │ "دفعت ٤٥٠ جنيه في Carrefour"  │  │  │  ← Transcript from DB
│  │  │                    🗑️ ▶️     │  │  │  ← Delete + Play
│  │  └─────────────────────────────┘  │  │
│  │  ┌─ RecordingCard ──────────────┐  │  │
│  │  │ 🎤 ٩:١٥ ص - أمس              │  │  │
│  │  │ "Uber ride to the office..."  │  │  │
│  │  │                    🗑️ ▶️     │  │  │
│  │  └─────────────────────────────┘  │  │
│  └─────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات     │
└──────────────────────────────────────────┘
```

#### States

| State | UI | Implementation |
|---|---|---|
| **Loading** | Skeleton shimmer (3-4 card placeholders) | Show when `loading === true` |
| **Empty** | Archive icon (64dp) + "لا توجد مصروفات بعد" + description | `recordings.length === 0` (existing) |
| **Has data** | FlatList of RecordingCard items from DB | `getAllRecordings()` |
| **Error** | Error state with retry button | DB read fails → show error |

#### Key Interactive Elements

| Element | Behavior |
|---|---|
| **RecordingCard** | Tap → nothing yet (future: navigate to detail). Play button plays audio. Delete button shows confirmation + deletes from DB + filesystem. |
| **Delete** | Alert confirmation → `deleteRecording(id)` from DB + delete audio file from filesystem → refresh list |
| **Play** | Existing `expo-audio` playback via RecordingCard |

#### Data Flow

```
On mount:
  getAllRecordings() → RecordingRow[]
    └── Map to IRecording-compatible objects for existing RecordingCard

On delete:
  deleteRecording(id) from DB
  delete audio file from filesystem (new File(uri).delete())
  Refresh list
```

#### Changes to `src/app/(tabs)/history.tsx`

- Replace `useRecordings` (filesystem-based) with new `useRecordings` hook that queries DB
- The hook should provide `recordingList`, `loading`, `onDelete`, `refresh`
- `RecordingCard` needs updated props — see component specs below

### C. Settings Screen (`settings.tsx`)

#### Layout Structure

```
┌──────────────────────────────────────────┐
│  [Avatar]  مرحبا, {name}                 │  ← Header (from DB)
├──────────────────────────────────────────┤
│                                          │
│  الإعدادات                               │  ← section-title
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🌐 اللغة            العربية   › │    │  ← Language row
│  ├──────────────────────────────────┤    │
│  │ ☀️ المظهر          تلقائي    › │    │  ← Theme row
│  ├──────────────────────────────────┤    │
│  │ 🔔 التذكيرات          مفعلة  › │    │  ← Reminders row
│  ├──────────────────────────────────┤    │
│  │ ℹ️ عن التطبيق                  › │    │  ← About row
│  └──────────────────────────────────┘    │
│                                          │
├──────────────────────────────────────────┤
│  🎤 الرئيسية  📋 السجل  ⚙️ الإعدادات     │
└──────────────────────────────────────────┘
```

#### States

| State | UI | Implementation |
|---|---|---|
| **Default** | 4 rows with current values from DB profile | `getProfile()` on mount |
| **Language changing** | Bottom sheet opens with Arabic/English options | See modal design below |
| **Theme changing** | Bottom sheet with 3 options: Light/Dark/System | Updates profile + theme context |
| **Reminder config** | Bottom sheet with toggle + time picker (reuse onboarding pattern) | Updates profile + schedules notifications |
| **About** | Simple modal/stack screen: version, credits, privacy | New route or modal |

#### Key Interactive Elements

| Row | Behavior |
|---|---|
| **Language** | Tap → open bottom sheet with 2 options (العربية / English). On select → `i18n.changeLanguage(lang)` + `updateProfile({ language: lang })` + set direction + optionally reload for RTL change |
| **Theme** | Tap → open bottom sheet with 3 options (Light / Dark / System). On select → `updateProfile({ theme: value })` + apply theme via context |
| **Reminders** | Tap → open reminder config sheet. Toggle ON/OFF → `updateProfile({ reminders_enabled: 0|1 })` + schedule/cancel daily notifications. Expandable time picker (reuse onboarding `ReminderSection`). |
| **About** | Tap → navigate to about screen or open modal. Show app version from `expo-constants`, credits, privacy note. |

#### Data Flow

```
On mount:
  getProfile() → populate current values (language, theme, reminders_enabled)

On any setting change:
  updateProfile({ ... }) → persists to DB
  Apply immediately via context/i18n/theme

Language change:
  i18n.changeLanguage(lang) + setDirection(dir) + optionally Updates.reloadAsync()
```

#### Modal/Bottom Sheet Design

Each interactive row opens a bottom sheet (`rounded-t-[20px] bg-surface`, drag handle at top):

```
┌─────────────────────────────────────┐
│            ──────────────            │  ← drag handle (w-8 h-1 bg-outline rounded-full)
│                                     │
│  اختر اللغة / Choose Language       │  ← title
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ● العربية                     │  │  ← selected: text-primary
│  │  ○ English                     │  │  ← unselected: text-muted-foreground
│  └───────────────────────────────┘  │
│                                     │
│  [  إلغاء  ]     [  حفظ  ]          │
└─────────────────────────────────────┘
```

### D. Profile Setup (New Flow)

After onboarding completes, the user is asked for their name before reaching the Home screen.

#### Option A (Recommended): Name Input on Onboarding Slide 3

Add a text input field between the language toggle and the reminders section on the current slide 3 (settings slide):

```
┌──────────────────────────────────────┐
│                ⚙️                    │  ← 96dp circle
│                                      │
│         جهز كل حاجة                  │  ← Title
│                                      │
│    خلينا نضبط الحاجات الأساسية       │  ← Description
│                                      │
│  ┌──────────────────────────────┐   │
│  │  أدخل اسمك                    │   │  ← Label above input
│  │  ┌────────────────────────┐  │   │
│  │  │  اسمك (مثال: أحمد)     │  │   │  ← TextInput
│  │  └────────────────────────┘  │   │     bg-surface-bright rounded-xl
│  └──────────────────────────────┘   │     border-outline-variant
│                                      │
│  ┌──────────────────────────────┐   │
│  │   العربية       │  English   │   │  ← Language toggle (existing)
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  🔔 ذكرني بتسجيل المصروفات   │   │  ← Reminder toggle (existing)
│  └──────────────────────────────┘   │
│                                      │
│                ○ ○ ●                 │
│                                      │
│  ┌──────────────────────────────┐    │
│  │         هيا بنا              │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

| Attribute | Spec |
|---|---|
| **Input background** | `bg-surface-bright` |
| **Border** | `border border-outline-variant rounded-xl` |
| **Text color** | `text-on-surface font-cairo` |
| **Placeholder** | `t('profile.namePlaceholder')` — "اسمك (مثال: أحمد)" |
| **Label** | `t('profile.enterName')` — "أدخل اسمك" — `text-sm text-muted-foreground font-cairo` |
| **Height** | 48dp (`h-12`) |
| **Default value** | Empty string |
| **Validation** | Non-empty required for "Get Started" to proceed. If empty, button is disabled or shows validation message. |
| **Auto-focus** | No — user may have already set language and reminders; don't force keyboard open. |

#### Data Flow

```
On "Get Started" tap:
  1. Validate name is non-empty
  2. createProfile({
       name: inputValue,
       language: currentLanguage,
       theme: 'system',
       reminders_enabled: reminders.length > 0 ? 1 : 0
     })
  3. Schedule reminder notifications if reminders_enabled
  4. Set AsyncStorage onboarding_completed = 'true'
  5. Navigate to (tabs)
```

### E. Onboarding Wiring

#### Changes to `src/app/index.tsx` (Onboarding Gate)

Current: Checks only `AsyncStorage` for `onboarding_completed`.

New flow:
```
App launch:
  1. Initialize DB via getDb()
  2. Check: does profile exist in DB? (getProfile())
     ├── Yes → skip onboarding, go to (tabs)
     └── No → check AsyncStorage onboarding_completed flag
              ├── Yes (edge case: DB was cleared) → go to (tabs)
              └── No → show onboarding
```

| Edge Case | Behavior |
|---|---|
| AsyncStorage cleared but DB profile exists | Skip onboarding (DB is source of truth) |
| DB profile exists but AsyncStorage flag missing | Skip onboarding |
| Both missing | Show onboarding |
| Name field left empty | Show validation — don't proceed |

#### Changes to `src/screens/onBoarding/index.tsx`

| Change | Detail |
|---|---|
| Add name state | `const [name, setName] = useState('')` |
| Add name input UI | On slide 3, between language toggle and reminder section |
| Update `handleFinish` | Call `createProfile(name)` before `onFinish?.()` |
| Pass name to `onFinish` | Modify `OnboardingScreenProps` to accept name or handle DB write internally |
| Optional: persist name to AsyncStorage | As fallback if DB write fails |

### F. Tab Layout Fix

#### Current (`src/app/(tabs)/_layout.tsx`)

```tsx
<Tabs.Screen name="index" />
<Tabs.Screen name="history" />
<Tabs.Screen name="whisper" />  // ← DOES NOT EXIST — causes crash
<Tabs.Screen name="settings" />
```

#### Fixed

```tsx
<Tabs.Screen name="index" />
<Tabs.Screen name="history" />
<Tabs.Screen name="settings" />
```

Remove the `whisper` screen registration and its entry from `tabConfig`.

#### Tab Config Update

```typescript
const tabConfig: Record<string, { iconFilled: ..., iconOutline: ..., labelKey: string }> = {
  index: { iconFilled: 'mic', iconOutline: 'mic-outline', labelKey: 'tabs.home' },
  history: { iconFilled: 'archive', iconOutline: 'archive-outline', labelKey: 'tabs.archive' },
  settings: { iconFilled: 'settings', iconOutline: 'settings-outline', labelKey: 'tabs.settings' },
};
```

---

## 3. Component Design Specs

### `useHomeData` Hook

**File:** `src/hooks/useHomeData.ts` (new)

```typescript
interface UseHomeDataReturn {
  profile: Profile | null;
  expenses: ExpenseRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

| Property | Type | Source | Notes |
|---|---|---|---|
| `profile` | `Profile \| null` | `getProfile()` from DB | Null until loaded |
| `expenses` | `ExpenseRow[]` | `getAllExpenses()` from DB | Sorted by created_at DESC, limit 10 |
| `isLoading` | `boolean` | Initial fetch | True until both profile and expenses are loaded |
| `error` | `string \| null` | Catch block | Non-null if DB read fails |
| `refresh` | `() => Promise<void>` | Re-fetches both | Call after recording pipeline completes |

**Implementation pattern:**

```typescript
export function useHomeData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [p, e] = await Promise.all([getProfile(), getAllExpenses()]);
      setProfile(p);
      setExpenses(e ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { profile, expenses, isLoading, error, refresh };
}
```

### `useExpenses` Hook

**File:** `src/hooks/useExpenses.ts` (new)

```typescript
interface UseExpensesReturn {
  expenses: ExpenseRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  insertExpense: (expense: NewExpense) => Promise<number>;
  insertExpenses: (expenses: NewExpense[]) => Promise<number[]>;
}
```

Light wrapper around `expense-repo.ts` functions. Used by Home screen and any component that needs expense CRUD.

### `useProfile` Hook

**File:** `src/hooks/useProfile.ts` (new)

```typescript
interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  createProfile: (name: string) => Promise<Profile>;
}
```

Used by Header, Settings, and onboarding completion. Provides reactive profile state.

### `useRecordings` Hook (Refactored)

**File:** `src/hooks/useRecordings.ts` (rename from `useRecorings.ts`)

Replace filesystem-based reading with DB-based reading:

| Current | New |
|---|---|
| `recordingDir.list()` → filter `.m4a` | `getAllRecordings()` from DB |
| `recordingList: IRecording[]` (files) | `recordingList: RecordingRow[]` (DB rows) |
| Delete: `file.delete()` from filesystem | Delete: `deleteRecording(id)` from DB + `file.delete()` from filesystem |
| `onDelete(file: File)` | `onDelete(id: string, fileUri: string)` |

**Additional change:** After transcription + extraction complete, call `insertRecording()` then `insertExpenses()` with respective data.

### `NameInputSheet` Component

**File:** `src/components/NameInputSheet.tsx` (new — or integrate into onboarding slide 3 directly)

Since this is used only on onboarding slide 3, it can be inline JSX. If reused elsewhere (profile edit in Settings), extract as a component.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | Current name value |
| `onChangeText` | `(text: string) => void` | Required | Text change handler |
| `placeholder` | `string` | `t('profile.namePlaceholder')` | Placeholder text |

**Styling:**

```tsx
<View className="w-full gap-2">
  <Text className="text-sm text-muted-foreground font-cairo">
    {t('profile.enterName')}
  </Text>
  <TextInput
    className="bg-surface-bright border border-outline-variant rounded-xl h-12 px-4 text-on-surface font-cairo text-base"
    value={name}
    onChangeText={setName}
    placeholder={t('profile.namePlaceholder')}
    placeholderTextColor={colors.onSurfaceVariant}
    textAlign="right"  // RTL
  />
</View>
```

### `RecordingCard` — Updated

**File:** `src/components/cards/RecordingCard.tsx`

#### Prop Changes

| Before | After |
|---|---|
| `recording: IRecording` (id, text, time, uri) | `recording: RecordingRow` (id, transcript, duration_ms, created_at) |
| `onDelete: (file: File) => void` | `onDelete: (id: string) => void` |
| — | `uri: string` (audio file path) |

#### Display Changes

| Field | Before | After |
|---|---|---|
| **Text** | `recording.text` (filename) | `recording.transcript` (Whisper transcription) |
| **Time** | `recording.time` (formatted string) | Format `recording.created_at` (ISO 8601) to relative time |
| **Delete** | Deletes file | Deletes from DB + filesystem |

**Time formatting:**

```typescript
function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return t('recordings.justNow');
  if (diffMins < 60) return `${diffMins} ${t('recordings.minutesAgo')}`;
  if (diffHours < 24) return `${diffHours} ${t('recordings.hoursAgo')}`;
  if (diffDays < 7) return `${diffDays} ${t('recordings.daysAgo')}`;
  return date.toLocaleDateString('ar-EG');
}
```

### `ExpenseCard` — Updated

**File:** `src/components/cards/ExpenseCard.tsx`

#### Prop Changes

| Before | After |
|---|---|
| `expense: ExpenseRecord` (generic interface) | `expense: ExpenseRow` (DB type) |

The existing `ExpenseRecord` interface has fields: `item`, `price`, `currency`, `subCategory`, `mainCategory`, `description`, `confidence`, `merchant`.

The DB `ExpenseRow` has: `item`, `price`, `currency`, `sub_category`, `main_category`, `description`, `confidence`, `merchant`, `transcript_id`, `id`, `created_at`, `updated_at`.

**Mapping needed:** Either update `ExpenseCard` prop to accept `ExpenseRow` directly (preferred) or create a mapper from `ExpenseRow` → `ExpenseRecord`.

**Prefer:** Change the `ExpenseCard` prop type to accept `ExpenseRow` — it already has all needed fields (with snake_case keys). Update the internal references:
- `expense.mainCategory` → `expense.main_category`
- `expense.subCategory` → `expense.sub_category`

### Settings Rows — Interactive

#### Language Row

Tapping opens a bottom sheet:

```
┌─────────────────────────────────────┐
│            ──────────────            │
│  اختر اللغة                           │
│                                     │
│  ○ العربية                           │
│  ● English                           │
│                                     │
│  [  إلغاء  ]     [  حفظ  ]          │
└─────────────────────────────────────┘
```

On confirm:
1. `i18n.changeLanguage(selectedLang)`
2. `setDirection(selectedLang === 'ar' ? 'rtl' : 'ltr')`
3. `updateProfile({ language: selectedLang })`
4. Show success toast: `t('settings.languageChanged', { language })`
5. For RTL change: call `Updates.reloadAsync()` to reload app with new direction

#### Theme Row

Tapping opens a bottom sheet:

```
┌─────────────────────────────────────┐
│            ──────────────            │
│  اختر المظهر / Choose Theme          │
│                                     │
│  ○ فاتح / Light                     │
│  ● داكن / Dark                      │
│  ○ تلقائي / System                  │
│                                     │
│  [  إلغاء  ]     [  حفظ  ]          │
└─────────────────────────────────────┘
```

On confirm:
1. `updateProfile({ theme: selectedTheme })`
2. Apply theme via context (set color scheme)

#### Reminders Row

Tapping opens a sheet reusing the onboarding `ReminderSection`:

```
┌─────────────────────────────────────┐
│            ──────────────            │
│                                     │
│  🔔 التذكيرات                        │
│                                     │
│  [═══════════════]  ON              │  ← Switch toggle
│                                     │
│  ┌─ ١:٣٠ م (بعد الغدا)    ✕ ───┐  │
│  └──────────────────────────────┘  │
│  ┌─ ٩:٣٠ م (قبل النوم)     ✕ ───┐  │
│  └──────────────────────────────┘  │
│                                     │
│  [  + إضافة تذكير  ]               │
│                                     │
│  [  إلغاء  ]     [  حفظ  ]          │
└─────────────────────────────────────┘
```

On confirm:
1. `updateProfile({ reminders_enabled: isEnabled ? 1 : 0 })`
2. Schedule or cancel all daily notifications

#### About Row

Navigate to a simple screen (new route `src/app/about.tsx`):

```
┌──────────────────────────────────────┐
│  عن التطبيق / About                  │
│                                      │
│  📱 مصروفي v1.0.0                    │
│                                      │
│  تطبيق تسجيل المصروفات بالصوت        │
│  Voice-first expense tracker         │
│                                      │
│  ———————————————————————             │
│                                      │
│  صنع في مصر 🇪🇬                      │
│  Made in Egypt                       │
│                                      │
│  [  سياسة الخصوصية  ]                │
│  [  تواصل معنا  ]                    │
└──────────────────────────────────────┘
```

---

## 4. Visual Design Guidelines

### Warm Tactile Minimalism — Core Rules

| Rule | Application |
|---|---|
| **No hard corners** | All cards: `rounded-[20px]`. Buttons: `rounded-xl` (14px). Mic: `rounded-full`. Chips: `rounded-full`. |
| **Token colors only** | Every color must use NativeWind token classes. Never `bg-[#hex]` or inline hex. |
| **Cairo font** | All text uses `font-cairo` family variants. Weights: bold for headings, semibold for labels, regular for body. |
| **Arabic-first RTL** | Layout is RTL by default. `DirectionProvider` wraps root. `flex-row` auto-adjusts. |
| **Eastern Arabic numerals** | All amounts use Eastern Arabic: `(price).toLocaleString('ar-EG')` → ٤٥٠ ج.م |
| **Soft shadows** | Cards use elevation level 2. Mic button uses level 3 (primary-tinted). |
| **Tonal elevation** | Cards: `bg-surface-bright` on `bg-background`. Sections: `bg-surface-container-low`. Tab bar: `bg-surface`. |

### Color Token Usage Map

| Element | Token Class |
|---|---|
| **Screen background** | `bg-background` |
| **Cards** | `bg-surface-bright` |
| **Card text (primary)** | `text-on-surface` |
| **Card text (secondary)** | `text-muted-foreground` |
| **Section titles** | `text-secondary` |
| **Primary actions** | `bg-primary` + `text-on-primary` |
| **Destructive actions** | `text-destructive` or `bg-destructive` |
| **Borders/dividers** | `border-outline-variant` |
| **Tab bar** | `bg-surface` + `border-t border-outline-variant` |
| **Tab active** | `text-primary` / icon `color={colors.primary}` |
| **Tab inactive** | `text-muted-foreground` / icon `color={colors.onSurfaceVariant}` |
| **Bottom sheet** | `bg-surface` rounded top corners |
| **Input fields** | `bg-surface-bright border-outline-variant` |
| **Spinner** | `color={colors.primary}` |

### Typography Scale

| Element | Class | Notes |
|---|---|---|
| **Screen title** | `text-2xl font-cairo-bold text-foreground` | "مرحبا, احمد" |
| **Section title** | `text-lg font-semibold text-secondary` | "آخر المصروفات" |
| **Card amount** | `text-2xl font-cairo-bold text-primary` | ٤٥٠ ج.م |
| **Card item name** | `text-base font-cairo-semibold text-on-surface` | Carrefour |
| **Card metadata** | `text-xs text-muted-foreground font-cairo` | Timestamps |
| **Button label** | `text-base font-cairo-semibold` | Via Button component |
| **Tab label** | `text-[11px] font-cairo-semibold/regular` | Active/inactive |
| **Mic status** | `text-sm text-muted-foreground text-center` | "اضغط للتسجيل" |

### Spacing Grid

| Token | Value | Usage |
|---|---|---|
| `gap-2` | 8px | Between icon and text in row |
| `gap-3` | 12px | Between card elements |
| `gap-4` | 16px | Between sections |
| `px-5` | 20px | Horizontal screen margins |
| `p-4` | 16px | Card internal padding |
| `pt-10` | 40px | Top spacing below header |
| `mb-3` | 12px | Between cards in list |

### Haptic Feedback

| Action | Haptic |
|---|---|
| Mic tap → start recording | `Haptics.ImpactFeedbackStyle.Medium` |
| Recording stop | `Haptics.ImpactFeedbackStyle.Light` |
| Transcription complete | `Haptics.NotificationFeedbackType.Success` |
| Error / low confidence | `Haptics.NotificationFeedbackType.Error` |
| Setting changed | `Haptics.ImpactFeedbackStyle.Light` |

---

## 5. Implementation Notes

### File-by-File Change Summary

| File | Action | Priority |
|---|---|---|
| `src/app/(tabs)/_layout.tsx` | Remove `<Tabs.Screen name="whisper" />` | P0 |
| `src/app/(tabs)/index.tsx` | Add useHomeData hook, pass profile name to Header, add recent expenses section | P0 |
| `src/app/(tabs)/history.tsx` | Use DB-based useRecordings, display transcript from DB | P0 |
| `src/app/(tabs)/settings.tsx` | Make rows interactive, wire to DB profile, add bottom sheets | P1 |
| `src/app/index.tsx` | Add DB profile check alongside AsyncStorage, call createProfile on onboarding finish | P0 |
| `src/hooks/useRecorings.ts` | Add DB integration (insertRecording + insertExpenses), rename to useRecordings.ts | P0 |
| `src/hooks/useHomeData.ts` | New — load profile + expenses from DB | P0 |
| `src/hooks/useExpenses.ts` | New — wrapper around expense-repo.ts | P0 |
| `src/hooks/useProfile.ts` | New — wrapper around profile-repo.ts | P0 |
| `src/components/Header.tsx` | Accept `name` and `avatarUri` props, remove hardcoded "احمد" | P0 |
| `src/components/cards/RecordingCard.tsx` | Accept `RecordingRow` + `uri`, display transcript + formatted createdAt | P0 |
| `src/components/cards/ExpenseCard.tsx` | Change prop type to `ExpenseRow` (snake_case keys) | P0 |
| `src/types/index.d.ts` | Update IRecording to match RecordingRow, add RecordingRow type export | P0 |
| `src/screens/onBoarding/index.tsx` | Add name input, wire createProfile on finish | P1 |
| `src/screens/onBoarding/SlideContent.tsx` | Add name input to slide 3 render | P1 |
| `src/screens/onBoarding/constants.ts` | Update OnboardingScreenProps to pass name, update SLIDE_COUNT if needed | P1 |
| `src/services/gemini.ts` | Fix model name: `gemini-3.5-flash` → `gemini-2.0-flash` | P1 |
| `src/i18n/index.ts` | Remove hardcoded `isRTL = true`, use dynamic detection from stored language | P1 |
| `src/lib/i18n.ts` | Resolve conflict with `src/i18n/index.ts` — unify RTL direction management | P1 |

### Critical Conventions Checklist

- [ ] All user-facing strings use `t()` from `react-i18next`
- [ ] All colors use NativeWind tokens (`bg-background`, `text-primary`, etc.) — zero hex codes
- [ ] No comments in code
- [ ] aniUI components used where available: `Button`, `Text`, `Avatar` from `src/components/ui/`
- [ ] Cairo font throughout via `font-cairo`, `font-cairo-bold`, etc.
- [ ] RTL layout via `DirectionProvider` — test with `I18nManager.forceRTL(true)`
- [ ] Eastern Arabic numerals via `toLocaleString('ar-EG')`
- [ ] Safe area handled via `SafeAreaView` component
- [ ] All TouchableOpacity have `accessibilityRole` and `accessibilityLabel`

### Type Updates

#### `src/types/index.d.ts`

```typescript
// Matches RecordingRow from DB
interface IRecording {
  id: string;
  transcript: string;
  durationMs: number;
  createdAt: string;   // ISO 8601
  uri: string;          // audio file path
}

// Matches ExpenseRow from DB
interface ExpenseRecord {
  id: number;
  item: string;
  price: number;
  currency: string;
  subCategory: string;
  mainCategory: string;
  description: string;
  confidence: number;
  merchant: string | null;
  transcriptId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

Note: `ExpenseCard` currently uses camelCase internally (`mainCategory`, `subCategory`). The DB uses snake_case (`main_category`, `sub_category`). **Either**:
- (A) Update `ExpenseCard` to read `expense.main_category` (breaking change to the component)
- (B) Keep `ExpenseRecord` interface with camelCase and map from DB row in the hook

**Recommendation:** Option (B) — map in the hook to avoid breaking `ExpenseCard`:

```typescript
// In useHomeData or useExpenses:
const mapRowToRecord = (row: ExpenseRow): ExpenseRecord => ({
  id: row.id,
  item: row.item,
  price: row.price,
  currency: row.currency,
  subCategory: row.sub_category,
  mainCategory: row.main_category,
  description: row.description,
  confidence: row.confidence,
  merchant: row.merchant,
  transcriptId: row.transcript_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
```

### Recording Pipeline — DB Integration

In `useRecordings` hook (`src/hooks/useRecorings.ts`):

After transcription succeeds:

```typescript
// Generate a unique ID for this recording
const recordingId = `${Date.now()}`;

// Save recording to DB
await insertRecording({
  id: recordingId,
  transcript: transcription.text,
  duration_ms: transcription.duration ?? 0,
});
```

After extraction succeeds:

```typescript
// Save expenses to DB linked to this recording
const newExpenses: NewExpense[] = (extracted ?? []).map((exp) => ({
  item: exp.item,
  price: exp.price,
  currency: exp.currency ?? 'جنيه',
  sub_category: exp.subCategory,
  main_category: exp.mainCategory,
  description: exp.description,
  confidence: exp.confidence ?? 0,
  merchant: exp.merchant ?? null,
  transcript_id: recordingId,
}));

if (newExpenses.length > 0) {
  await insertExpenses(newExpenses);
}
```

### Loading State Pattern

For DB loading states across screens:

```typescript
function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3 px-5">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="bg-surface-container-high rounded-[20px] h-24 animate-pulse"
        />
      ))}
    </View>
  );
}
```

Use `Animated` with opacity cycling for shimmer effect.

### Error State Pattern

```typescript
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text className="text-sm text-muted-foreground text-center mt-4 font-cairo">
        {message}
      </Text>
      <Button variant="outline" className="mt-4" onPress={onRetry}>
        {t('common.retry')}
      </Button>
    </View>
  );
}
```

---

## 6. i18n Keys to Add

### New Keys for Existing Features

These keys are referenced in code but missing from translation files:

| Key | Arabic | English | File(s) |
|---|---|---|---|
| `recordings.noTranscription` | اضغط على الميكروفون للتسجيل | Tap the microphone to record | `useRecordings` |
| `recordings.transcribing` | جاري نسخ الصوت... | Transcribing... | `index.tsx` (home) |
| `home.extractingExpense` | جاري تحليل المصروف... | Extracting expense... | Already exists ✅ |
| `settings.theme.light` | فاتح | Light | `settings` |
| `settings.theme.dark` | داكن | Dark | `settings` |
| `settings.theme.system` | تلقائي | System | `settings` |
| `settings.languageChanged` | تم تغيير اللغة إلى {{language}} | Language changed to {{language}} | Already exists ✅ |

### New Keys for Features in This Plan

| Key | Arabic | English |
|---|---|---|
| `profile.enterName` | أدخل اسمك | Enter your name |
| `profile.namePlaceholder` | اسمك (مثال: أحمد) | Your name (e.g., Ahmed) |
| `settings.theme` | المظهر | Theme |
| `settings.notifications` | الإشعارات | Notifications |
| `settings.notifications.enabled` | مفعلة | Enabled |
| `settings.notifications.disabled` | معطلة | Disabled |
| `settings.about.version` | الإصدار {{version}} | Version {{version}} |
| `settings.about.privacy` | سياسة الخصوصية | Privacy Policy |
| `settings.about.contact` | تواصل معنا | Contact Us |
| `settings.about.madeIn` | صنع في مصر | Made in Egypt |
| `common.retry` | حاول مرة أخرى | Try Again |
| `common.error` | حدث خطأ ما | Something went wrong |
| `recordings.justNow` | الآن | Just now |
| `recordings.minutesAgo` | منذ {{count}} دقيقة | {{count}} min ago |
| `recordings.hoursAgo` | منذ {{count}} ساعة | {{count}} hr ago |
| `recordings.daysAgo` | منذ {{count}} يوم | {{count}} day ago |
| `recordings.deleteConfirm` | هل أنت متأكد من حذف هذا التسجيل؟ | Are you sure you want to delete this recording? |
| `recordings.deleteSuccess` | تم حذف التسجيل | Recording deleted |
| `profile.updated` | تم تحديث الملف الشخصي | Profile updated |

### Keys to Remove

| Key | Reason |
|---|---|
| `tabs.whisper` | Whisper tab removed |
| `home.recordings.noRecordings` (English only — nested differently than Arabic) | Use `recordings.noRecordings` consistently |

---

## 7. Known Issues to Fix During Implementation

| # | Issue | File(s) | Fix |
|---|---|---|---|
| 1 | **Missing whisper tab** causes navigation crash | `src/app/(tabs)/_layout.tsx` | Remove `<Tabs.Screen name="whisper" />` |
| 2 | **Broken Gemini model** name | `src/services/gemini.ts` line ~67 | Change `gemini-3.5-flash` → `gemini-2.0-flash` |
| 3 | **RTL forced always** — `I18nManager.isRTL = true` hardcoded | `src/i18n/index.ts` line ~12 | Remove. Use dynamic detection from stored language |
| 4 | **RTL direction conflict** — two files managing RTL | `src/i18n/index.ts` vs `src/lib/i18n.ts` | Unify: i18n setup should own it. Keep one. |
| 5 | **Filename typo** — `useRecorings.ts` | `src/hooks/useRecorings.ts` | Rename to `useRecordings.ts`. Update all imports. |
| 6 | **Hardcoded colors** in `languagePicker.tsx` | `src/components/languagePicker.tsx` | Refactor to use NativeWind tokens |
| 7 | **Theme label swapped** — `:root` labeled "dark" but uses light values | `src/app/global.css` | Swap the comments to match actual values (cosmetic, no logic change) |
| 8 | **IRecording type mismatch** — doesn't match DB schema | `src/types/index.d.ts` | Align with `RecordingRow` from DB (add `transcript`, `durationMs`, `createdAt`) |
| 9 | **Env file tracked** — `.env` committed | `.env` | Add to `.gitignore` |
| 10 | **i18n key mismatch** — `home.recordings.noRecordings` nested differently in Arabic vs English | Translation files | Unify: use `recordings.noRecordings` consistently in both |

---

## 8. Appendix: DB Schema Reference

### `profiles` table (singleton — always id=1)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | INTEGER | `1` | Single-row |
| `name` | TEXT | — | User's display name |
| `avatar_uri` | TEXT | `null` | Optional avatar path |
| `language` | TEXT | `'ar'` | `'ar'` or `'en'` |
| `theme` | TEXT | `'system'` | `'light'`, `'dark'`, `'system'` |
| `reminders_enabled` | INTEGER | `1` | `0` or `1` |
| `created_at` | TEXT | — | ISO 8601 |
| `updated_at` | TEXT | — | ISO 8601 |

### `expenses` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | INTEGER | AUTOINCREMENT | PK |
| `item` | TEXT | — | What was paid for |
| `price` | REAL | — | Amount |
| `currency` | TEXT | `'جنيه'` | Currency |
| `sub_category` | TEXT | — | Sub-category |
| `main_category` | TEXT | — | Main category |
| `description` | TEXT | — | Arabic description |
| `confidence` | REAL | `0` | 0.0–1.0 |
| `merchant` | TEXT | `null` | Merchant name |
| `transcript_id` | TEXT | `null` | FK → recordings.id |
| `created_at` | TEXT | — | ISO 8601 |
| `updated_at` | TEXT | — | ISO 8601 |

### `recordings` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | TEXT | — | UUID or timestamp, PK |
| `transcript` | TEXT | — | Whisper transcription |
| `duration_ms` | INTEGER | `0` | Recording duration |
| `created_at` | TEXT | — | ISO 8601 |

### Repo Functions Available

| Function | From | Input | Output |
|---|---|---|---|
| `getProfile()` | `profile-repo.ts` | — | `Profile \| null` |
| `createProfile(name)` | `profile-repo.ts` | string | `Profile` |
| `updateProfile(updates)` | `profile-repo.ts` | `Partial<Profile>` | `void` |
| `getAllExpenses()` | `expense-repo.ts` | — | `ExpenseRow[]` |
| `insertExpense(expense)` | `expense-repo.ts` | `NewExpense` | `number` (id) |
| `insertExpenses(expenses)` | `expense-repo.ts` | `NewExpense[]` | `number[]` (ids) |
| `deleteExpense(id)` | `expense-repo.ts` | number | `void` |
| `getAllRecordings()` | `recording-repo.ts` | — | `RecordingRow[]` |
| `insertRecording(recording)` | `recording-repo.ts` | `NewRecording` | `void` |
| `deleteRecording(id)` | `recording-repo.ts` | string | `void` |

---

## Implementation Order (Recommended)

### Day 1 — Foundation
1. Fix tab layout (remove whisper)
2. Create `useHomeData` hook
3. Create `useExpenses` hook
4. Create `useProfile` hook
5. Update `Header.tsx` to accept props

### Day 2 — Data Wiring
6. Wire Home screen to DB (profile + recent expenses)
7. Wire recording pipeline to DB (insertRecording + insertExpenses)
8. Wire History screen to DB (getAllRecordings)
9. Update RecordingCard and ExpenseCard props

### Day 3 — Onboarding + Polish
10. Wire onboarding to DB (createProfile on completion)
11. Add name input to onboarding slide 3
12. Fix Gemini model name
13. Resolve RTL direction conflict
14. Add missing i18n keys

### Day 4 — Interactive Settings
15. Language toggle in Settings
16. Theme toggle in Settings
17. Reminder config in Settings
18. About screen

### Day 5 — Fixes & QA
19. Rename `useRecorings.ts` → `useRecordings.ts`
20. Add loading/error states to all screens
21. Fix hardcoded colors in legacy components
22. Test RTL, dark mode, all states

---

*End of Document — DP-IMP-001: Implementation-Focused Design Plan*
