# Masroof (مصروف) — Home Screen Design Plan

**Document ID:** DP-002  
**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-06-19  
**Author:** UX/Design Team  
**Classification:** Internal — Confidential  

---

## 1. Design Philosophy

Warm Tactile Minimalism manifests on the Home screen through three decisions:

- **Voice-first hierarchy:** The mic button (80dp, `bg-primary`) dominates the center of the Home tab — it's the largest interactive element, bigger than any text, reinforcing that voice is the primary input.
- **Tactile warmth via soft geometry:** All cards use `rounded-[20px]` radius, the mic button is `rounded-full`, and the waveform bars are `rounded-full` — no hard corners anywhere. The `bg-surface-bright` cards sit on `bg-background`, creating subtle tonal depth without heavy shadows.
- **Reduced cognitive load:** Only one CTA (the mic), a short list of recent expenses, and a 3-tab navigation. No forms, no filters, no settings gear on the home tab. The screen communicates: *tap and speak, we handle the rest.*

---

## 2. Visual Layout — Screen Structure

```
┌──────────────────────────────────────┐
│   Header (Avatar + "مرحبا, احمد")     │  ← Existing Header component, pt-4 px-4
├──────────────────────────────────────┤
│                                      │
│  ┌─ Home Tab (default) ──────────┐  │
│  │          🎤 (80dp)            │  │  ← Mic button, centered
│  │       اضغط للتسجيل            │  │  ← Status text, muted, text-sm
│  │     ▏▌▐▌▐                      │  │  ← Waveform placeholder (5 bars)
│  │                                │  │
│  │  آخر المصروفات                 │  │  ← section-title class
│  │  ┌─────────────────────────┐  │  │
│  │  │ 🎤 ٤٥٠ ج Carrefour ... │  │  │  ← Expense card, bg-surface-bright
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ 🎤 ٨٥ ج Uber ride ...  │  │  │
│  │  └─────────────────────────┘  │  │
│  └──────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  🎤 الرئيسية    📋 السجل    ⚙️ إعدادات│  ← Tab bar, 64dp, bg-surface
└──────────────────────────────────────┘
```

**Container:** `SafeAreaView` (`bg-background flex-1`) wraps everything.  
**Orientation:** RTL (Arabic-first). Margins/padding use logical properties via NativeWind.

---

## 3. Home Tab Design

### 3.1 Header
- **Component:** `src/components/Header.tsx` — reused as-is.
- **Content:** `<Avatar>` (image with fallback initials) + `"مرحبا, احمد"` (`text-primary text-2xl font-cairo-bold`).
- **No changes** to the existing component.

### 3.2 Voice Recording Zone (Placeholder)
| Element | Spec | Tailwind / Token |
|---|---|---|
| **Mic button** | 80×80dp circle, `TouchableOpacity` | `bg-primary rounded-full w-20 h-20` |
| **Mic icon** | `Ionicons` `"mic"`, 36dp | `color={colors.onPrimary}` |
| **On press** | `console.log("mic tapped")` | No-op for MVP |
| **Status text** | Below button, centered | `className="text-sm text-muted-foreground text-center mt-3"` via `t('home.tapToRecord')` |
| **Waveform** | Row of 5 `View` bars, centered, 24dp gap from status | `bg-primary/30 rounded-full` — heights: 8, 16, 24, 16, 8 dp, width 3dp, `gap-1` |

> Mic button uses `justify-center items-center` layout, positioned with `mx-auto mt-12` (approximately 48dp from the header bottom).

### 3.3 Recent Expenses List
| Element | Spec | Tailwind |
|---|---|---|
| **Section title** | `t('home.recentExpenses')` | `className="section-title"` (uses `text-lg font-semibold text-secondary mt-7.5 mb-4`) |
| **FlatList** | 3 hardcoded placeholder items, `data` array in component | ScrollView or FlatList with `px-5` horizontal |
| **Expense card** | `bg-surface-bright rounded-[20px] p-4 mb-3` | `flex-row items-center gap-3` |
| **Card icon** | `Ionicons` `"mic-outline"`, 20dp | `color={colors.primary}` |
| **Transcript** | Placeholder text (e.g., "دفعت ٤٥٠ جنيه في Carrefour") | `text-sm text-on-surface font-cairo flex-1` |
| **Timestamp** | Relative time (e.g., "منذ ٢ ساعة") | `text-xs text-muted-foreground` |
| **Shadow** | Elevation level 2 | Handled by NativeWind (light: 0px 2px 8px rgba(0,0,0,0.06)) |

**Placeholder data (hardcoded):**
```
{ icon: "mic-outline", text: "دفعت ٤٥٠ جنيه في Carrefour على أكل البيت", time: "منذ ٢ ساعة" }
{ icon: "mic-outline", text: "Uber ride to the office — 85 pounds", time: "أمس ٩:١٥ ص" }
{ icon: "mic-outline", text: "اشتريت سندوتشات من Metro ب ١٢٠ جنيه", time: "أمس ٢:٣٠ م" }
```

---

## 4. History Tab Design (Empty State)

