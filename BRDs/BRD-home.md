# Masroof (مصروف) — Home Screen

**Business Requirements Document (BRD)**

| Document Control | |
|---|---|
| **Document ID** | BRD-003 |
| **Version** | 1.0 |
| **Status** | Draft for Review |
| **Date** | 2026-06-19 |
| **Author** | Product Team |
| **Classification** | Internal — Confidential |

**Change History**

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 1.0 | 2026-06-19 | Product Team | Initial BRD for Home screen |

---

## 1. Executive Summary

The Home screen is the **primary landing surface** users see after completing onboarding. It is the centerpiece of the Masroof experience — the place where users record expenses, review recent activity, and navigate to other parts of the app. The core interaction model is simple: **tap mic → speak → save**. For Phase 1 (MVP), the Home screen serves as a functional UI shell: the mic button is a visual anchor, recent expenses use placeholder data, and there is no actual audio recording or database integration yet.

This document covers the Home screen layout, its bottom tab navigation structure, placeholder states for History and Settings tabs, and the i18n keys required. The screen uses existing components (`Header`, `Button`, `Text`, `SafeAreaView`, `Container`), NativeWind theme tokens, Cairo fonts, and RTL layout. No animations, no permission flows, and no real recording logic are included — this is a pure structural and functional foundation for Phase 1.

---

## 2. Screen Layout & Structure

The Home screen consists of four zones, stacked vertically:

```
┌──────────────────────────────────────┐
│          Header (greeting)           │  ← Existing Header component
├──────────────────────────────────────┤
│                                      │
│      [Tab Content Area]              │  ← Renders active tab content
│    (Home / History / Settings)        │
│                                      │
├──────────────────────────────────────┤
│            Tab Bar                   │  ← 3 tabs at bottom
│    🎤 Home  📋 History  ⚙️ Settings  │
└──────────────────────────────────────┘
```

### Zone Breakdown

| Zone | Component | Details |
|---|---|---|
| **Header** | `src/components/Header.tsx` | Avatar + "مرحبا, {name}" greeting. Uses existing component unchanged. |
| **Content** | Per-tab content | Switches based on active tab. See Section 4. |
| **Tab Bar** | Custom or `expo-router/unstable-native-tabs` | 3 tabs at bottom, persistent across all tabs. |
| **Safe Area** | `SafeAreaView` from `src/components/layout/SafeAreaView.tsx` | Wraps the entire screen with `bg-background flex-1`. |

---

## 3. Functional Requirements

