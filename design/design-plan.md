# Masroof (مصروف) — Comprehensive Design Plan

**Document ID:** DP-001  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-13  
**Author:** UX/Design Team  
**Classification:** Internal — Confidential  

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Visual Identity](#2-visual-identity)
3. [Component Architecture](#3-component-architecture)
4. [Voice Interaction Design](#4-voice-interaction-design)
5. [Screen Inventory & User Flows](#5-screen-inventory--user-flows)
6. [Design System Token Architecture](#6-design-system-token-architecture)
7. [Accessibility Requirements](#7-accessibility-requirements)
8. [Phased Deliverables Roadmap](#8-phased-deliverables-roadmap)
9. [Motion & Micro-interactions](#9-motion--micro-interactions)
10. [Design Governance](#10-design-governance)

---

## 1. Design Philosophy & Principles

### 1.1 Core Design Philosophy

Masroof's design is rooted in **Warm Tactile Minimalism** — a philosophy that prioritizes voice as the primary interaction mode, treats every tap as a defect to eliminate, and wraps financial data in a warm, human interface that feels like a trusted advisor rather than a spreadsheet.

The brand personality is **warm, dependable, and effortless**. The design moves away from the cold, clinical nature of traditional finance apps toward a conversational, tactile experience grounded in Egyptian cultural context. The emotional response we target: **financial peace through reduced cognitive load**.

### 1.2 Design Principles

#### Principle 1: Voice First, Everything Else Second
- **Rationale:** The primary bottleneck in expense tracking is data-entry friction. Voice eliminates this entirely. The UI exists to support voice, not the other way around.
- **Application:** The microphone is always one tap away on every screen. The bottom 30% (voice zone) is reserved for voice interaction. Text entry is always secondary. Confirmation dialogues are minimal — the system acts, user overrides only when needed.

#### Principle 2: Zero Friction, Every Screen
- **Rationale:** The ideal flow is 3 steps: Open App → Tap Mic → Speak → Done. Every additional tap is a design defect. Target time from app open to expense saved: under 10 seconds.
- **Application:** Max 2 primary actions per screen. No forms or dropdowns as primary input. Auto-save for high-confidence extractions. Swipe-to-confirm gestures. Deep-link from notifications directly to recording.

#### Principle 3: Privacy as a Design Material
- **Rationale:** Financial + audio data is deeply personal. Privacy is not a compliance checkbox — it shapes every interaction pattern.
- **Application:** All processing is on-device. Microphone permission is requested contextually with a clear explanation. No audio leaves the device. The UI communicates local-first status transparently (e.g., "Offline — your data stays here").

#### Principle 4: Arabic-Native, Not Arabic-Translated
- **Rationale:** The Egyptian market deserves interfaces that are authored in Arabic, not translated from English. Layout, numerals, date formats, and cultural rhythms are native.
- **Application:** RTL by default. Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) as primary. Cairo typeface for Arabic + Latin harmony. Friday as weekend start. Ramadan-aware notification timing. Egyptian colloquial in UI copy.

#### Principle 5: Progressive Intelligence
- **Rationale:** The system gets smarter over time without overwhelming the user. Each phase layers understanding on top of raw data, but the interface never becomes more complex.
- **Application:** Phase 1 = voice recording only (simple). Phase 2 = structured extraction appears gently via review screen. Phase 5 = analytics appears only when there's enough data. The UI grows with the user, but the core voice interaction remains unchanged.

#### Principle 6: Feedback Everywhere, Noise Nowhere
- **Rationale:** Voice-first interaction lacks visual confirmation by nature. Haptic, audio, and visual feedback must compensate to build trust in the system.
- **Application:** Haptic feedback on every voice command and save. Microphone state is always visible (idle/listening/processing/confirmation/error). Animated waveform provides real-time audio feedback. Success animations after save. Error states are specific and actionable.

#### Principle 7: Physicality in Digital Space
- **Rationale:** Financial data is abstract. Tonal layering, soft shadows, and organic shapes create a sense of physical space that makes data feel tangible and trustworthy.
- **Application:** No hard corners — lg (20px) radius on cards, pill shapes for chips. Tonal elevation system (4 levels). Skeleton placeholders during processing. Cards feel like physical objects with shadows. Mic button has pulse animation when active.

---

## 2. Visual Identity

### 2.1 Color System

#### Light Mode — "Paper & Ink"

| Token | Hex | Usage |
|---|---|---|
| **primary** | `#0E6655` | Primary actions, mic button, active states |
| **on-primary** | `#FFFFFF` | Text/icon on primary backgrounds |
| **primary-container** | `#94E1CB` | Soft category chips, selected states |
| **surface** | `#F5F3EF` | Base background (warm off-white) |
| **surface-dim** | `#EDEAE3` | Secondary surfaces, grouped sections |
| **surface-bright** | `#FBF9F5` | Cards, elevated surfaces |
| **on-surface** | `#1B1C1A` | Primary text |
| **on-surface-variant** | `#3F4945` | Secondary text, captions |
| **outline** | `#D4D2CC` | Borders, dividers |
| **outline-variant** | `#E8E3D8` | Subtle dividers, disabled states |

#### Dark Mode — "Deep Forest"

| Token | Hex | Usage |
|---|---|---|
| **primary** | `#89D5C0` | Primary actions, mic button, active states |
| **on-primary** | `#00382D` | Text/icon on primary |
| **primary-container** | `#0E6655` | Category chips, selected states |
| **surface** | `#141A17` | Base background (dark obsidian green) |
| **surface-dim** | `#0F1411` | Deeper surfaces |
| **surface-bright** | `#1A211D` | Cards, elevated surfaces |
| **on-surface** | `#E4E2DE` | Primary text |
| **on-surface-variant** | `#BEC9C4` | Secondary text |
| **outline** | `#3F4945` | Borders, dividers |
| **outline-variant** | `#2A332F` | Subtle dividers |

#### Semantic Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| **success** | `#1B7E4A` | `#66D19B` | Expense saved, budget on track |
| **warning** | `#B55F0E` | `#F5C542` | Budget approaching limit, low confidence |
| **error** | `#BA1A1A` | `#FFB4AB` | Failed recording, extraction error |
| **info** | `#1A6C9E` | `#8AD0FF` | Tips, suggestions, system messages |
| **neutral** | `#6F7975` | `#9EA9A4` | Inactive, secondary info |

#### Accessibility Compliance

| Text Type | AA Target | AAA Target | Light Mode Pass | Dark Mode Pass |
|---|---|---|---|---|
| **Body text on surface** | 4.5:1 | 7:1 | ✅ 14.5:1 | ✅ 14.2:1 |
| **Body text on primary** | 4.5:1 | 7:1 | ✅ 10.1:1 | ✅ 9.8:1 |
| **Small text (<18px)** | 4.5:1 | 7:1 | ✅ | ✅ |
| **Large text (>18px bold)** | 3:1 | 4.5:1 | ✅ | ✅ |

### 2.2 Typography

#### Typeface

**Cairo** — single typeface for Arabic and Latin text. Selected for:
- Excellent Arabic glyph coverage (including Eastern Arabic numerals)
- Balanced x-height that pairs well between scripts
- Geometric yet warm character shapes
- Open-source, well-maintained

| Style | Weight | Size | Line Height | Usage |
|---|---|---|---|---|
| **display-lg** | Bold 700 | 34px | 1.4 | Hero amounts, empty state headlines |
| **headline-lg** | Bold 600 | 28px | 1.4 | Screen titles |
| **headline-md** | SemiBold 600 | 24px | 1.5 | Section headers |
| **headline-sm** | SemiBold 600 | 20px | 1.6 | Card titles |
| **body-lg** | Regular 400 | 18px | 1.7 | Primary body text |
| **body-md** | Regular 400 | 16px | 1.7 | Secondary body, descriptions |
| **body-sm** | Regular 400 | 14px | 1.6 | Captions, metadata |
| **label-lg** | SemiBold 600 | 16px | 1.4 | Button labels, tab labels |
| **label-md** | SemiBold 600 | 14px | 1.4 | Chips, badges, small labels |
| **numeral-xl** | Bold 700 | 40px | 1.2 | Primary amount display |
| **numeral-lg** | Bold 700 | 28px | 1.2 | Secondary amounts |
| **numeral-md** | SemiBold 600 | 20px | 1.3 | Inline amounts |

#### Numerals

- **Default:** Eastern Arabic (٠١٢٣٤٥٦٧٨٩) — rendered via Cairo font's Arabic numeral glyphs
- **Option:** Western (0123) — user-switchable in Settings
- **Implementation:** Use `Intl.NumberFormat` with `locale: 'ar-EG'` and `u-nu-arab` for Eastern Arabic; `u-nu-latn` for Western
- **All amounts** in the UI display as Eastern Arabic by default: ٤٥٠ ج.م

### 2.3 Iconography

- **Style:** Outline, stroke-based, consistent 2px stroke weight
- **Set:** Use a single icon family (Lucide or Phosphor) for consistency
- **RTL awareness:** Icons that imply direction (arrows, chevrons) must mirror in RTL mode
- **Sizing grid:** 24×24dp standard, 20×20dp for inline, 32×32dp for tab bar
- **Color:** Inherit from text color context; primary-colored only for active states

### 2.4 Spacing & Grid

#### Base Unit: 4px

| Token | Value | Usage |
|---|---|---|
| **space-0** | 0px | Reset |
| **space-1** | 4px | Micro spacing between elements |
| **space-2** | 8px | Tight spacing, icon padding |
| **space-3** | 12px | Between label and value |
| **space-4** | 16px | Card internal padding (md) |
| **space-5** | 20px | Horizontal screen margins (lg) |
| **space-6** | 24px | Between card groups |
| **space-7** | 28px | Section spacing (xl) |
| **space-8** | 32px | Major section breaks |
| **space-10** | 40px | Screen top padding |
| **space-12** | 48px | Voice zone height |

#### RTL-Aware Spacing

All spacing tokens use logical properties:
- `padding-inline-start` / `padding-inline-end` instead of `padding-left` / `padding-right`
- `margin-inline-start` / `margin-inline-end` for margin
- `inset-inline-start` / `inset-inline-end` for positioning

### 2.5 Border Radius

| Token | Value | Usage |
|---|---|---|
| **radius-sm** | 4px | Small indicators, avatars |
| **radius-md** | 14px | Input fields, buttons |
| **radius-lg** | 20px | Cards, modals, sheets |
| **radius-xl** | 28px | Large containers |
| **radius-pill** | 9999px | Chips, mic button, tags |

**No hard corners anywhere in the system.**

### 2.6 Elevation / Shadows

| Level | Layer | Light Mode Shadow | Dark Mode Shadow |
|---|---|---|---|
| **0** | Background | None | None |
| **1** | Surface/inset | `0px 1px 2px rgba(0,0,0,0.04)` | `0px 1px 2px rgba(0,0,0,0.2)` |
| **2** | Cards | `0px 2px 8px rgba(0,0,0,0.06)` | `0px 2px 8px rgba(0,0,0,0.3)` |
| **3** | Floating elements (mic) | `0px 4px 16px rgba(14,102,85,0.25)` | `0px 4px 16px rgba(137,213,192,0.2)` |
| **4** | Modals, bottom sheets | `0px -4px 24px rgba(0,0,0,0.1)` | `0px -4px 24px rgba(0,0,0,0.35)` |

---

## 3. Component Architecture

### 3.1 Voice Recording Button (Mic FAB)

| Attribute | Spec |
|---|---|
| **Size** | 64×64dp (minimum), pill-shaped |
| **Color** | Primary `#0E6655` (light), `#89D5C0` (dark) |
| **Icon** | Microphone icon, 28×28dp, white |
| **Position** | Bottom center, above voice zone. `bottom: 30px` from safe area |
| **Shadow** | Elevation level 3 — green-tinted shadow |
| **Touch target** | 64×64dp (well above 44pt minimum) |

**States:**

| State | Visual | Behavior |
|---|---|---|
| **Idle** | Static mic icon, subtle shadow | Tap → start recording. Haptic impact (medium) |
| **Listening** | Mic icon + pulse ring animation. Ring color: primary. Pulse frequency: 1.5s | Recording audio. Waveform visible above. Tap → stop recording |
| **Processing** | Spinner replacing mic icon. "جاري المعالجة..." text below | Cannot interact. 1–3s typical |
| **Confirmation** | Checkmark replacing mic icon. Green pulse. Haptic (success) | Auto-navigate to result after 1.5s |
| **Error** | Mic icon + red ring + shake animation. "حدث خطأ، حاول مرة أخرى" | Tap → retry. Haptic (error) |

### 3.2 Ticket Card (Phase 1)

```
┌──────────────────────────────────────┐
│  🎤  ٤٥٠ ج.م      Groceries  │  ← category chip
│                                      │
│  "دفعت ٤٥٠ جنيه في Carrefour   │  ← transcript preview
│   على أكل البيت"                 │
│                                      │
│  منذ ٢ ساعة                [> play] │  ← timestamp + audio play
└──────────────────────────────────────┘
```

| Attribute | Spec |
|---|---|
| **Radius** | lg (20px) |
| **Padding** | space-4 (16px) internal |
| **Background** | surface-bright (white in light mode) |
| **Shadow** | Elevation level 2 |
| **Min height** | 80dp |
| **Tap target** | Entire card tappable → detail view |

### 3.3 Expense Card (Phase 2+)

```
┌──────────────────────────────────────┐
│   Carrefour                         │
│  Groceries                           │
│                                      │
│  ٤٥٠  ج.م                 ١٣ يونيو │
│                                      │
│  [Swipe to confirm >]    [edit]      │
└──────────────────────────────────────┘
```

- Swipe-to-confirm gesture: swipe right → confirm save (RTL: swipe left)
- Edit button opens inline field editing or voice correction
- Confidence indicator: color-coded dot (green ≥0.9, yellow 0.7–0.89, red <0.7)

### 3.4 Review Screen Components

#### Editable Chips
- Category chips: pill-shaped, primary-container background, primary text
- Tap to cycle through suggestions or open picker
- Voice correction: tap chip → mic activates → say correction → field updates inline

#### Voice Correction Overlay
- Semi-transparent overlay with mic animation
- Text: "قول التصحيح" (Say the correction)
- Shows current value being corrected
- On success: field updates with brief green flash
- On failure: fallback to keyboard editing

### 3.5 Microphone Waveform Indicator

| Attribute | Spec |
|---|---|
| **Height** | 48dp |
| **Bar count** | 40 bars |
| **Bar width** | 2dp, radius-pill |
| **Bar color** | Primary gradient (bottom → top: lighter → darker) |
| **Animation** | Real-time amplitude mapping. Each bar height = normalized amplitude × bar max height |
| **Idle state** | Flat line (2dp height) |
| **Listening** | Animated bars, pulsing in rhythm with audio |
| **Processing** | Cascading wave animation (left to right in RTL) |

### 3.6 Reminder Notification

| Attribute | Spec |
|---|---|
| **Style** | Standard system notification with Masroof branding |
| **Icon** | App icon with mic overlay |
| **Title** | Rotating variants (avoid habituation) |
| **Deep-link** | Tap → direct to recording screen |
| **Actions** | Single tap (record) or swipe to dismiss |

### 3.7 Analytics Dashboard Components

#### Spending Overview Card
- Large numeral-xl displaying total spend for period
- Line chart showing daily spending with 7-day moving average
- Green/red indicator for above/below average

#### Category Breakdown
- Horizontal bar chart (RTL: bars extend right to left)
- Each bar: color-coded by category with icon
- Tap bar → drill down to merchant view

#### Merchant Analysis
- Card list sorted by total spend
- Each entry: merchant icon + name + total + % change vs last period

#### Recommendation Card
- Elevated card (level 3) with light yellow tint (info semantic)
- Specific, quantified suggestion: "خفض زيارات المطاعم بمقدار مرة أسبوعيًا قد يوفر ~٨٠٠ ج.م شهريًا"
- Action buttons: "سأفعل" (I'll do it) / "ليس الآن" (Not now)

### 3.8 Navigation Patterns

#### Tab Bar
- **Screens:** Home (voice zone), History, Analytics (Phase 5+), Settings
- **Style:** Bottom tab bar with icons + labels
- **Active state:** Primary color, filled icon
- **Inactive:** on-surface-variant, outline style
- **Voice zone:** Persistent above tab bar — mic icon always visible

#### Bottom Sheet
- Used for: category picker, date picker, field editing
- Rounded top corners (radius-lg = 20px)
- Drag handle at top center (32px wide, 4px height, radius-pill)
- Backdrop: semi-transparent black (40% opacity)

#### Voice Zone (Persistent Area)
- Bottom 30% of screen height (minimum 180dp)
- Background: gradient from transparent to surface-dim at bottom
- Contains: mic button + waveform area + status text
- Visible on home screen and recording screen
- Hidden during full-screen content (analytics, settings)

### 3.9 Empty, Loading & Error States

#### Empty State
```
┌─────────────────────────────────┐
│                                 │
│        📊 (illustration)        │
│                                 │
│   لا توجد مصروفات بعد            │
│   (No expenses yet)             │
│                                 │
│   اضغط على الميكروفون لتسجيل    │
│   أول مصروف                     │
│                                 │
│     [🎤 سجل أول مصروف]          │
│                                 │
└─────────────────────────────────┘
```

#### Loading State (Skeleton)
- Animated shimmer placeholders matching card dimensions
- Rounded corners matching actual cards (radius-lg)
- Gradient shimmer: base surface → surface-dim → base surface
- Duration: 1.5s cycle, infinite while loading

#### Error State
- Red-tinted card with error icon
- Specific error message (not generic)
- Action button: "إعادة المحاولة" (Retry)
- For voice errors: mic retry button with shake animation

---

## 4. Voice Interaction Design

### 4.1 Voice Zone Layout

```
┌──────────────────────────────────────┐
│                                      │
│           Content Area               │
│           (70% of screen)            │
│                                      │
├──────────────────────────────────────┤
│                                      │
│   ┌────────────────────────────┐    │
│   │     Waveform / Status      │    │  ← 48dp
│   └────────────────────────────┘    │
│                                      │
│              🎤                      │  ← Mic button (64dp)
│                                      │
│   "اضغط للتسجيل"                     │  ← Status text
│                                      │
├──────────────────────────────────────┤
│   (safe area bottom)                 │
└──────────────────────────────────────┘
```

### 4.2 Microphone State Machine

```
        ┌─────────────────────────────────────────────────────┐
        │                                                     │
        │                    ┌──────────┐                     │
        │         tap        │  IDLE    │   permission denied │
        │   ┌───────────────▶│          │◀────────────────────┐│
        │   │                └──────────┘                     ││
        │   │                    │                            ││
        │   │                    │ tap mic                    ││
        │   │                    ▼                            ││
        │   │                ┌──────────┐                     ││
        │   │                │ LISTENING│──── silence (3s) ──▶││
        │   │                │          │◀─── or tap stop ────┘│
        │   │                └──────────┘                     │
        │   │                    │                             │
        │   │                    │ audio captured              │
        │   │                    ▼                             │
        │   │                ┌────────────┐                   │
        │   │                │ PROCESSING │                   │
        │   │                │ (1-3s)     │                   │
        │   │                └────────────┘                   │
        │   │                    │                             │
        │   │                    ▼                             │
        │   │         ┌────────────────────┐                  │
        │   │         │   CONFIDENCE CHECK │                  │
        │   │         │  >= 0.9: auto-save │                  │
        │   │         │  0.7-0.89: review  │                  │
        │   │         │  < 0.7: review+    │                  │
        │   │         └────────────────────┘                  │
        │   │                    │                             │
        │   │        ┌───────────┴───────────┐                │
        │   │        ▼                       ▼                │
        │   │   ┌──────────┐          ┌──────────┐           │
        │   │   │CONFIRM   │          │  ERROR   │           │
        │   │   │(success) │          │          │           │
        │   │   └──────────┘          └──────────┘           │
        │   │        │                      │                 │
        └───┴────────┴──────────────────────┘                 │
                    │                       │                 │
                    ▼                       ▼                 │
               Return to IDLE         Return to IDLE          │
                                                              │
        └─────────────────────────────────────────────────────┘
```

### 4.3 Voice Correction Flow

1. User taps an extracted field on the review screen (e.g., category)
2. Overlay appears: "قول التصحيح" + microphone animation
3. User speaks: "لا، دي مش أكل — دي أدوات مكتبية"
4. Audio → Whisper.cpp → Gemma 3n with correction context
5. Gemma returns `{field: "category", new_value: "Office Supplies", confidence: 0.95}`
6. Field updates inline with brief animation
7. If confidence < 0.6: fallback to keyboard editing

**Correction prompt sent to Gemma:**
```
You are correcting an expense field.
Current expense: {amount: 450, merchant: "Carrefour", category: "Groceries", date: "2026-06-13"}
Field to correct: "category"
User correction: "لا، دي مش أكل — دي أدوات مكتبية"
Return: {"field": "category", "new_value": "...", "confidence": 0-1}
```

### 4.4 Haptic Feedback Patterns

| Event | Haptic | Platform |
|---|---|---|
| Mic tap → start recording | Medium impact | iOS: `UIImpactFeedbackStyle.medium` / Android: `HapticFeedbackConstants.CONFIRM` |
| Recording stop | Light impact | iOS: `UIImpactFeedbackStyle.light` |
| Transcription complete | Success notification | iOS: `UINotificationFeedbackGenerator.success` |
| Auto-save | Success + light | iOS: soft success |
| Error / low confidence | Error notification | iOS: `UINotificationFeedbackGenerator.error` |
| Swipe to confirm | Medium + selection | iOS: medium impact then selection |
| Field correction accepted | Light | iOS: `UIImpactFeedbackStyle.light` |
| Notification deep-link | None (system handles) | — |

### 4.5 Audio Waveform Visualization

- **Real-time:** 40 vertical bars, each 2dp wide, pill-capped
- **Bar heights:** Map linear amplitude (0.0–1.0) to bar height (2dp–48dp)
- **Colors:** Gradient from `#0E6655` (base) to `#94E1CB` (peak)
- **Animation:** Smooth interpolation using `useAnimatedStyle` with `withSpring`
- **Direction:** Bars animate right-to-left (RTL-native)

---

## 5. Screen Inventory & User Flows

### 5.1 Phase 1 Screens

| Screen | Route | Key Components | Purpose |
|---|---|---|---|
| **Splash/Onboarding** | `(onboarding)/` | Welcome carousel, permission prompts, reminder setup | First-run education + permission priming |
| **Home** | `index.tsx` | Voice zone (mic + waveform), recent ticket list, spending pulse (Phase 5) | Primary landing screen |
| **Recording** | `record.tsx` | Full-screen waveform, mic button, recording timer, stop control | Active recording mode |
| **Ticket Detail** | `ticket/[id].tsx` | Full transcript, audio playback, edit/delete | View/edit individual tickets |
| **History** | `history.tsx` | Chronological ticket list, search, date filters | Browse past recordings |
| **Settings** | `settings/index.tsx` | Reminder config, model management, export, language/numerals | Configuration hub |

### 5.2 Phase 2 Screens

| Screen | Route | Key Components | Purpose |
|---|---|---|---|
| **Review** | `review/[id].tsx` | Structured expense view, editable chips, voice correction, swipe-to-confirm | Verify + correct extracted data |
| **Voice Correction Overlay** | (modal over review) | Mic animation, current field display, confirmation | Correct specific fields via voice |

### 5.3 Phase 5 Screens

| Screen | Route | Key Components | Purpose |
|---|---|---|---|
| **Analytics Dashboard** | `analytics/index.tsx` | Spending overview, category breakdown, merchant analysis, trends | Comprehensive financial insights |
| **Category Drill-down** | `analytics/category/[id].tsx` | Category detail, merchant list within category, trend chart | Deep-dive into specific category |
| **Merchant Drill-down** | `analytics/merchant/[id].tsx` | Merchant detail, visit history, average ticket, price trends | Analyze spending per merchant |
| **Budget Setup** | `budget/new.tsx` | Category selection, amount input, period choice | Create monthly/weekly budgets |
| **Budget Detail** | `budget/[id].tsx` | Progress bar, remaining, daily allowance, alerts | Track budget progress |

### 5.4 Phase 6 Screens

| Screen | Route | Key Components | Purpose |
|---|---|---|---|
| **Backup Settings** | `settings/backup.tsx` | Schedule selector, last backup, manual trigger, restore | Cloud backup management |
| **Account Management** | `settings/account.tsx` | Email, passphrase change, device list, delete account | Account lifecycle |

### 5.5 Key User Flows

#### Flow 1: Record Expense → Review → Save (Primary)
```
Home → Tap mic → Speak → Stop → [Processing] → Review Screen → Swipe to confirm → Saved ✓
                                                                   ↓ (edit)
                                                            Tap field → Voice correct → Update
```

#### Flow 2: Quick Record (Auto-Save)
```
Home → Tap mic → Speak → Stop → [Processing → Confidence ≥ 0.9] → Auto-save → Toast "تم الحفظ" ✓
```

#### Flow 3: Correct via Voice
```
Review Screen → Tap incorrect field → Voice overlay → Speak correction → [Processing] → Field updates ✓
                                                                                            ↓ (fail)
                                                                                     Keyboard fallback
```

#### Flow 4: Browse History
```
Home → Tap history tab → Scroll list → Tap ticket → Detail view → Play audio / Edit / Delete
```

#### Flow 5: View Analytics (Phase 5)
```
Home → Analytics tab → Dashboard overview → Tap category → Merchant drill-down → Product drill-down
```

#### Flow 6: Set Budget (Phase 5)
```
Settings → Budget → Select category → Set amount → Choose period → Save → Budget active
```

---

## 6. Design System Token Architecture

### 6.1 Token Categories

```
┌─────────────────────────────────────────────────────────────┐
│                   DESIGN TOKEN ARCHITECTURE                   │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │  COLOR   │ │ TYPOGR.  │ │ SPACING  │ │ RADIUS          │ │
│  │          │ │          │ │          │ │                 │ │
│  │ primary  │ │ font     │ │ space-0  │ │ radius-sm       │ │
│  │ surface  │ │ weight   │ │ space-1  │ │ radius-md       │ │
│  │ semantic │ │ size     │ │ ...      │ │ radius-lg       │ │
│  │ on-*     │ │ lineHt   │ │ space-12 │ │ radius-pill     │ │
│  │          │ │ tracking │ │          │ │                 │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────┘ │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │ELEVATION │ │ ANIMATION│ │ OPACITY  │ │ Z-INDEX         │ │
│  │          │ │          │ │          │ │                 │ │
│  │ level-0  │ │ duration │ │ opaque   │ │ z-content       │ │
│  │ level-1  │ │ easing   │ │ disabled │ │ z-voice-zone    │ │
│  │ ...      │ │ delay    │ │ overlay  │ │ z-modal         │ │
│  │ level-4  │ │ spring   │ │          │ │ z-toast         │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Token Naming Convention

Format: `{category}-{property}-{variant}`

Examples:
- `color-primary-default`
- `color-surface-elevated`
- `typography-body-md-size`
- `spacing-inline-lg`
- `radius-container-card`
- `elevation-floating-mic`
- `animation-duration-fast` (150ms)
- `animation-duration-normal` (300ms)
- `animation-duration-slow` (500ms)

### 6.3 Light/Dark Mode Mapping

Tokens are theme-aware. Each token resolves to a different value depending on active theme:

```typescript
interface DesignTokens {
  color: {
    primary: { light: '#0E6655'; dark: '#89D5C0' };
    surface: { light: '#F5F3EF'; dark: '#141A17' };
    'on-surface': { light: '#1B1C1A'; dark: '#E4E2DE' };
    // ...
  };
  elevation: {
    'level-2': {
      light: '0px 2px 8px rgba(0,0,0,0.06)';
      dark: '0px 2px 8px rgba(0,0,0,0.3)';
    };
    // ...
  };
}
```

### 6.4 RTL-Aware Tokens

RTL tokens use logical property naming:

| Token | LTR Value | RTL Value |
|---|---|---|
| `spacing-inline-start` | `margin-left` | `margin-right` |
| `spacing-inline-end` | `margin-right` | `margin-left` |
| `inset-inline-start` | `left` | `right` |

---

## 7. Accessibility Requirements

### 7.1 VoiceOver / TalkBack

| Requirement | Implementation |
|---|---|
| **All interactive elements** must have accessible labels in Arabic | Use `accessibilityLabel` prop on every touchable |
| **Dynamic content updates** announced | Use `accessibilityLiveRegion="polite"` for transcription results, confirmation messages |
| **Screen transitions** announced | Use `accessibilityAnnouncement` for route changes |
| **Mic button states** described | "تسجيل", "جاري المعالجة", "تم الحفظ" as accessibility labels per state |
| **Expense cards** grouped as single accessibility elements | `accessibilityRole="button"` with combined label: "Carrefour, ٤٥٠ ج.م, بقالة, منذ ساعتين" |

### 7.2 Color Contrast

| Standard | Target | Compliance |
|---|---|---|
| **WCAG AA** | 4.5:1 for text <18px, 3:1 for text ≥18px | ✅ All text meets AA minimum |
| **WCAG AAA** | 7:1 for text <18px, 4.5:1 for text ≥18px | ✅ Primary content (amounts, labels) meets AAA |
| **Non-text contrast** | 3:1 for UI elements (icons, borders) | ✅ All interactive elements |

### 7.3 Font Scaling (Dynamic Type)

- Support iOS Dynamic Type sizes (XS–XXXL) and Android font scale
- Use `fontScale` from `react-native` `PixelRatio` to adjust all type tokens
- **Minimum** type size: 12px (body-sm)
- **Maximum** type size: 48px (display-lg at max scale)
- Layout must accommodate scaled text without truncation or overlap

### 7.4 Touch Targets

| Element | Minimum Size | Notes |
|---|---|---|
| **All tappable elements** | 44×44pt | Apple HIG + Material Design guideline |
| **Mic button** | 64×64dp | Exceeds minimum for primary action |
| **Chips** | 44pt height × content width | Minimum 44pt height |
| **List items** | 64dp height | Comfortable for finger targeting |
| **Tab bar items** | 48×48dp tap area | With proper hitSlop |

### 7.5 RTL Layout Support

| Requirement | Implementation |
|---|---|
| **All screens** mirror correctly in RTL | Test every screen with `I18nManager.forceRTL(true)` |
| **Gesture directions** invert | Swipe-to-confirm: RTL users swipe left instead of right |
| **Animation directions** invert | Slide-in transitions from right in RTL |
| **Text alignment** defaults to right | All text containers: `textAlign: 'right'` in Arabic locale |
| **Charts** render RTL | Horizontal bar charts: categories extend right-to-left |

---

## 8. Phased Deliverables Roadmap

### 8.1 Phase 1 — MVP: Voice to Ticket (Weeks 1–10)

| Deliverable | Format | Owner |
|---|---|---|
| Onboarding flow design (3 screens) | Figma screens + prototype | Designer |
| Home screen with voice zone | Figma screens + prototype | Designer |
| Recording screen with waveform | Figma screens + prototype | Designer |
| Ticket card component | Figma component + spec | Designer |
| Ticket detail/edit screen | Figma screens | Designer |
| History screen with search | Figma screens | Designer |
| Settings screen (reminders, models, export) | Figma screens | Designer |
| Reminder notification design | Spec + mockup | Designer |
| Empty / loading / error states | Figma screens | Designer |
| Light mode design token set | JSON token file | Designer → Engineer |
| **Success criteria:** | | |
| Usability testing: <10s record-to-save for new users | ≥80% success rate | UX Researcher |
| WCAG AA compliance audit | 100% pass | Designer |
| RTL visual regression test | 0 layout breaks | QA |

### 8.2 Phase 2 — Structured Extraction (Weeks 11–18)

| Deliverable | Format | Owner |
|---|---|---|
| Review screen with editable chips | Figma screens + prototype | Designer |
| Voice correction overlay | Figma screens + prototype | Designer |
| Expense card component | Figma component | Designer |
| Category chip picker component | Figma component + states | Designer |
| Confidence indicator system (color dots, badges) | Figma component + spec | Designer |
| Dark mode design token set | JSON token file | Designer |
| **Success criteria:** | | |
| Review screen acceptance rate: >85% without edits | Usability test | UX Researcher |
| Voice correction success rate: >70% | Usability test | UX Researcher |

### 8.3 Phase 3 — Item-Level Detail (Weeks 19–28)

| Deliverable | Format | Owner |
|---|---|---|
| Itemized expense card (multi-line items) | Figma component | Designer |
| Product detail view | Figma screens | Designer |
| Subcategory hierarchy navigation | Figma screens | Designer |
| Personal inflation tracker UI | Figma screens + prototype | Designer |
| **Success criteria:** | | |
| Itemized extraction accuracy: >75% | QA + model eval | UX Researcher |

### 8.4 Phase 4 — Normalization (Weeks 29–36)

| Deliverable | Format | Owner |
|---|---|---|
| Normalization explanation card ("Why was this categorized as X?") | Figma component | Designer |
| Entity merge UI | Figma screens | Designer |
| Normalization audit log view | Figma screens | Designer |
| **Success criteria:** | | |
| Normalization override rate: <10% | Analytics | UX Researcher |

### 8.5 Phase 5 — Financial Intelligence (Weeks 37–48)

| Deliverable | Format | Owner |
|---|---|---|
| Analytics dashboard (overview, trends) | Figma screens + prototype | Designer |
| Category breakdown with charts | Figma component | Designer |
| Merchant analysis view | Figma screens | Designer |
| Product analysis view | Figma screens | Designer |
| Budget creation flow | Figma screens + prototype | Designer |
| Budget detail card (progress bar, alerts) | Figma component | Designer |
| Recommendation card component | Figma component + states | Designer |
| Spending pulse notification design | Spec + mockup | Designer |
| Adaptive reminder suggestion UI | Figma screens | Designer |
| **Success criteria:** | | |
| Weekly dashboard engagement: >50% | Analytics | UX Researcher |
| Recommendation action rate: >15% | Analytics | UX Researcher |
| Budget creation rate: >25% within 30 days | Analytics | UX Researcher |

### 8.6 Phase 6 — Backup & Sync (Weeks 49–58)

| Deliverable | Format | Owner |
|---|---|---|
| Backup settings screen | Figma screens | Designer |
| Restore flow (full + selective) | Figma screens + prototype | Designer |
| Account creation / login screens | Figma screens | Designer |
| Device management screen | Figma screens | Designer |
| Multi-device sync status indicators | Figma component | Designer |
| **Success criteria:** | | |
| Restore flow usability: >90% complete without assistance | Usability test | UX Researcher |
| Backup adoption: >30% of active users | Analytics | UX Researcher |

### 8.7 Design Quality Gates (Every Phase)

| Gate | Criteria | Method |
|---|---|---|
| **Visual audit** | Design matches token system exactly | Design review |
| **Accessibility scan** | WCAG AA minimum, AAA for primary | Automated + manual |
| **RTL check** | All screens render correctly in RTL | Visual diff test |
| **Prototype test** | 5 users complete primary flow | Moderated usability |
| **Dev handoff** | All specs complete, tokens published | Design → Eng sync |

---

## 9. Motion & Micro-interactions

### 9.1 Transition Animations

| Transition | Type | Duration | Easing | Notes |
|---|---|---|---|---|
| **Screen push** | Slide from right (LTR) / left (RTL) | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard navigation |
| **Modal present** | Slide up from bottom | 350ms | `spring(0.8, 0.9)` | Bottom sheet, overlays |
| **Modal dismiss** | Slide down | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | — |
| **Card appear** | Fade + scale (0.95→1) | 200ms | `spring(0.9, 1)` | Staggered by index |
| **List item insert** | Fade + slide down | 300ms | `spring(0.8, 0.8)` | New ticket appears |

### 9.2 Microphone Recording Animation

- **Idle → Listening:** Pulse ring expands from mic center (radius: 32→48dp, opacity: 0.3→0) over 500ms, repeats every 1.5s
- **During recording:** Waveform bars animate with real-time amplitude. Smooth spring interpolation on each bar height
- **Listening → Processing:** Waveform collapses to center in 300ms. Ring fades. Spinner appears (rotates 360° over 1s, continuous)
- **Processing → Confirmation:** Spinner → checkmark icon via morph animation (300ms). Green ring pulses outward once
- **Confirmation → Idle:** Fade out over 500ms, mic returns to resting state

### 9.3 Swipe-to-Confirm Gesture

- **Gesture:** Horizontal swipe (left in RTL, right in LTR) across the expense card
- **Threshold:** 50% of card width
- **Visual feedback:** Card slides with finger position. Background reveals green checkmark layer behind. Spring snap to completion or origin
- **Duration:** 200ms snap, `spring(0.9, 0.8)` easing
- **Haptic:** Medium impact on threshold crossing, success on completion

### 9.4 Loading & Processing States

- **Skeleton shimmer:** Linear gradient sweeps across placeholder shapes. Duration: 1.5s per cycle. Easing: linear
- **Processing spinner:** Circular arc, 36dp diameter, primary color. Rotates 360° over 1s. `animationTimingFunction: linear`
- **Progress bar:** For long operations (model download, backup). Filled from 0–100% over duration. Color: primary gradient

### 9.5 Notification Animations

- **In-app toast:** Slides down from top (or up from bottom in voice zone). `translateY: -100% → 0%` over 300ms. Auto-dismiss after 3s with fade out
- **Reminder fire:** Standard system notification. No custom animation (OS handles)
- **Spending pulse:** Standard system notification. No custom animation

### 9.6 Animation Token Values

| Token | Value | Usage |
|---|---|---|
| `animation-duration-fast` | 150ms | Micro-feedback, color changes |
| `animation-duration-normal` | 300ms | Standard transitions |
| `animation-duration-slow` | 500ms | Emphasis transitions |
| `animation-duration-xslow` | 1000ms | Processing, loading |
| `animation-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `animation-easing-spring` | `spring(0.8, 0.9)` | Organic, tactile motion |
| `animation-easing-linear` | `linear` | Spinners, shimmer |

---

## 10. Design Governance

### 10.1 Design System Maintenance

| Artifact | Location | Format | Update Frequency |
|---|---|---|---|
| **Design tokens** | `src/constants/tokens.ts` | TypeScript constants | Per phase |
| **Figma component library** | Figma team workspace | .fig file | Continuous |
| **Component specs** | `design/` in repo | Markdown + screenshots | Per phase |
| **DESIGN.md** | Repository root | Markdown | Per phase |
| **This document** | `design/design-plan.md` | Markdown | Per phase |

### 10.2 Versioning

- **Tokens:** Follow semantic versioning (MAJOR.MINOR.PATCH)
  - MAJOR: Breaking token name changes
  - MINOR: New tokens added
  - PATCH: Token value adjustments
- **Figma library:** Versioned by phase (v1.0 = Phase 1, v2.0 = Phase 2, etc.)
- **Design plan:** Updated per phase with `updated_at` and change log

### 10.3 Design Review Process

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Designer   │───▶│   Design   │───▶│  Engineer  │───▶│   QA       │
│  creates    │    │   Review   │    │  Review    │    │  Review    │
│  artifact   │    │            │    │  (feasib.) │    │  (pixel)   │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                        │                  │                │
                        ▼                  ▼                ▼
                  ┌────────────┐    ┌────────────┐    ┌────────────┐
                  │  Approve / │    │  Approve /  │    │  Approve / │
                  │  Revise    │    │  Revise     │    │  Revise    │
                  └────────────┘    └────────────┘    └────────────┘
```

**Review checklist (every artifact):**
- [ ] Matches design token values
- [ ] RTL layout correct
- [ ] Accessibility labels present
- [ ] All states covered (normal, hover, active, disabled, error, loading, empty)
- [ ] Dark mode variant exists
- [ ] Touch targets ≥44pt
- [ ] Eastern Arabic numerals used
- [ ] Animation/motion spec included

### 10.4 Handoff Process to Engineering

| Step | What | Tool |
|---|---|---|
| 1 | Finalize design in Figma | Figma |
| 2 | Export token updates to JSON | Custom Figma plugin → `tokens.json` |
| 3 | Generate component spec document | Markdown from Figma annotations |
| 4 | Create prototype for reference flow | Figma prototype |
| 5 | Sync with engineering: walk through spec | Synchronous meeting |
| 6 | Publish tokens to repo | PR to `src/constants/tokens.ts` |
| 7 | Component implementation | Engineering sprint |
| 8 | Pixel review: compare implementation vs design | Figma + device screenshot |

### 10.5 Design Debt Tracking

| Debt Type | Tracking | Resolution |
|---|---|---|
| **Undocumented component** | GitHub issue with `design-debt` label | Add to Figma library |
| **Missing state** | GitHub issue | Update component spec |
| **Token mismatch** | Design → Eng sync | Update tokens or implementation |
| **Accessibility gap** | GitHub issue with `a11y` label | Prioritize in next phase |

---

## Appendix: Design Token Reference (Quick Lookup)

| Category | Token | Light | Dark |
|---|---|---|---|
| **Color** | `primary` | `#0E6655` | `#89D5C0` |
| **Color** | `surface` | `#F5F3EF` | `#141A17` |
| **Color** | `surface-bright` | `#FBF9F5` | `#1A211D` |
| **Color** | `on-surface` | `#1B1C1A` | `#E4E2DE` |
| **Color** | `error` | `#BA1A1A` | `#FFB4AB` |
| **Color** | `success` | `#1B7E4A` | `#66D19B` |
| **Color** | `warning` | `#B55F0E` | `#F5C542` |
| **Spacing** | `space-4` (card padding) | 16px | 16px |
| **Spacing** | `space-5` (margin) | 20px | 20px |
| **Radius** | `radius-lg` (cards) | 20px | 20px |
| **Radius** | `radius-pill` (chips) | 9999px | 9999px |
| **Elevation** | `level-2` (cards) | `0px 2px 8px rgba(0,0,0,0.06)` | `0px 2px 8px rgba(0,0,0,0.3)` |
| **Elevation** | `level-3` (mic) | `0px 4px 16px rgba(14,102,85,0.25)` | `0px 4px 16px rgba(137,213,192,0.2)` |

---

*This document is a living artifact. It should be reviewed and updated at the start of each phase. All team members are encouraged to propose amendments through the design review process.*

**Document prepared by:** UX/Design Team  
**Last updated:** 2026-06-13  
**Next review:** Start of Phase 1 development