| Element | Spec | Tailwind / Token |
|---|---|---|
| **Wrapper** | Centered vertically & horizontally | `flex-1 justify-center items-center px-8` |
| **Icon** | `Ionicons` `"list-outline"`, 64dp | `color={colors.onSurfaceVariant}` |
| **Title** | `t('home.history.emptyTitle')` (لا توجد مصروفات بعد) | `text-h2 text-foreground text-center font-cairo-bold mt-4` |
| **Description** | `t('home.history.emptyDescription')` (هتظهر المصروفات اللي تسجلها هنا) | `text-sm text-muted-foreground text-center mt-2` |
| **Spacing** | Gap between icon and text: 16dp | `gap-4` on container |

No interactive elements — purely a placeholder screen.

---

## 5. Settings Tab Design

| Element | Spec | Tailwind |
|---|---|---|
| **Section title** | `t('home.settings.title')` | `className="section-title"` (`px-5` for margin alignment) |
| **Row container** | `bg-surface-bright rounded-[20px]` | `mx-5 overflow-hidden` |
| **Each row** | 52dp height, `flex-row items-center justify-between` | `px-4 py-3.5` |
| **Row icon** | `Ionicons` (see table below), 22dp | `color={colors.primary}` |
| **Row label** | `t('home.settings.language')` etc. | `text-base text-on-surface font-cairo flex-1 mr-3` |
| **Chevron** | `Ionicons` `"chevron-forward"`, 18dp | `color={colors.onSurfaceVariant}`, auto-mirrors in RTL |
| **Divider** | Between rows (except last) | `border-b border-outline-variant ml-14` (indented past icon) |

| Row | Icon | Label Key | Icon Name |
|---|---|---|---|
| Language | Globe | `t('home.settings.language')` | `"language-outline"` |
| Reminders | Bell | `t('home.settings.reminders')` | `"notifications-outline"` |
| About | Info | `t('home.settings.about')` | `"information-circle-outline"` |

Rows are non-interactive for MVP (no `onPress` handlers).

---

## 6. Tab Bar Design

### 6.1 Layout
| Property | Value |
|---|---|
| **Height** | 64dp |
| **Background** | `bg-surface` |
| **Top border** | `border-t border-outline-variant` |
| **Layout** | `flex-row justify-around items-center` |
| **Bottom padding** | `pb-2` (safe area compensation) |
| **Top padding** | `pt-2` |

### 6.2 Tab States
| Property | Active | Inactive |
|---|---|---|
| **Icon** | Filled (e.g., `"mic"`) | Outline (e.g., `"mic-outline"`) |
| **Icon color** | `colors.primary` | `colors.onSurfaceVariant` |
| **Icon size** | 26dp | 26dp |
| **Label** | `t('tabs.home')` etc. | Same key |
| **Label color** | `text-primary` | `text-muted-foreground` |
| **Label weight** | `font-cairo-semibold` | `font-cairo-regular` |
| **Label size** | 11dp | 11dp |
| **Touch target** | 48×48dp minimum (`hitSlop` not needed due to `min-w-12 min-h-12`) | Same |

### 6.3 Tab Item Spec
```
┌─────────────┐
│    [icon]   │  ← Touchable, flex-col items-center
│   label     │
└─────────────┘
```
- Icon: `Ionicons` at 26dp
- Label: `Text` at 11dp, 4dp gap from icon
- Conditional styling: icon name swaps between filled/outline, colors swap via ternary on `activeTab`

### 6.4 Tab Mapping
| Tab | Active Icon | Inactive Icon | Label Key |
|---|---|---|---|
| Home | `mic` | `mic-outline` | `t('tabs.home')` |
| History | `list` | `list-outline` | `t('tabs.history')` |
| Settings | `settings` | `settings-outline` | `t('tabs.settings')` |

---

## 7. Dark Mode — Token Mapping

Every Tailwind class used on the Home screen maps to a CSS custom property that resolves differently in `.dark`. No hardcoded changes needed — the theme system handles it.

| Element | Light (Tailwind) | Dark Resolves To | Notes |
|---|---|---|---|
| **Background** | `bg-background` | `#101413` | Base dark |
| **Surface cards** | `bg-surface-bright` | `#363a38` | Elevated cards |
| **Tab bar** | `bg-surface` | `#101413` | Same as background |
| **Primary text** | `text-on-surface` | `#e0e3e0` | High contrast |
| **Muted text** | `text-muted-foreground` | `#bec9c4` | `on-surface-variant` |
| **Primary actions** | `bg-primary` | `#89d5c0` | Teal-green in dark |
| **On-primary icon** | `text-on-primary` | `#00382d` | Dark text on teal |
| **Divider** | `border-outline-variant` | `#3f4945` | Subtle in dark |
| **Inactive tab icon** | `text-muted-foreground` | `#bec9c4` | Matches text |

To test: wrap the Home screen in a `.dark` class container; all tokens should invert automatically via NativeWind's `.dark` variant support.

---

## 8. Edge Cases