| ID | Requirement | Acceptance Criteria | Priority |
|---|---|---|---|
| REQ-HOME-1 | **Greeting Header** — Display user avatar + name at top | 1. Uses existing `Header` component from `src/components/Header.tsx`<br/>2. Greeting displays placeholder name "احمد" with "مرحبا, " prefix<br/>3. Avatar shows placeholder user image or initials fallback | P0 |
| REQ-HOME-2 | **Mic Button (placeholder)** — Large mic button centered in the Home tab | 1. Circular button, 80×80dp, `bg-primary` with white mic icon<br/>2. `Ionicons` `mic` at 36dp, color `text-on-primary`<br/>3. On press: logs "mic tapped" to console (no recording yet)<br/>4. Status text below: `t('home.tapToRecord')` in `text-muted-foreground` `text-sm` | P0 |
| REQ-HOME-3 | **Waveform Placeholder** — Simple static waveform below the mic | 1. Row of 5 static bars (varies in height: 8dp, 16dp, 24dp, 16dp, 8dp)<br/>2. Bars: 3dp wide, `rounded-full`, `bg-primary/30`<br/>3. Centered below status text, 24dp gap from mic<br/>4. Purely decorative — no animation, no real audio data | P1 |
| REQ-HOME-4 | **Recent Expenses List** — Simple list of placeholder expenses | 1. Section title: `t('home.recentExpenses')` using `section-title` component class<br/>2. FlatList of 3–5 hardcoded placeholder items<br/>3. Each item: mic icon + short transcript + timestamp<br/>4. Items use `surface-bright` background, `radius-lg`, subtle shadow<br/>5. No tap navigation — purely visual for MVP | P1 |
| REQ-HOME-5 | **Tab Navigation** — Bottom bar switches between 3 tabs | 1. Three tabs: Home, History, Settings<br/>2. Active tab: primary color, filled icon, `label-lg` weight<br/>3. Inactive tab: `text-muted-foreground`, outline icon, regular weight<br/>4. Tab content swaps without animations (instant switch)<br/>5. Tab bar is always visible, never hidden | P0 |
| REQ-HOME-6 | **History Tab (placeholder)** — Empty state screen | 1. Centered empty state: large list icon (Ionicons `list-outline`, 64dp)<br/>2. Title: `t('home.history.emptyTitle')`<br/>3. Description: `t('home.history.emptyDescription')`<br/>4. No interaction — placeholder only | P0 |
| REQ-HOME-7 | **Settings Tab (placeholder)** — Basic options list | 1. Section title: `t('home.settings.title')`<br/>2. List of 3 static rows with icons and chevrons:<br/>   - Language (`t('home.settings.language')`)<br/>   - Reminders (`t('home.settings.reminders')`)<br/>   - About (`t('home.settings.about')`)<br/>3. Rows are non-interactive (placeholder styling only)<br/>4. No actual settings functionality for MVP | P1 |
| REQ-HOME-8 | **Theme & Design Compliance** — All styling uses token system | 1. Entire screen uses NativeWind classes from `global.css`<br/>2. No hardcoded colors (`bg-[#hex]`, `text-[#hex]`) anywhere<br/>3. All text uses `t()` from `react-i18next` — zero hardcoded strings<br/>4. RTL layout renders correctly (verified in Arabic)<br/>5. Font: Cairo via `font-cairo-{weight}` classes | P0 |

---

## 4. Tab Navigation Spec

### 4.1 Tab Bar Layout

Persistent at bottom of screen, ~64dp height, `bg-surface` background with top border (`border-outline-variant`).

| Tab | Icon (Active) | Icon (Inactive) | Label Key | Content |
|---|---|---|---|---|
| **Home** | `mic` (filled, primary) | `mic-outline` (muted) | `t('tabs.home')` | Mic + waveform + recent expenses list |
| **History** | `list` (filled, primary) | `list-outline` (muted) | `t('tabs.history')` | Empty state with icon + text |
| **Settings** | `settings` (filled, primary) | `settings-outline` (muted) | `t('tabs.settings')` | Placeholder settings list |

### 4.2 Tab State

| Property | Active Tab | Inactive Tab |
|---|---|---|
| **Icon color** | `colors.primary` | `colors.onSurfaceVariant` |
| **Icon style** | Filled (e.g., `mic`) | Outline (e.g., `mic-outline`) |
| **Label color** | `text-primary` | `text-muted-foreground` |
| **Label weight** | `font-cairo-semibold` | `font-cairo-regular` |
| **Label size** | 11dp | 11dp |
| **Touch target** | 48×48dp minimum per item | Same |

### 4.3 Implementation Notes

- Use local `useState< 'home' \| 'history' \| 'settings' >('home')` to track active tab.
- Render content conditionally — no tab router for MVP (simpler, avoids navigation stack complexity).
- Tab bar icons: `import Ionicons from '@expo/vector-icons/Ionicons'`.
- Chevron icons for Settings rows: `Ionicons` `chevron-forward` (auto-mirrors in RTL).

---

## 5. Empty & Loading States