| Case | Behavior |
|---|---|
| **Empty expenses list** | If the hardcoded array is empty (future dynamic data), show the section title with no cards below it — no separate empty state for the list itself, since the mic button already invites action. |
| **Long transcript text** | Expense card transcript uses `flex-1` with `numberOfLines={2}` via RN `Text`, truncating with ellipsis. No layout break. |
| **Long user name** | Header text `"مرحبا, احمد"` truncates with ellipsis if >20 chars. Avatar stays fixed at 64×64dp. |
| **RTL misalignment** | All `flex-row` items use `flex-row` (NativeWind handles direction). Test with `I18nManager.forceRTL(true)`. Chevron icons (`chevron-forward`) auto-mirror on iOS; Android may need `style={{ transform: [{ scaleX: -1 }] }}` if direction is wrong. |
| **Tab bar on notch devices** | `SafeAreaView` already handles bottom safe area padding via `react-native-safe-area-context`. Tab bar gets `pb-2` for extra breathing room. |
| **Status text overflow** | Mic status text is `text-sm` single line, centered. Unlikely to overflow; if needed, `numberOfLines={1}`. |
| **3 tabs only (no overflow)** | 3 items with `justify-around` distribute evenly. No horizontal scroll needed. |

---

## 9. Component States

### 9.1 Mic Button
| State | Visual | Implementation |
|---|---|---|
| **Idle** | `bg-primary rounded-full w-20 h-20`, mic icon `color={colors.onPrimary}` | Default render |
| **Pressed** | `opacity-80` via `TouchableOpacity` `activeOpacity={0.8}` | TouchableOpacity built-in |
| **Disabled** | `opacity-50`, no icon change | N/A for MVP (always enabled) |

### 9.2 Tab Items
| State | Icon | Label | Container |
|---|---|---|---|
| **Active** | Filled (`mic`), `color={colors.primary}` | `text-primary font-cairo-semibold` | No background change |
| **Inactive** | Outline (`mic-outline`), `color={colors.onSurfaceVariant}` | `text-muted-foreground font-cairo-regular` | `opacity-100` |
| **Pressed** (momentary) | `opacity-80` via `Pressable` | — | iOS highlight handled by `Pressable` |

### 9.3 Expense List Items
| State | Background | Text |
|---|---|---|
| **Default** | `bg-surface-bright` | On-surface / muted-foreground |
| **Pressed** | `opacity-90` via `Pressable` (if interactive in future) | No change |
| **Empty** | Section title visible, no cards | N/A |

### 9.4 Settings Rows
| State | Visual |
|---|---|
| **Default** | `bg-surface-bright`, icon `color={colors.primary}`, chevron visible |
| **Pressed** | N/A (MVP — no interaction) |

---

## 10. New i18n Keys Required

Add the following to both `src/i18n/locales/{ar,en}/translations.json`:

```json
{
  "home": {
    "tapToRecord": "اضغط للتسجيل",
    "recording": "جاري التسجيل...",
    "recentExpenses": "آخر المصروفات",
    "history": {
      "emptyTitle": "لا توجد مصروفات بعد",
      "emptyDescription": "هتظهر المصروفات اللي تسجلها هنا"
    },
    "settings": {
      "title": "الإعدادات",
      "language": "اللغة",
      "reminders": "التذكيرات",
      "about": "عن التطبيق"
    }
  },
  "tabs": {
    "home": "الرئيسية",
    "history": "السجل",
    "settings": "الإعدادات"
  }
}
```

**English equivalents:**
```json
{
  "home": {
    "tapToRecord": "Tap to record",
    "recording": "Recording...",
    "recentExpenses": "Recent Expenses",
    "history": {
      "emptyTitle": "No expenses yet",
      "emptyDescription": "Your recordings will appear here"
    },
    "settings": {
      "title": "Settings",
      "language": "Language",
      "reminders": "Reminders",
      "about": "About"
    }
  },
  "tabs": {
    "home": "Home",
    "history": "History",
    "settings": "Settings"
  }
}
```

Note: `home.title` and `settings.title` already exist in the current i18n files. The new keys above supersede the generic `home.title` — use the screen-specific `home.tapToRecord` and `home.recentExpenses` instead.

---

## 11. Implementation Checklist

- [ ] Reuse existing `Header.tsx` — no changes
- [ ] Wrap screen in `SafeAreaView` (`bg-background flex-1`)
- [ ] Add `useState<'home' | 'history' | 'settings'>('home')` for tab switching
- [ ] Render mic button: `TouchableOpacity` + `Ionicons` + `console.log` on press
- [ ] Render waveform: 5 static `View` bars with `bg-primary/30`
- [ ] Render recent expenses: `FlatList` with 3 hardcoded objects
- [ ] Render History tab: centered empty state (icon + title + description)
- [ ] Render Settings tab: section title + 3 rows (icon, label, chevron)
- [ ] Render Tab Bar: 3 `TouchableOpacity` items with conditional filled/outline icons
- [ ] Add new i18n keys to both locale files (see Section 10)
- [ ] Verify all `t()` calls resolve correctly
- [ ] Test dark mode via `.dark` class toggle
- [ ] Test RTL with `I18nManager.forceRTL(true)`

---

*End of document — DP-002: Home Screen Design Plan*