### 5.1 Empty State — History Tab

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│           📋 (list icon)             │  ← Ionicons list-outline, 64dp
│                                      │
│       لا توجد مصروفات بعد             │  ← h2, centered, text-foreground
│     (No expenses yet)                │
│                                      │
│   هتظهر المصروفات اللي تسجلها هنا    │  ← muted, centered
│   (Your recordings will appear here) │
│                                      │
└──────────────────────────────────────┘
```

### 5.2 Home Tab — Recent Expenses (With Data)

When there are recorded expenses (for MVP, hardcoded placeholder items):

| Element | Style |
|---|---|
| **Section header** | `className="section-title"` |
| **Card** | `className="bg-surface-bright rounded-[20px] p-4 mb-3"` |
| **Card icon** | `Ionicons` `mic-outline`, `text-primary`, 20dp |
| **Card transcript** | `text-sm text-on-surface font-cairo` |
| **Card timestamp** | `text-xs text-muted-foreground` |

Placeholder data (hardcoded for MVP):

| # | Icon | Transcript | Timestamp |
|---|---|---|---|
| 1 | 🎤 | "دفعت ٤٥٠ جنيه في Carrefour على أكل البيت" | منذ ٢ ساعة |
| 2 | 🎤 | "Uber ride to the office — 85 pounds" | أمس ٩:١٥ ص |
| 3 | 🎤 | "اشتريت سندوتشات من Metro ب ١٢٠ جنيه" | أمس ٢:٣٠ م |

### 5.3 Loading State

Not required for MVP — no data fetching occurs. The screen renders static content immediately. If future phases introduce async loading (e.g., fetching from SQLite), use a skeleton shimmer matching card dimensions.

---

## 6. Translation Keys

Add the following keys under `home`, `tabs`, and `settings` namespaces:

| Key | Arabic | English |
|---|---|---|
| `home.tapToRecord` | اضغط للتسجيل | Tap to record |
| `home.recording` | جاري التسجيل... | Recording... |
| `home.recentExpenses` | آخر المصروفات | Recent Expenses |
| `home.history.emptyTitle` | لا توجد مصروفات بعد | No expenses yet |
| `home.history.emptyDescription` | هتظهر المصروفات اللي تسجلها هنا | Your recordings will appear here |
| `home.settings.title` | الإعدادات | Settings |
| `home.settings.language` | اللغة | Language |
| `home.settings.reminders` | التذكيرات | Reminders |
| `home.settings.about` | عن التطبيق | About |
| `tabs.home` | الرئيسية | Home |
| `tabs.history` | السجل | History |
| `tabs.settings` | الإعدادات | Settings |

---

## 7. Key Design Decisions

| Decision | Approach | Rationale |
|---|---|---|
| **Tab implementation** | Local `useState` + conditional rendering | Avoids router complexity for MVP. Tabs are simple content switches, not independent navigation stacks. |
| **Mic button size** | 80×80dp (larger than standard 64dp) | Home screen's primary CTA deserves visual prominence. Exceeds 44pt minimum touch target. |
| **Waveform** | 5 static bars (decorative only) | Provides visual context for the voice-first value prop without implementing real audio visualization. |
| **Placeholder data** | Hardcoded array in component | No DB dependency for MVP. Data can be swapped for SQLite queries in Phase 1+. |
| **Header** | Reuse existing `Header.tsx` as-is | Already built and aligned with design system. No changes needed. |

---

## 8. Component Hierarchy

```
HomeScreen (SafeAreaView)
├── Header
├── Content (conditional on activeTab)
│   ├── [Home Tab]
│   │   ├── MicButton (TouchableOpacity, 80dp, bg-primary, rounded-full)
│   │   │   └── Ionicons "mic" (36dp, text-on-primary)
│   │   ├── StatusText (Text, muted, centered)
│   │   ├── WaveformPlaceholder (View, row of 5 static bars)
│   │   └── RecentExpensesList
│   │       ├── SectionTitle ("آخر المصروفات")
│   │       └── FlatList
│   │           └── ExpenseCard (per item)
│   ├── [History Tab]
│   │   └── EmptyState (icon + title + description, centered)
│   └── [Settings Tab]
│       └── SettingsList
│           ├── SettingsRow (Language)
│           ├── SettingsRow (Reminders)
│           └── SettingsRow (About)
├── Divider (border-outline-variant, h-0)
└── TabBar (View, flex-row, justify-around, bg-surface, py-2)
    ├── TabItem (Home)
    ├── TabItem (History)
    └── TabItem (Settings)
```

---

*End of Document — BRD-003: Masroof Home Screen*
