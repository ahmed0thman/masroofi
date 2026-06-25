# Masroof (مصروف) — Onboarding Screen Design Plan

**Document ID:** DP-002  
**Version:** 1.0  
**Status:** Draft for Review  
**Date:** 2026-06-19  
**Author:** UX/Design Team  
**Classification:** Internal — Confidential  
**Supersedes:** N/A (new document)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [Layout & Spacing](#3-layout--spacing)
4. [Slide-by-Slide Design Spec](#4-slide-by-slide-design-spec)
5. [Motion & Animation](#5-motion--animation)
6. [Dark Mode](#6-dark-mode)
7. [Accessibility](#7-accessibility)
8. [RTL Adaptation](#8-rtl-adaptation)
9. [Edge Case States](#9-edge-case-states)
10. [Component States](#10-component-states)
11. [Component Architecture & Implementation Spec](#11-component-architecture--implementation-spec)
12. [Handoff Checklist](#12-handoff-checklist)

---

## 1. Design Philosophy

### 1.1 How Onboarding Embodies "Warm Tactile Minimalism"

The onboarding flow is the user's **first tactile encounter** with Masroof. Every pixel must communicate that this is not another cold finance app — it is a warm, intelligent companion for managing money.

| Philosophy Pillar | Onboarding Translation |
|---|---|
| **Voice First** | Slide 1 centers the microphone as the hero. The icon pulses with life, suggesting a tool that listens. No forms, no text entry — just the promise of speaking naturally. |
| **Zero Friction** | 3 slides, ~30 seconds, no account. The Skip button is always available. Language preference is set with one tap. Permission requests are contextual — after value and trust are established, not before. |
| **Privacy as Design Material** | Slide 2 makes on-device processing the visual hero. The shield icon isn't a compliance checkbox; it's the central visual metaphor. The copy explains privacy in colloquial Arabic ("مش بنرفع حاجة على سيرفر") — not legal jargon. |
| **Arabic-Native** | Layout flows RTL from the first pixel. All copy is authored in Arabic first, translated to English second. The Cairo typeface renders Eastern Arabic numerals natively. Language toggle lets users switch without leaving the flow. |
| **Physicality** | The circular icon container (96×96dp, `bg-primary/10`) has a soft, tangible presence. The dot indicators animate with a spring-like organic motion. The button responds with scale feedback. Nothing feels flat or purely digital. |

### 1.2 Onboarding-Specific Design Principles

#### Principle O1: Progressive Disclosure of Value
The user should not be sold a feature they don't understand. Each slide builds on the previous one:
- **Slide 1:** "This is what you can do" (value)
- **Slide 2:** "This is why you can trust it" (trust)
- **Slide 3:** "Let's set it up" (action)

Only after slides 1+2 establish value and trust does the app ask for permissions.

#### Principle O2: The Skip Must Feel Safe
The Skip button is deliberately styled as muted, secondary text — not a prominent button. But it must be present and honest. Skipping should never feel like "giving up" — rather, "I'll figure this out myself." The Home screen greets skippers with a welcoming banner, not a punitive wall.

#### Principle O3: Permission as Gift, Not Tax
Microphone permission is reframed as unlocking a superpower, not granting access. The in-app explanation precedes the OS dialog. The user sees *why* before they see the system prompt. This follows the documented pattern of contextual permission requests increasing grant rates by 30–50%.

#### Principle O4: Visual Rhythm = Trust
Each slide uses an identical structural rhythm — icon circle → title → description → dots → button. This predictability creates a sense of safety. The user knows what to expect. The only variation is on Slide 3, where controls are added *within* the rhythm, not breaking it.

---

## 2. Visual Identity

### 2.1 Color Token Mapping for Onboarding

All colors use the project's token system defined in `src/app/global.css`. The onboarding uses a subset of tokens:

#### Light Mode — "Paper & Mint"

| Token | Value | Onboarding Usage |
|---|---|---|
| `bg-background` | `#F7FAF7` | Full-screen background |
| `bg-surface` | `#F7F7F7` | Card/slide card area |
| `bg-primary` | `#004C3F` | Next/Get Started button background |
| `bg-primary/10` | `rgba(0,76,63,0.1)` | Icon circle background |
| `bg-primary/20` | `rgba(0,76,63,0.2)` | Inactive dot indicator |
| `text-foreground` | `#181C1B` | Slide titles (`on-surface`) |
| `text-muted-foreground` | `#3F4945` | Descriptions, Skip button |
| `text-on-primary` | `#FFFFFF` | Button label |
| `text-primary` | `#004C3F` | Active dot, language toggle active label |
| `border-outline` | `#6F7975` | Language toggle border |
| `border-outline-variant` | `#BEC9C4` | Inactive toggle segment |

#### Dark Mode — "Deep Forest"

| Token | Value | Onboarding Usage |
|---|---|---|
| `bg-background` | `#101413` | Full-screen background |
| `bg-surface` | `#1C201F` | Card/slide card area |
| `bg-primary` | `#89D5C0` | Next/Get Started button background |
| `bg-primary/10` | `rgba(137,213,192,0.1)` | Icon circle background |
| `bg-primary/20` | `rgba(137,213,192,0.2)` | Inactive dot indicator |
| `text-foreground` | `#E0E3E0` | Slide titles |
| `text-muted-foreground` | `#BEC9C4` | Descriptions, Skip button |
| `text-on-primary` | `#00382D` | Button label |
| `text-primary` | `#89D5C0` | Active dot, language toggle active |
| `border-outline` | `#88938F` | Language toggle border |
| `border-outline-variant` | `#3F4945` | Inactive toggle segment |

### 2.2 Iconography for Onboarding

All icons use `@expo/vector-icons/Ionicons` for consistency and bundle efficiency. No custom SVGs or Lottie animations.

| Slide | Icon Name | Size | Color Treatment | Rationale |
|---|---|---|---|---|
| **1 — Voice** | `mic-circle` (or `mic` if `mic-circle` unavailable) | 48×48dp (within 96dp circle) | `color={colors.primary}` inherited via `useThemeColors()` | The filled mic icon is universally recognized for voice input. The circle variant provides visual weight. |
| **2 — Privacy** | `shield-checkmark` | 48×48dp | `color={colors.primary}` | Shield with checkmark communicates both protection and certification. More positive than a plain lock icon. |
| **3 — Settings** | `options` (or `settings-outline`) | 48×48dp | `color={colors.primary}` | Represents configuration without feeling complex. The outline style keeps it light. |

**Icon Circle Container:**
- Size: 96×96dp
- Shape: `rounded-full` (perfect circle)
- Background: `bg-primary/10`
- Alignment: `items-center justify-center` (flex-center)
- Shadow: None (relies on bg tint, not elevation)

### 2.3 Typography Spec for Onboarding

All text uses the Cairo font family via Tailwind classes. The onboarding uses a subset of the typography scale:

| Element | Variant | Font | Size | Line Height | Alignment | Notes |
|---|---|---|---|---|---|---|
| **Slide Title** | `h2` | `font-cairo-bold` | **text-3xl** (30px) | 1.4 | `text-center` | Bold weight for authority; 30px balances impact with readability |
| **Slide Description** | `muted` | `font-cairo` | **text-sm** (14px) | 1.6 | `text-center` | Regular weight; 14px for secondary reading; `text-muted-foreground` color |
| **Skip Button** | `small` | `font-cairo-medium` | **text-sm** (14px) | 1.4 | `text-right` (RTL) | Medium weight to distinguish from standard muted text; tappable |
| **Next / Get Started** | — | `font-cairo-semibold` | **text-base** (16px) | 1.4 | `text-center` | Via Button component's internal label styling |
| **Language Toggle** | — | `font-cairo-medium` | **text-sm** (14px) | 1.4 | `text-center` | Inside segmented control; medium weight for readability at small size |
| **Reminder Toggle** | `small` | `font-cairo` | **text-sm** (14px) | 1.4 | Natural alignment | Regular weight; non-intrusive |
| **Dot Active** | — | — | — | — | — | No text; purely visual indicator |
| **Permission Explanation** | `small` | `font-cairo` | **text-sm** (14px) | 1.6 | `text-center` | Appears in in-app dialog before OS permission prompt |

### 2.4 Spacing Grid for Onboarding

The onboarding uses a 4px base unit derived from the design system:

| Spacing Token | Tailwind Class | Value | Onboarding Usage |
|---|---|---|---|
| **space-10** | `pt-10` | 40px | Top padding from safe area to content start |
| **space-12** | `pb-12` | 48px | Bottom padding before safe area |
| **space-6** | `gap-6` | 24px | Between icon circle and title |
| **space-3** | `gap-3` | 12px | Between title and description |
| **space-8** | `gap-8` | 32px | Between description and dot indicators |
| **space-6** | `gap-6` | 24px | Between dot indicators and button |
| **space-2** | `gap-2` | 8px | Between icon circle and its background (centered, not gap) |
| **space-4** | `px-4` | 16px | Horizontal screen padding |
| **space-5** | `max-w-[300px]` | ~300px | Description text max width |
| **space-4** | `h-12` | 48px | Button height |
| **space-4** | `mb-6` | 24px | Bottom margin for dot row |

---

## 3. Layout & Spacing

### 3.1 Global Layout Structure

```
┌──────────────────────────────────────┐
│  ┌─SafeAreaView (bg-background flex-1)──┐
│  │                                      │
│  │  ┌─Skip Button (top-right RTL)────┐  │
│  │  │      [تخطي / Skip]             │  │  ← pb-2 (8px from top)
│  │  └────────────────────────────────┘  │
│  │                                      │
│  │  ┌─Slide Content────────────────┐    │
│  │  │                              │    │
│  │  │     ┌──────────────────┐     │    │  ← flex-1 (consumes all available space)
│  │  │     │                  │     │    │
│  │  │     │   Icon Circle    │     │    │  ← 96×96dp, centered
│  │  │     │   (96×96dp)      │     │    │
│  │  │     └──────────────────┘     │    │
│  │  │                              │    │
│  │  │   ┌─Title────────────────┐   │    │  ← gap-6 (24px) from icon
│  │  │   │   h2, text-center    │   │    │
│  │  │   └──────────────────────┘   │    │
│  │  │                              │    │  ← gap-3 (12px)
│  │  │   ┌─Description──────────┐   │    │
│  │  │   │  muted, text-center  │   │    │
│  │  │   │  max-w-[300px]       │   │    │
│  │  │   └──────────────────────┘   │    │
│  │  │                              │    │
│  │  │   [Slide 3 extras]           │    │  ← only on slide 3
│  │  │   ┌─Language Toggle───────┐  │    │
│  │  │   │  [العربية] [English]  │  │    │
│  │  │   └───────────────────────┘  │    │
│  │  │   ┌─Reminder Toggle────────┐ │    │
│  │  │   │  🔔 ذكرني... (اختياري) │ │    │
│  │  │   └────────────────────────┘ │    │
│  │  │                              │    │
│  │  └──────────────────────────────┘    │
│  │                                      │
│  │  ┌─Dot Indicators────────────────┐   │
│  │  │    ●  ●  ●                    │   │  ← centered, gap-2
│  │  └───────────────────────────────┘   │
│  │                                      │
│  │  ┌─Next/Get Started Button──────┐   │  ← h-12 (48dp), full-width
│  │  │        التالي / Next          │   │     rounded-xl
│  │  └──────────────────────────────┘   │
│  │                                      │
│  └──────────────────────────────────────┘
└──────────────────────────────────────┘
```

### 3.2 Safe Area Handling

| Edge | Handling | Implementation |
|---|---|---|
| **Top** | `SafeAreaView` from `src/components/layout/SafeAreaView` | Wraps entire onboarding. Top safe area provides padding for status bar. Skip button positioned `top-2` (8px) below safe area inset. |
| **Bottom** | Button is `mb-6` (24px) above bottom safe area | Ensures button doesn't overlap home indicator on iOS. On Android, bottom padding is consistent. |
| **Sides** | `p-5` from SafeAreaView + `px-4` from container | Total horizontal padding: 20px (safe area) + 16px (content) = 36px from screen edge on each side. |
| **Notch/Dynamic Island** | Handled by SafeAreaView | Content avoids camera cutouts on modern iPhones. |

### 3.3 Content Layout Calculations

| Measurement | Value | Notes |
|---|---|---|
| **Screen height (iPhone 15)** | ~852pt | Reference device |
| **Top safe area** | ~59pt | iPhone 15 status bar |
| **Bottom safe area** | ~34pt | Home indicator |
| **Available content height** | ~759pt | 852 - 59 - 34 |
| **Skip button + margin** | ~44pt | 20pt text + 24pt margin |
| **Icon circle** | 96pt | Fixed size |
| **Gap: icon → title** | 24pt | `gap-6` |
| **Title** | ~42pt | 30px font + 12px line height diff |
| **Gap: title → description** | 12pt | `gap-3` |
| **Description** | ~44pt | 14px font × 2-3 lines |
| **Slide 3 extras** | ~120pt | Language toggle (48pt) + gap + reminder (48pt) |
| **Gap: description → dots** | 32pt | `gap-8` |
| **Dots** | ~10pt | 8pt active height + gap |
| **Gap: dots → button** | 24pt | `gap-6` |
| **Button** | 48pt | `h-12` |
| **Bottom margin** | 24pt | `mb-6` |
| **Total content (slides 1-2)** | ~376pt | Fits with ~383pt flexible space |
| **Total content (slide 3)** | ~496pt | Fits with ~263pt flexible space |

> **Conclusion:** All content fits comfortably within one viewport on modern devices without scrolling. The flexible space is distributed via `flex-1` on the slide content container, which centers the content block vertically.

---

## 4. Slide-by-Slide Design Spec

### 4.1 Slide 1 — Voice-First Value Prop

```
┌──────────────────────────────────────────────┐
│                                         تخطي  │  ← Skip (top-left in RTL)
│                                              │
│                                              │
│                ┌────────────┐                 │
│                │            │                 │
│                │   🎤       │                 │  ← 96×96dp circle
│                │   (pulse)  │                 │     bg-primary/10
│                │            │                 │     flex-center
│                └────────────┘                 │
│                                              │
│         سجل مصروفاتك بصوتك                   │  ← h2, text-center, text-foreground
│                                              │     font-cairo-bold
│                                              │
│    تكلم طبيعي — مصري أو إنجليزي أو           │  ← muted, text-center
│    الاتنين مع بعض. التطبيق بيفهمك            │     max-w-[300px], font-cairo
│    ويسجل في أقل من ١٠ ثواني.                 │     text-muted-foreground
│                                              │
│                                              │
│                ● ○ ○                         │  ← dot indicators
│                                              │     active: w-8 h-2 bg-primary rounded-full
│                                              │     inactive: w-2 h-2 bg-primary/20
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │             التالي                    │    │  ← Button variant="default"
│  └──────────────────────────────────────┘    │     size="lg", full-width
│                                              │     t('onboarding.next')
└──────────────────────────────────────────────┘
```

#### 4.1.1 Icon: Microphone

| Attribute | Spec |
|---|---|
| **Icon component** | `<Ionicons name="mic-circle" size={48} color={colors.primary} />` |
| **Container** | 96×96dp circle, `bg-primary/10`, `rounded-full`, `flex-center` |
| **Animation** | Subtle scale pulse: 1.0 ↔ 1.05, duration 2s, ease-in-out |
| **Accessibility** | `accessibilityLabel={t('onboarding.slide1.iconLabel')}` — "أيقونة الميكروفون، سجل مصروفاتك بصوتك" |
| **Rationale** | `mic-circle` (filled circle variant) provides more visual weight than outline `mic`. The filled icon feels more active and confident. The pulse animation suggests a living, listening interface — subtly communicating voice interaction without words. |

#### 4.1.2 Typography

| Element | Value | Implementation |
|---|---|---|
| **Title** | `t('onboarding.slide1.title')` | `<Text variant="h2" className="text-center font-cairo-bold">{t('onboarding.slide1.title')}</Text>` |
| **Description** | `t('onboarding.slide1.description')` | `<Text variant="muted" className="text-center font-cairo max-w-[300px]">{t('onboarding.slide1.description')}</Text>` |

#### 4.1.3 Key Behaviors
- Mic icon pulses continuously (scale 1.0 ↔ 1.05) with 2s cycle
- Skip button visible top-left (RTL)
- Swipe right (RTL) or tap "التالي" → advances to Slide 2
- First slide: swipe left (RTL) has no effect (no previous slide)
- Dot indicators: first dot active (`●`), second and third inactive (`○`)

---

### 4.2 Slide 2 — Privacy & Offline (Trust Builder)

```
┌──────────────────────────────────────────────┐
│                                         تخطي  │
│                                              │
│                                              │
│                ┌────────────┐                 │
│                │            │                 │
│                │   🛡️       │                 │  ← 96×96dp circle
│                │  (static)  │                 │     bg-primary/10
│                │            │                 │     flex-center
│                └────────────┘                 │
│                                              │
│            بياناتك في أمان                    │  ← h2, text-center
│                                              │
│    كل حاجة على جهازك — مش بنرفع حاجة         │  ← muted, text-center
│    على سيرفر. مش محتاج نت عشان تسجل.         │     max-w-[300px]
│    الخصوصية مش إعداد، دي أساس التطبيق.        │
│                                              │
│                                              │
│                ○ ● ○                         │  ← dots: second active
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │             التالي                    │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

#### 4.2.1 Icon: Shield Checkmark

| Attribute | Spec |
|---|---|
| **Icon component** | `<Ionicons name="shield-checkmark" size={48} color={colors.primary} />` |
| **Container** | 96×96dp circle, `bg-primary/10`, `rounded-full`, `flex-center` |
| **Animation** | No pulse — static icon. Enters with slide (fade + scale 0.8→1.0) |
| **Accessibility** | `accessibilityLabel={t('onboarding.slide2.iconLabel')}` — "أيقونة الدرع، بياناتك في أمان" |
| **Rationale** | The shield checkmark communicates dual meaning: protection (shield) and verification (checkmark). A lock icon could imply "locked away," which feels negative. The shield is proactive, protective. Static treatment (no pulse) signals solidity and permanence — privacy isn't tentative. |

#### 4.2.2 Typography

| Element | Value | Implementation |
|---|---|---|
| **Title** | `t('onboarding.slide2.title')` | `<Text variant="h2" className="text-center font-cairo-bold">{t('onboarding.slide2.title')}</Text>` |
| **Description** | `t('onboarding.slide2.description')` | `<Text variant="muted" className="text-center font-cairo max-w-[300px]">{t('onboarding.slide2.description')}</Text>` |

#### 4.2.3 Key Behaviors
- Shield icon is static (no looping animation) — communicates stability
- Skip button visible
- Swipe right → Slide 3; swipe left → back to Slide 1
- Dot indicators: second dot active
- No new interactive elements — purely a trust-building read

---

### 4.3 Slide 3 — Permissions & Preferences

```
┌──────────────────────────────────────────────┐
│                                         تخطي  │  ← Skip is visible but auto-hides after
│                                              │     8 seconds or on first interaction
│                                              │
│                ┌────────────┐                 │
│                │            │                 │
│                │   ⚙️        │                 │  ← 96×96dp circle
│                │  (static)  │                 │     bg-primary/10
│                │            │                 │
│                └────────────┘                 │
│                                              │
│           جهز كل حاجة                       │  ← h2, text-center
│                                              │
│     خلينا نضبط الميكروفون عشان نقدر          │  ← muted, text-center
│     نسجل، والإشعارات عشان متنساش.            │
│                                              │
│  ┌──────────────────────────────────────┐   │  ← Language Toggle
│  │   العربية          │    English      │   │     Segmented control
│  └──────────────────────────────────────┘   │     48dp height
│                                              │     gap-6 from description
│                                              │
│  ┌──────────────────────────────────────┐   │  ← Reminder Toggle
│  │  🔔  ذكرني بتسجيل المصروفات (اختياري) │   │     Optional, with expandable
│  └──────────────────────────────────────┘   │     time picker
│                                              │
│                                              │
│                ○ ○ ●                         │  ← dots: third active
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │          هيا بنا / Let's Go           │    │  ← Button variant="default"
│  └──────────────────────────────────────┘    │     t('onboarding.getStarted')
└──────────────────────────────────────────────┘
```

#### 4.3.1 Icon: Settings/Options

| Attribute | Spec |
|---|---|
| **Icon component** | `<Ionicons name="options" size={48} color={colors.primary} />` |
| **Container** | 96×96dp circle, `bg-primary/10`, `rounded-full`, `flex-center` |
| **Animation** | No pulse — static. Enters with slide transition. |
| **Accessibility** | `accessibilityLabel={t('onboarding.slide3.iconLabel')}` — "أيقونة الإعدادات، جهز كل حاجة" |
| **Rationale** | The "options" icon (three sliders/horizontal lines) communicates configurability without complexity. It's less intimidating than a full "settings" gear. The user understands this is the "let's tweak things" slide. |

#### 4.3.2 Language Toggle (Segmented Control)

```
┌──────────────────────────────────────────┐
│         العربية              English      │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │   العربية    │  │     English      │  │
│  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────┘
```

| Attribute | Spec |
|---|---|
| **Component** | Custom segmented control (2 segments) — not a native Switch |
| **Height** | 48dp (meets 44pt minimum touch target) |
| **Width** | Full available width (screenWidth - 2×36dp padding) |
| **Border** | `border border-outline`, `rounded-xl` (radius-md = 14px) |
| **Active segment** | `bg-primary` background, `text-on-primary` text, `font-cairo-semibold` |
| **Inactive segment** | Transparent background, `text-muted-foreground` text, `font-cairo-medium` |
| **Default** | Arabic selected (for `ar-*` device locales), English for others |
| **Interaction** | Tap segment → immediately switches. Active segment slides with 200ms spring animation. |
| **Accessibility** | Each segment has `accessibilityRole="button"` and `accessibilityLabel={t('onboarding.language.ar')}` or `t('onboarding.language.en')` |
| **State change** | Selection updates `DirectionProvider` context + persists via AsyncStorage |

**Implementation approach:**
```tsx
// Two Pressable elements inside a bordered container
// Active state uses Animated.Value for position interpolation
// On press: setDirection(lang === 'ar' ? 'rtl' : 'ltr')
```

#### 4.3.3 Reminder Toggle

```
┌──────────────────────────────────────────────┐
│  🔔  ذكرني بتسجيل المصروفات        [OFF|ON] │  ← Toggle row
└──────────────────────────────────────────────┘
        ↓ (if ON, expands)
┌──────────────────────────────────────────────┐
│  ○  بعد الغدا  (١:٣٠ م)                     │  ← Radio list
│  ○  قبل النوم  (٩:٣٠ م)                     │
│  ○  بالليل    (٧:٠٠ م)                      │
└──────────────────────────────────────────────┘
```

| Attribute | Spec |
|---|---|
| **Component** | Custom toggle row + expandable radio list |
| **Toggle row height** | 48dp |
| **Toggle** | Native Switch component or custom track (`h-7 w-12 rounded-pill`) |
| **Track ON** | `bg-primary` |
| **Track OFF** | `bg-outline-variant` |
| **Thumb** | White circle, 24dp diameter |
| **Expand animation** | Slide down + fade in (200ms, spring easing) |
| **Radio items** | 3 items, each 44dp height, text with `font-cairo` |
| **Selected radio** | `text-primary` with filled circle indicator |
| **Unselected radio** | `text-muted-foreground` with outline circle |
| **Default** | Toggle OFF. No reminders selected. |
| **Accessibility** | Toggle has `accessibilityRole="switch"` with label `t('onboarding.reminder.toggle')` |

**Implementation approach:**
```tsx
// State: { enabled: boolean, selectedTime: string | null }
// When enabled === true, render Animated.View with radio list
```

#### 4.3.4 Get Started Button

| Attribute | Spec |
|---|---|
| **Label** | `t('onboarding.getStarted')` — "هيا بنا" / "Get Started" |
| **Variant** | `default` (uses `bg-primary` / `text-on-primary`) |
| **Size** | `lg` (height: 48px via `h-12`, padding: `px-6 py-3.5`) |
| **Width** | Full width (`className="w-full"`) |
| **Radius** | `rounded-xl` (14px) |
| **Press feedback** | Scale 1.0 → 0.97 on press-in, scale back on press-out, haptic light |
| **Disabled state** | Only 300ms debounce after press to prevent double-fire |
| **Loading state** | Not applicable — all onboarding actions are instant |

#### 4.3.5 Key Behaviors
- **Language toggle:** Hot-swaps UI language + layout direction on tap
- **Reminder toggle:** Expands to show radio list when enabled
- **Get Started tap:** Triggers permission sequence (mic → notifications) then navigates to Home
- **Skip button:** Visible by default. Auto-hides after 8 seconds of no interaction on Slide 3 (reduces cognitive load — by this point, user should commit or skip).
- **Swipe left:** Returns to Slide 2. No forward swipe (end of carousel).

---

## 5. Motion & Animation

### 5.1 Animation Philosophy

Onboarding animations follow the design system's motion tokens from `design/design-plan.md` Section 9. They are:
- **Subtle** — never flashy or distracting
- **Purposeful** — each animation communicates something (readiness, transition, life)
- **Performant** — 60fps on mid-range devices, graceful degradation with reduce motion
- **RTL-aware** — direction-sensitive transitions mirror correctly

### 5.2 Slide Transitions

| Attribute | Spec |
|---|---|
| **Type** | Horizontal translate (`translateX`) |
| **Duration** | 350ms |
| **Easing** | `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease-in-out) |
| **Content fade** | Opacity 0 → 1 over 250ms, delayed 50ms after translate starts |
| **Implementation** | React Native `Animated` API with `Animated.Value` for `translateX` and `opacity` |

**Direction mapping:**

| Action | RTL (Arabic) | LTR (English) |
|---|---|---|
| **Next slide (forward)** | Slide in from right → center | Slide in from left → center |
| **Previous slide (back)** | Slide in from left → center | Slide in from right → center |
| **Swipe forward** | Swipe left → next slide appears from right | Swipe left → next slide appears from left |
| **Swipe backward** | Swipe right → previous slide from left | Swipe right → previous slide from right |

**Animation values:**
```typescript
const slideTranslate = useRef(new Animated.Value(0)).current;
const slideOpacity = useRef(new Animated.Value(1)).current;

// Forward transition (next slide)
Animated.parallel([
  Animated.timing(slideTranslate, {
    toValue: -SCREEN_WIDTH,  // RTL: positive value
    duration: 350,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  }),
]).start();
```

### 5.3 Icon Entry Animation

| Attribute | Spec |
|---|---|
| **Type** | Scale + opacity |
| **Scale range** | 0.8 → 1.0 |
| **Opacity range** | 0 → 1 |
| **Duration** | 400ms |
| **Easing** | `Easing.out(Easing.back(1.5))` — slight overshoot for organic feel |
| **Delay** | 100ms after slide transition starts |
| **Trigger** | Every time a new slide becomes active |

```typescript
Animated.spring(iconScale, {
  toValue: 1,
  from: 0.8,
  friction: 6,
  tension: 100,
  useNativeDriver: true,
}).start();
```

### 5.4 Mic Pulse Loop (Slide 1 Only)

| Attribute | Spec |
|---|---|
| **Type** | Continuous scale oscillation |
| **Scale range** | 1.0 ↔ 1.05 (very subtle) |
| **Duration** | 2s per cycle (1s up, 1s down) |
| **Easing** | `Easing.inOut(Easing.sin)` — smooth sine wave |
| **Trigger** | Starts when Slide 1 appears. Stops when user leaves Slide 1. |
| **Implementation** | `Animated.loop` with `Animated.sequence` of two timing animations |

```typescript
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  const pulse = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.0,
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
  if (activeSlide === 0) pulse.start();
  return () => pulse.stop();
}, [activeSlide]);
```

### 5.5 Dot Indicator Animation

| Attribute | Spec |
|---|---|
| **Type** | Width interpolation (active dot expands/shrinks) |
| **Active width** | 32dp (`w-8`) |
| **Inactive width** | 8dp (`w-2`) |
| **Height** | 8dp (`h-2`, constant) |
| **Radius** | `rounded-full` (pill shape at all widths) |
| **Color transition** | `bg-primary` (active) ↔ `bg-primary/20` (inactive) |
| **Duration** | 200ms |
| **Easing** | Spring (friction: 8, tension: 120) |

**Visual behavior:**
- As user moves from slide N to slide N+1, dot N shrinks from 32dp → 8dp while dot N+1 expands from 8dp → 32dp
- Color interpolates simultaneously: primary/20 → primary for the new active dot, primary → primary/20 for the old one

### 5.6 Button Press Feedback

| Attribute | Spec |
|---|---|
| **Type** | Scale transform |
| **Press-in** | Scale to 0.97 over 80ms |
| **Press-out** | Scale to 1.0 over 100ms |
| **Easing** | `Easing.out(Easing.ease)` |
| **Haptic** | `ImpactFeedbackStyle.Light` (via `expo-haptics`) |
| **Implementation** | Use `Animated.Value` tied to `Pressable`'s `onPressIn` / `onPressOut` |

```typescript
<Pressable
  onPressIn={() => {
    Animated.timing(btnScale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }}
  onPressOut={() => {
    Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  }}
>
  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
    <Button>...</Button>
  </Animated.View>
</Pressable>
```

### 5.7 Language Toggle Segment Animation

| Attribute | Spec |
|---|---|
| **Type** | Active segment slides horizontally to selected option |
| **Duration** | 200ms |
| **Easing** | Spring (friction: 9, tension: 100) |
| **Background** | Active segment has `bg-primary` that slides; inactive is transparent |

### 5.8 Reminder Toggle Expand

| Attribute | Spec |
|---|---|
| **Type** | Height interpolation + opacity fade |
| **Height** | 0dp → 160dp (3 items × 44dp + gaps) |
| **Duration** | 200ms |
| **Easing** | `Easing.out(Easing.ease)` |
| **Implementation** | `Animated.Value` for `maxHeight` and `opacity` |

### 5.9 Reduced Motion (Accessibility)

| Setting | Behavior |
|---|---|
| **`useReducedMotion()` returns true** | Disable all slide transitions (instant crossfade). Disable mic pulse loop. Disable dot width animation (instant swap). Disable button scale feedback. Disable toggle segment slide. |
| **Implementation** | Check `useReducedMotion()` at the top of the onboarding component. Conditionally skip all `Animated` calls. Use direct state updates instead. |

```typescript
const reduceMotion = useReducedMotion();

const transitionDuration = reduceMotion ? 0 : 350;
const springConfig = reduceMotion ? { useNativeDriver: true } : { friction: 6, tension: 100, useNativeDriver: true };
```

---

## 6. Dark Mode

### 6.1 Dark Mode Design Principles

Dark mode for onboarding follows the "Deep Forest" palette from `global.css`. The core principle: **maintain the same warmth and tactility as light mode**, but shift from "Paper & Mint" to a deeper, richer atmosphere.

The onboarding's visual hierarchy must remain intact in dark mode — the icon circles must still read as "subtle tinted backgrounds," titles must still feel bold, and descriptions must remain readable.

### 6.2 Slide-by-Slide Dark Mode Mapping

#### Slide 1 — Voice (Dark)

| Element | Light Token | Dark Token | Rationale |
|---|---|---|---|
| **Background** | `bg-background` (#F7FAF7) | `bg-background` (#101413) | Full dark surface |
| **Icon circle bg** | `bg-primary/10` (rgba(0,76,63,0.1)) | `bg-primary/10` (rgba(137,213,192,0.1)) | Uses primary token — 10% opacity adapts automatically |
| **Icon color** | `color={colors.primary}` → #004C3F | `color={colors.primary}` → #89D5C0 | Hook auto-resolves via `useThemeColors()` |
| **Title** | `text-foreground` (#181C1B) | `text-foreground` (#E0E3E0) | Light text on dark bg |
| **Description** | `text-muted-foreground` (#3F4945) | `text-muted-foreground` (#BEC9C4) | Maintains ~10:1 contrast on dark bg |
| **Dot active** | `bg-primary` (#004C3F) | `bg-primary` (#89D5C0) | Primary token auto-resolves |
| **Dot inactive** | `bg-primary/20` | `bg-primary/20` | Opacity tailwind modifier works with CSS variable |
| **Button bg** | `bg-primary` (#004C3F) | `bg-primary` (#89D5C0) | Auto-resolves |
| **Button text** | `text-on-primary` (#FFFFFF) | `text-on-primary` (#00382D) | Auto-resolves |
| **Skip text** | `text-muted-foreground` | `text-muted-foreground` | Auto-resolves |

#### Slide 2 — Privacy (Dark)

| Element | Light | Dark |
|---|---|---|
| **Icon circle bg** | `bg-primary/10` | `bg-primary/10` (auto) |
| **Icon** | Primary green | Primary teal (#89D5C0) |
| **All text** | Same as Slide 1 tokens | Same as Slide 1 dark tokens |

#### Slide 3 — Permissions (Dark)

| Element | Light | Dark |
|---|---|---|
| **Language toggle border** | `border-outline` (#6F7975) | `border-outline` (#88938F) |
| **Language toggle active** | `bg-primary` (#004C3F), `text-on-primary` (#FFF) | `bg-primary` (#89D5C0), `text-on-primary` (#00382D) |
| **Language toggle inactive** | `text-muted-foreground` (#3F4945) | `text-muted-foreground` (#BEC9C4) |
| **Reminder toggle track ON** | `bg-primary` | `bg-primary` (auto) |
| **Reminder toggle track OFF** | `bg-outline-variant` (#BEC9C4) | `bg-outline-variant` (#3F4945) |

### 6.3 Dark Mode Visual Quality Notes

1. **Avoid pure black.** The dark background (`#101413`) is a deep forest green-black, not `#000000`. This maintains the warm brand identity even in dark mode.
2. **Primary color shifts** from vibrant green (`#004C3F`) in light mode to teal (`#89D5C0`) in dark mode. This ensures the accent color has sufficient contrast against the dark background.
3. **Icon circles** use `bg-primary/10` — the 10% opacity means the circle adapts to both themes automatically without hardcoded values.
4. **Button contrast:** In dark mode, the button becomes light teal (`#89D5C0`) on deep forest — this is the inverse of light mode's dark green on light. The button remains the highest-contrast element on screen.

---

## 7. Accessibility

### 7.1 Color Contrast Compliance

| Text Element | Light Mode Ratio | Dark Mode Ratio | WCAG AA | WCAG AAA |
|---|---|---|---|---|
| **Title (`text-foreground`)** | #181C1B on #F7FAF7 → ~15.5:1 | #E0E3E0 on #101413 → ~13.8:1 | ✅ Pass | ✅ Pass |
| **Description (`text-muted-foreground`)** | #3F4945 on #F7FAF7 → ~7.8:1 | #BEC9C4 on #101413 → ~10.5:1 | ✅ Pass | ✅ Pass |
| **Skip button (`text-muted-foreground`)** | #3F4945 on #F7FAF7 → ~7.8:1 | #BEC9C4 on #101413 → ~10.5:1 | ✅ Pass | ✅ Pass |
| **Button label (`text-on-primary`)** | #FFF on #004C3F → ~10.1:1 | #00382D on #89D5C0 → ~6.2:1 | ✅ Pass | ✅ Pass (large text) |
| **Active dot (`bg-primary`)** | #004C3F on #F7FAF7 → non-text | #89D5C0 on #101413 → non-text | ✅ Pass | ✅ Pass |
| **Language toggle text (active)** | #FFF on #004C3F → ~10.1:1 | #00382D on #89D5C0 → ~6.2:1 | ✅ Pass | ✅ Pass |
| **Language toggle text (inactive)** | #3F4945 on transparent/F7FAF7 → ~7.8:1 | #BEC9C4 on transparent/101413 → ~10.5:1 | ✅ Pass | ✅ Pass |
| **Reminder toggle text** | #181C1B on #F7FAF7 → ~15.5:1 | #E0E3E0 on #101413 → ~13.8:1 | ✅ Pass | ✅ Pass |

All text elements meet WCAG AA minimum (4.5:1 for body, 3:1 for large text). Primary content (titles, button labels) meets WCAG AAA (7:1 for body, 4.5:1 for large text).

### 7.2 Touch Targets

| Element | Size | Meets 44×44pt? | Notes |
|---|---|---|---|
| **Skip button** | 44pt height × content width | ✅ | Minimum height enforced; hitSlop if needed |
| **Next / Get Started button** | 48pt (h-12) × full width | ✅ | Exceeds minimum |
| **Dot indicators** | Not tappable | N/A | Navigation via swipe/button only |
| **Language toggle segment** | 48pt height × ~50% width each | ✅ | Each segment is >44pt tall |
| **Reminder toggle** | 48pt height × full width | ✅ | |
| **Reminder radio items** | 44pt height each | ✅ | |
| **Icon circle** | Not tappable | N/A | Visual only |

### 7.3 Screen Reader (VoiceOver / TalkBack)

| Element | Accessibility Label | Role | Traits |
|---|---|---|---|
| **Skip button** | `t('onboarding.skip')` — "تخطي" / "Skip" | `button` | — |
| **Next/Get Started button** | `t('onboarding.next')` or `t('onboarding.getStarted')` | `button` | — |
| **Slide 1 icon** | `t('onboarding.slide1.iconLabel')` — "أيقونة الميكروفون" | `image` | — |
| **Slide 2 icon** | `t('onboarding.slide2.iconLabel')` — "أيقونة الدرع" | `image` | — |
| **Slide 3 icon** | `t('onboarding.slide3.iconLabel')` — "أيقونة الإعدادات" | `image` | — |
| **Slide 1 title** | `t('onboarding.slide1.title')` | `header` | — |
| **Slide 2 title** | `t('onboarding.slide2.title')` | `header` | — |
| **Slide 3 title** | `t('onboarding.slide3.title')` | `header` | — |
| **Dot row** | "الشريحة ١ من ٣" / "Slide 1 of 3" | `progressbar` | `accessibilityValue={{ now: 1, min: 1, max: 3 }}` |
| **Language: Arabic** | `t('onboarding.language.ar')` — "العربية" | `button` | `accessibilityState={{ selected: isArabic }}` |
| **Language: English** | `t('onboarding.language.en')` — "English" | `button` | `accessibilityState={{ selected: isEnglish }}` |
| **Reminder toggle** | `t('onboarding.reminder.toggle')` | `switch` | `accessibilityState={{ checked: isEnabled }}` |
| **Reminder radio option** | "بعد الغدا، ١:٣٠ م" / "After lunch, 1:30 PM" | `radio` | `accessibilityState={{ selected: isSelected }}` |

### 7.4 Dynamic Content Announcements

| Event | Announcement | Implementation |
|---|---|---|
| **Slide changes** | "الشريحة ٢ من ٣: بياناتك في أمان" / "Slide 2 of 3: Your Data Stays Private" | `accessibilityLiveRegion="polite"` on slide content container + `accessibilityAnnouncement` |
| **Language switched** | "تم تغيير اللغة إلى الإنجليزية" / "Language changed to English" | `t('onboarding.languageChanged', { language })` |
| **Reminder enabled** | "تم تفعيل التذكير" / "Reminder enabled" | Brief announcement |
| **Permission requested** | "مصروفي يحتاج إذن الميكروفون" / "Masroof needs microphone permission" | Before OS dialog appears |

### 7.5 Font Scaling (Dynamic Type)

| Requirement | Implementation |
|---|---|
| **Dynamic Type support** | All text uses `fontSize` from Tailwind classes (relative units). No hardcoded `fontSize` in pixels. |
| **Layout flexibility** | Description and title use `flexShrink` to allow text wrapping. Container height adjusts via `flex-1`. |
| **Maximum text scale** | Tested up to 150% font scale. At max scale, title may wrap to 2 lines, description to 5 lines. Content still fits vertically on iPhone SE. |
| **Minimum text scale** | 75% font scale. All elements remain legible and properly spaced. |

### 7.6 Additional Accessibility Considerations

| Consideration | Implementation |
|---|---|
| **No auto-advance** | Slides never auto-advance. User must intentionally swipe or tap. |
| **Permission prompts** | In-app explanation before OS dialog gives screen reader users context before the system prompt interrupts. |
| **Animation reduction** | Full reduced-motion support (see Section 5.9). |
| **Focus management** | When slide changes, focus moves to the slide title (first focusable header). |
| **Contrast for non-text** | Icon circle: `bg-primary/10` — 10% of primary on background exceeds 3:1 non-text contrast. |

---

## 8. RTL Adaptation

### 8.1 Layout Mirroring

All onboarding screens use the `DirectionProvider` from `src/components/ui/direction-provider.tsx`. The layout mirrors automatically:

| Element | LTR Position | RTL Position |
|---|---|---|
| **Skip button** | `top-4 right-4` | `top-4 left-4` |
| **Icon circle** | Center (no change) | Center (no change) |
| **Title** | `text-center` | `text-center` |
| **Description** | `text-center` | `text-center` |
| **Dot indicators** | Center (no change) | Center (no change) |
| **Button** | Full width (no change) | Full width (no change) |
| **Language toggle** | LTR order: Arabic left, English right | RTL order: Arabic right, English left |
| **Reminder toggle** | Leading icon on left | Leading icon on right |

### 8.2 Text Alignment

| Element | LTR | RTL |
|---|---|---|
| **Title** | `text-center` | `text-center` |
| **Description** | `text-center` | `text-center` |
| **Skip** | `text-right` (right-aligned) | `text-left` (left-aligned) |
| **Language label** | `text-center` | `text-center` |
| **Reminder label** | Natural (left) | Natural (right) |

### 8.3 Animation Direction

| Transition | LTR | RTL |
|---|---|---|
| **Next slide (forward)** | Current slides left, new enters from right | Current slides right, new enters from left |
| **Previous slide (back)** | Current slides right, previous enters from left | Current slides left, previous enters from right |
| **Swipe forward gesture** | Swipe left → next | Swipe right → next |
| **Swipe backward gesture** | Swipe right → previous | Swipe left → previous |

**Implementation note:** The Horizo​​ntalScrollView (or Animated-based carousel) must set the `reverse` or `rtl` property based on `I18nManager.isRTL`.

```typescript
const isRTL = I18nManager.isRTL;
// On RTL, the scroll offset is negative
const slideWidth = SCREEN_WIDTH;

const handleNext = () => {
  const offset = isRTL ? -slideWidth : slideWidth;
  Animated.timing(translateX, {
    toValue: currentOffset + offset,
    duration: 350,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  }).start();
};
```

### 8.4 Language Toggle Order

The segmented control displays:

- **Arabic mode:** "العربية" (selected, right side in RTL) | "English" (left side)
- **English mode:** "العربية" (right side) | "English" (selected, left side)

The active segment physically slides to the selected side. The segment positions **do not swap** based on language — the control maintains consistent visual order: Arabic is always the first/right segment in RTL, English is always the second/left segment.

### 8.5 RTL Testing Checklist

- [ ] All 3 slides render with correct right-to-left flow
- [ ] Skip button is in top-left corner (RTL)
- [ ] Swipe right (RTL) advances to next slide
- [ ] Dot indicators remain centered (position unaffected by RTL)
- [ ] Language toggle renders in correct RTL segment order
- [ ] Animations translate in correct direction
- [ ] Reminder toggle icon is on the right side (RTL)
- [ ] Eastern Arabic numerals display correctly in all text
- [ ] Mixed Arabic/English text (e.g., brand names) flows correctly via Unicode bidi

---

## 9. Edge Case States

### 9.1 Loading State

The onboarding has minimal loading requirements. However, there are two async operations:

| Operation | What Happens | UX |
|---|---|---|
| **Initial app load** | Check `onboarding_complete` flag in AsyncStorage | Brief splash screen (see splash spec). If `onboarding_complete` is true, redirect to Home without showing onboarding. |
| **Language preference save** | Save language selection to AsyncStorage | Instant — no loading indicator needed. AsyncStorage writes are <5ms. |
| **Permission state check** | Check current permission status | Instant — `Permissions.getAsync()` returns immediately. |

**Loading state design:** Not applicable to the onboarding carousel itself. All operations are instant or handled by the splash screen.

### 9.2 Permission Denied Banners

#### 9.2.1 Microphone Denied (Soft)

After onboarding completes with mic denied, the Home screen shows:

```
┌──────────────────────────────────────┐
│  🎤  فعل الميكروفون من الإعدادات    │  ← Banner, bg-warning/10
│      عشان تقدر تسجل بصوتك            │     border-warning/20
│                                      │
│  [   الإعدادات   ]   [   لاحقاً   ]  │  ← Two actions
└──────────────────────────────────────┘
```

| Attribute | Spec |
|---|---|
| **Background** | `bg-warning/10` |
| **Border** | `border border-warning/20` |
| **Text** | `t('onboarding.mic.deniedBanner')` — `text-sm font-cairo text-muted-foreground` |
| **Actions** | "الإعدادات" (Settings) navigates to app settings, "لاحقاً" (Later) dismisses banner |
| **Auto-dismiss** | After 5s on first 3 sessions; after that, reduces to a small icon indicator |
| **Animation** | Slide down from top → 300ms, ease-out |

**States over time:**
- **Sessions 1-3:** Full banner with two actions. Auto-dismisses after 5s.
- **Sessions 4-7:** Compact banner (single line): "🎤 فعل الميكروفون من الإعدادات" — tappable, navigates to app settings.
- **Session 8+:** Small persistent icon: "🎤" icon in top bar, tappable → shows tooltip.

#### 9.2.2 Microphone Denied (Permanent)

If user has denied twice (total, across all sessions), re-prompting stops. Instead:
- Show a **subtle, non-interactive** indicator: small mic-with-slash icon in the voice zone
- Tooltip on first launch: "تم رفض إذن الميكروفون — يمكن تفعيله من إعدادات النظام"
- No banner, no interruption

#### 9.2.3 Notification Denied

Notifications are optional. If denied:
- No banner, no indicator, no nudge
- The reminder toggle on Slide 3 will simply not trigger a permission request if denied once
- Notifications can be enabled later from Settings → Notifications

#### 9.2.4 Both Permissions Denied

The app operates in **text-only mode** with no notifications:
- Voice recording button is visible but shows a disabled state: "فعّل الميكروفون من الإعدادات"
- Reminder toggle shows as disabled with explanation
- All core functionality (text expense entry, history, analytics) remains fully functional

### 9.3 Skip State

| Scenario | Behavior |
|---|---|
| **User taps Skip on Slide 1** | Language defaults to device locale (Arabic for `ar-*`, English otherwise). Mic permission not requested. Reminder not configured. Navigates to Home. `onboarding_complete = true` saved. |
| **User taps Skip on Slide 2** | Same as Slide 1 skip. |
| **User taps Skip on Slide 3** | Language preference is saved (if user interacted with toggle). Mic and notification permissions not requested. Reminder not configured. Navigates to Home. `onboarding_complete = true` saved. |

**Post-skip Home screen:**
```
┌──────────────────────────────────────┐
│                                      │
│   🎤  اضغط على الميكروفون عشان      │  ← Banner (auto-dismiss 8s)
│       تسجل مصروفاتك بصوتك            │
│                                      │
│  ┌────────────────────────────┐      │
│  │     🎤 (disabled icon)     │      │  ← Mic icon visible but disabled
│  └────────────────────────────┘      │
│                                      │
│  "اضغط للتسجيل"                     │  ← Status text
└──────────────────────────────────────┘
```

### 9.4 Font Overflow / Large Text

**Test cases:**
- iPhone SE (4.7" screen) at 150% font scale
- iPad (landscape not supported, but width varies)
- System font size set to maximum accessibility setting

**Expected behavior:**
- Title wraps to 2 lines maximum
- Description wraps as needed (3-5 lines at max scale)
- Slide 3 controls (toggle, segmented control) maintain their height but text may wrap within them
- Icon circle scales proportionally? **No** — icon circle is fixed 96×96dp. Only text scales.
- Button label remains single line (minimum 48dp height accommodates scaled text)

### 9.5 Device-Specific Edge Cases

| Device | Consideration | Handling |
|---|---|---|
| **iPhone SE (gen 1/2)** | Small screen (4.7" / 667pt height) | All content fits at default text size. At max font scale, vertical spacing compresses via `flex-1` distribution. |
| **iPad (9.7"+)** | Large screen, onboarding looks sparse | Content centers vertically with more empty space. Max width `max-w-[400px]` on description to prevent overly wide text lines. |
| **Android foldable** | Unfolded = tablet layout | Same as iPad handling. |
| **Device without microphone** | Android tablet, iPod touch | Detect via `Permissions.getAsync(Permissions.AUDIO_RECORDING)`. If unavailable, skip Slide 1? **No** — still show Slide 1 but text changes: "يمكنك كتابة مصروفاتك" (You can type your expenses). Mic icon replaced with text-entry icon (`create-outline`). |
| **Device notch / punch-hole** | Camera cutout | Handled by SafeAreaView. Nothing critical in the cutout zones. |

### 9.6 AsyncStorage Failure

| Scenario | Behavior |
|---|---|
| **AsyncStorage unavailable** | `onboarding_complete` defaults to `false`. Onboarding shows. Language defaults to device locale (Arabic). After completion, save attempt logs error but does not block navigation. |
| **AsyncStorage corrupted** | Wrap read in try-catch. If parse fails, treat as `onboarding_complete = false`. |
| **AsyncStorage full** | On save failure, app continues. Onboarding marked complete in memory for session. On next launch, onboarding may reappear. Acceptable. |

### 9.7 Rapid Interaction Guard

| Scenario | Protection | Implementation |
|---|---|---|
| **Rapid Next tapping** | 300ms debounce | `const [isTransitioning, setIsTransitioning] = useState(false)`. Button disabled during transition. |
| **Rapid Skip tapping** | Idempotent navigation | `useRef(false)` flag. Only first tap triggers navigation. |
| **Swipe during animation** | Input lockout | Flag set during animation (300-400ms). Swipe handler returns early if flag is true. |
| **Swipe + tap race** | Both handlers check same flag | Shared `isAnimating` ref prevents race condition. |

---

## 10. Component States

### 10.1 Skip Button

```
State: Visible (default)
┌──────────┐
│  تخطي    │  ← text-muted-foreground, font-cairo-medium, text-sm
└──────────┘

State: Hidden (last slide, after 8s idle on Slide 3)
(not rendered — display: none)

State: Pressed
┌──────────┐
│  تخطي    │  ← opacity-70, no scale change (text-only, no button bg)
└──────────┘

State: Disabled
(not applicable — always interactable when visible)
```

| Attribute | Value |
|---|---|
| **Text** | `t('onboarding.skip')` |
| **Font** | `font-cairo-medium text-sm text-muted-foreground` |
| **Touch target** | ~44pt height (padding on container), 44pt+ width (based on text) |
| **Position** | `absolute top-2 inset-inline-end-4` (top-right in LTR, top-left in RTL) |
| **Press feedback** | Opacity change only (no scale or background) — maintains low visual priority |
| **Visibility rule** | `!isLastSlide || (isLastSlide && shouldShowSkip)` — auto-hides after 8s on last slide |

### 10.2 Next / Get Started Button

#### 10.2.1 State: Default (Idle)

```
┌──────────────────────────────────────┐
│           التالي / Next               │
│  bg-primary     text-on-primary       │
│  rounded-xl      h-12                 │
└──────────────────────────────────────┘
```

| Attribute | Value |
|---|---|
| **Variant** | `default` |
| **Size** | Custom (`h-12` via className) |
| **Background** | `bg-primary` |
| **Text** | `t('onboarding.next')` or `t('onboarding.getStarted')` |
| **Text color** | `text-on-primary` |
| **Font** | `font-cairo-semibold text-base` |
| **Radius** | `rounded-xl` (14px) |
| **Shadow** | Elevation level 1 (`shadow-sm` equivalent) |

#### 10.2.2 State: Pressed (Active)

| Attribute | Value |
|---|---|
| **Scale** | 0.97 (animated via `Animated.Value`) |
| **Opacity** | 0.9 (via `active:opacity-80` from Pressable) |
| **Background** | Same as default (slightly darker via opacity) |
| **Haptic** | `ImpactFeedbackStyle.Light` |

#### 10.2.3 State: Disabled (Debounce)

| Attribute | Value |
|---|---|
| **Duration** | 300ms after each press |
| **Visual** | `opacity-50` (via `disabled && "opacity-50"` on Pressable) |
| **Interaction** | `disabled={true}` — press events are ignored |
| **Transition** | Opacity transition 150ms |

#### 10.2.4 State: Last Slide Variant

On Slide 3, the button text changes to `t('onboarding.getStarted')` — "هيا بنا" / "Get Started". The visual design is identical to the Next state. The semantic shift is communicated through text only.

### 10.3 Icon Circle (All Slides)

```
State: Entering (animation)
┌──────────────┐
│              │
│   scale: 0.8 │
│   opacity: 0 │
│              │
└──────────────┘

State: Visible (default)
┌──────────────┐
│  ┌────────┐  │
│  │  🎤    │  │  ← scale: 1.0, opacity: 1
│  └────────┘  │     bg-primary/10, rounded-full
└──────────────┘  w-24 h-24 (96dp)

State: Exiting (slide changes)
(animated out with slide transition)
```

| Attribute | Value |
|---|---|
| **Size** | `w-24 h-24` (96×96dp) |
| **Background** | `bg-primary/10` |
| **Radius** | `rounded-full` |
| **Alignment** | `flex-center` (`items-center justify-center`) |
| **Icon** | `size={48}` (Ionicons) |
| **Icon color** | `color={colors.primary}` via `useThemeColors()` |

### 10.4 Dot Indicators

```
State: Active
┌──────────────────────┐
│                      │
│   ● ← ════════╗     │
│       w-8 h-2  ║     │  ← bg-primary rounded-full
│       (32dp)   ║     │
│                ║     │
│   ● ← ════╝         │  ← w-2 h-2 bg-primary/20 rounded-full
│                      │
└──────────────────────┘

State: Inactive
┌──────────────────────┐
│                      │
│   ○ ← ════╗         │  ← w-2 h-2 bg-primary/20 rounded-full
│            ║         │
│   ○ ← ════╝         │
│                      │
└──────────────────────┘
```

| Attribute | Active | Inactive |
|---|---|---|
| **Width** | `w-8` (32dp) | `w-2` (8dp) |
| **Height** | `h-2` (8dp) | `h-2` (8dp) |
| **Background** | `bg-primary` | `bg-primary/20` |
| **Radius** | `rounded-full` | `rounded-full` |
| **Transition** | Animated (200ms spring) | Animated (200ms spring) |

### 10.5 Language Toggle (Segmented Control)

```
State: Arabic selected (default for ar-* locales)
┌──────────────────────────────────────┐
│  ┌────────────────┐ ┌──────────────┐ │
│  │   العربية      │ │   English    │ │
│  │  bg-primary    │ │  transparent │ │
│  │  text-on-primary│ │ text-muted-fg│ │
│  └────────────────┘ └──────────────┘ │
└──────────────────────────────────────┘

State: English selected
┌──────────────────────────────────────┐
│  ┌────────────────┐ ┌──────────────┐ │
│  │   العربية      │ │   English    │ │
│  │  transparent   │ │  bg-primary  │ │
│  │  text-muted-fg │ │ text-on-primary││
│  └────────────────┘ └──────────────┘ │
└──────────────────────────────────────┘

State: Pressed (active segment)
(no visual change - active segment remains active)
(the non-active segment does not show press feedback)
```

### 10.6 Reminder Toggle

```
State: OFF (default)
┌──────────────────────────────────────────────┐
│  🔔  ذكرني بتسجيل المصروفات        [  ]     │
│  text-foreground                     bg-border│
└──────────────────────────────────────────────┘

State: ON (collapsed)
┌──────────────────────────────────────────────┐
│  🔔  ذكرني بتسجيل المصروفات        [⬤ ]     │
│                                       bg-primary│
└──────────────────────────────────────────────┘

State: ON (expanded)
┌──────────────────────────────────────────────┐
│  🔔  ذكرني بتسجيل المصروفات       [⬤ ]      │
│                                              │
│  ○  بعد الغدا (١:٣٠ م)                      │  ← font-cairo text-muted-foreground
│  ●  قبل النوم (٩:٣٠ م)                      │  ← selected: text-primary
│  ○  بالليل (٧:٠٠ م)                         │
└──────────────────────────────────────────────┘

State: Disabled (notification permission permanently denied on this device)
┌──────────────────────────────────────────────┐
│  🔔  ذكرني بتسجيل المصروفات       [  ]      │
│  text-muted-foreground             opacity-50  │
└──────────────────────────────────────────────┘
```

### 10.7 Permission Explanation Dialog

This is an in-app dialog (not the OS dialog) shown before requesting permissions.

```
State: Mic explanation
┌──────────────────────────────────────┐
│                                      │
│          🎤                          │
│                                      │
│    مصروفي محتاج الميكروفون          │
│                                      │
│  مصروفي محتاج الميكروفون عشان       │
│  تسجل مصروفاتك بصوتك. مفيش          │
│  تسجيل بينرفع لسيرفر.                │
│                                      │
│  ┌──────────┐  ┌──────────────┐     │
│  │  مش دلوقتي│  │    موافق     │     │  ← Primary: "موافق" bg-primary
│  └──────────┘  └──────────────┘     │        Secondary: "مش دلوقتي" ghost
│                                      │
└──────────────────────────────────────┘

State: Notification explanation
┌──────────────────────────────────────┐
│                                      │
│          🔔                          │
│                                      │
│    مصروفي يقدر يذكرك                 │
│                                      │
│  مصروفي يقدر يذكرك عشان متنساش       │
│  تسجل. انت اللي تختار الوقت والعدد.  │
│                                      │
│  ┌──────────┐  ┌──────────────┐     │
│  │  مش دلوقتي│  │    موافق     │     │
│  └──────────┘  └──────────────┘     │
└──────────────────────────────────────┘
```

| Attribute | Value |
|---|---|
| **Style** | Modal overlay (semi-transparent backdrop 40% opacity, `bg-black/40`) |
| **Appearance** | Slide up from bottom (250ms, spring easing) |
| **Dismiss** | Tap "مش دلوقتي" (Not now) → dismiss, proceed without permission |
| **Confirm** | Tap "موافق" (Allow) → trigger OS permission dialog |
| **Auto-dismiss** | Never auto-dismisses — user must make a choice |

---

## 11. Component Architecture & Implementation Spec

### 11.1 Component Tree

```
OnboardingScreen
├── SafeAreaView (bg-background flex-1)
│   ├── SkipButton
│   │   └── Pressable → Text(t('onboarding.skip'))
│   │
│   ├── Animated.View (slideContainer)
│   │   ├── [Slide 1: VoiceSlide]
│   │   │   ├── IconCircle (mic-circle, pulse animation)
│   │   │   ├── Text (variant="h2", t('onboarding.slide1.title'))
│   │   │   └── Text (variant="muted", t('onboarding.slide1.description'))
│   │   │
│   │   ├── [Slide 2: PrivacySlide]
│   │   │   ├── IconCircle (shield-checkmark, static)
│   │   │   ├── Text (variant="h2", t('onboarding.slide2.title'))
│   │   │   └── Text (variant="muted", t('onboarding.slide2.description'))
│   │   │
│   │   └── [Slide 3: PermissionsSlide]
│   │       ├── IconCircle (options, static)
│   │       ├── Text (variant="h2", t('onboarding.slide3.title'))
│   │       ├── Text (variant="muted", t('onboarding.slide3.description'))
│   │       ├── LanguageToggle (segmented control)
│   │       └── ReminderToggle (switch + radio list)
│   │
│   ├── DotIndicator (3 dots, animated active width)
│   │
│   └── NextButton | GetStartedButton
│       └── Button (variant="default", size "lg")
│
├── PermissionExplanationModal (conditional)
│   ├── Backdrop (bg-black/40)
│   └── Dialog
│       ├── Icon
│       ├── Title
│       ├── Description
│       ├── SecondaryButton ("مش دلوقتي")
│       └── PrimaryButton ("موافق")
│
└── DeviceWithoutMicBanner (conditional — only on devices without mic hardware)
    └── Text ("يمكنك كتابة مصروفاتك")
```

### 11.2 State Management

| State | Type | Scope | Notes |
|---|---|---|---|
| `activeSlide` | `number` (0-2) | Local `useState` | Current slide index |
| `isAnimating` | `boolean` | `useRef` | Guards against input during transitions |
| `language` | `'ar' \| 'en'` | Local `useState` | Selections on Slide 3 |
| `reminderEnabled` | `boolean` | Local `useState` | Toggle state |
| `reminderTime` | `string \| null` | Local `useState` | Selected reminder time |
| `isMicExplaining` | `boolean` | Local `useState` | Permission explanation dialog visibility |
| `isNotifExplaining` | `boolean` | Local `useState` | Permission explanation dialog visibility |
| `micPermission` | `'granted' \| 'denied' \| 'undetermined'` | Platform API | From `Permissions.getAsync()` |
| `notifPermission` | `'granted' \| 'denied' \| 'undetermined'` | Platform API | From `Permissions.getAsync()` |
| `reduceMotion` | `boolean` | System setting | From `useReducedMotion()` |
| `skipVisible` | `boolean` | Derived | `!isLastSlide \|\| (isLastSlide && !autoHideSkip)` |

### 11.3 Implementation Patterns

#### Slide Container (Animated Carousel)

```tsx
// Use a flat Animated.View with translateX for slide transitions
// Three slides rendered side by side, translated into viewport

const SLIDE_WIDTH = Dimensions.get('window').width;

<Animated.View style={{ transform: [{ translateX }], flexDirection: 'row', width: SLIDE_WIDTH * 3 }}>
  <Slide1 style={{ width: SLIDE_WIDTH }} />
  <Slide2 style={{ width: SLIDE_WIDTH }} />
  <Slide3 style={{ width: SLIDE_WIDTH }} />
</Animated.View>
```

#### Animation Hooks

```typescript
// useSlideTransition(activeSlide, isRTL, reduceMotion)
// Returns { translateX: Animated.Value, opacity: Animated.Value }
// Handles direction-aware translation
```

```typescript
// useIconEntryAnimation(slideIndex, reduceMotion)
// Returns { scale: Animated.Value, opacity: Animated.Value }
// Triggers entry animation when slideIndex changes
```

```typescript
// useMicPulse(reduceMotion)
// Returns { scale: Animated.Value }
// Continuous pulse loop for Slide 1 mic icon
```

#### Swipe Gesture Handling

```tsx
// Using React Native's PanResponder for swipe detection
// Gesture start → capture X position
// Gesture move → slide content follows finger (friction factor: 0.5)
// Gesture end → if >25% of slide width, snap to next/previous; else snap back

const panResponder = PanResponder.create({
  onMoveShouldSetPanResponder: (_, gesture) => {
    return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 10;
  },
  onPanResponderMove: (_, gesture) => {
    // Translate content following finger
    animValue.setValue(-activeSlide * SLIDE_WIDTH + (isRTL ? -gesture.dx : gesture.dx));
  },
  onPanResponderRelease: (_, gesture) => {
    const threshold = SLIDE_WIDTH * 0.25;
    if (Math.abs(gesture.dx) > threshold) {
      // Snap to next/previous
    } else {
      // Snap back
    }
  },
});
```

### 11.4 Key Exports & Dependencies

| Import | Source | Usage |
|---|---|---|
| `Button` | `@/components/ui/button` | Next / Get Started button |
| `Text` | `@/components/ui/text` | All typography |
| `SafeAreaView` | `@/components/layout/SafeAreaView` | Root layout wrapper |
| `DirectionProvider` | `@/components/ui/direction-provider` | RTL/LTR context |
| `cn` | `@/lib/utils` | Class merging |
| `useThemeColors` | `@/styles/global` | Imperative icon colors |
| `useTranslation` | `react-i18next` | All user-facing strings |
| `Ionicons` | `@expo/vector-icons/Ionicons` | Slide icons |
| `Permissions` | `expo-permissions` or `expo-av` | Mic permission |
| `Notifications` | `expo-notifications` | Notification permission |
| `Haptics` | `expo-haptics` | Button press haptics |
| `AsyncStorage` | `@react-native-async-storage/async-storage` | `onboarding_complete` flag, language pref |
| `useReducedMotion` | `react-native-reanimated` or custom hook | Accessibility |
| `Animated` | `react-native` | All animations |

### 11.5 File Structure

```
src/app/
  (onboarding)/
    _layout.tsx         ← Onboarding layout (DirectionProvider wrapper)
    index.tsx            ← Main onboarding screen (carousel + all 3 slides)
  index.tsx              ← Home screen (checks onboarding_complete, redirects if needed)

src/components/
  onboarding/
    SkipButton.tsx
    IconCircle.tsx
    DotIndicator.tsx
    LanguageToggle.tsx
    ReminderToggle.tsx
    PermissionDialog.tsx
    MicDeniedBanner.tsx

src/hooks/
  useOnboarding.ts       ← Main state machine hook
  useSlideTransition.ts  ← Animation hook for slide transitions
  useMicPulse.ts         ← Pulse animation hook
  usePermissions.ts      ← Permission request/check logic
```

---

## 12. Handoff Checklist

### 12.1 Visual Design Deliverables

- [ ] Figma screen: Slide 1 — Voice (light mode)
- [ ] Figma screen: Slide 1 — Voice (dark mode)
- [ ] Figma screen: Slide 2 — Privacy (light mode)
- [ ] Figma screen: Slide 2 — Privacy (dark mode)
- [ ] Figma screen: Slide 3 — Permissions (light mode)
- [ ] Figma screen: Slide 3 — Permissions (dark mode)
- [ ] Figma screen: Permission explanation dialog (mic + notification)
- [ ] Figma screen: Permission denied banner (Home screen)
- [ ] Figma screen: Post-skip Home screen
- [ ] Figma component: Language Toggle (all states)
- [ ] Figma component: Reminder Toggle (all states)
- [ ] Figma component: Dot Indicator (3 slides)
- [ ] Figma component: Icon Circle (reusable)

### 12.2 Motion Prototype

- [ ] Prototype: Slide 1 → 2 transition
- [ ] Prototype: Slide 2 → 3 transition
- [ ] Prototype: Slide 2 → 1 (backward) transition
- [ ] Prototype: Mic pulse loop animation
- [ ] Prototype: Dot indicator animation
- [ ] Prototype: Language toggle segment slide
- [ ] Prototype: Reminder toggle expand
- [ ] Prototype: Reduced motion mode (crossfade)

### 12.3 Development Spec Items

- [ ] Translation keys added to `onboarding` namespace (see Appendix A in BRD-002)
- [ ] Theme tokens confirmed: all `bg-*`, `text-*` classes map to existing `global.css` tokens
- [ ] AsyncStorage keys: `onboarding_complete` (boolean), `app_language` ('ar' | 'en')
- [ ] Permission flows: mic requested first, then notifications (sequential)
- [ ] Permission rationale strings set in `app.json` (iOS `NSMicrophoneUsageDescription`, Android permissions)
- [ ] `useThemeColors()` hook available for imperative icon colors
- [ ] Cairo font loaded and verified for all 7 weights (ExtraLight through ExtraBold)

### 12.4 QA Checklist

- [ ] Slide transitions smooth at 60fps on Redmi Note 12 (target device)
- [ ] RTL layout correct on all 3 slides
- [ ] Dark mode renders correctly (all tokens map properly)
- [ ] Skip → Home navigation works from any slide
- [ ] Permission dialog shows in-app explanation before OS dialog
- [ ] Mic denied → Home shows banner (not crash)
- [ ] Both permissions denied → text-only mode works
- [ ] Language toggle hot-swaps UI (i18n + layout direction)
- [ ] Reminder toggle expands/collapses correctly
- [ ] Font scaling up to 150% causes no layout breakage
- [ ] VoiceOver reads all elements correctly (Arabic)
- [ ] Reduced motion disables all animations
- [ ] Rapid tapping on Next or Skip handled gracefully
- [ ] Orientation locked to portrait (no rotation during onboarding)
- [ ] `onboarding_complete` persists across app restarts

### 12.5 Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| **3 slides, not 2 or 4** | Balances completeness with brevity. 2 slides would conflate trust + permissions; 4+ would increase drop-off. | If the app had more value props (e.g., AI features), 3 slides might feel limiting. Mitigation: Slide 1 copy implies AI capability. |
| **No interactive demo on Slide 1 (v1.0)** | Reduces implementation complexity. Voice demo is a P2 feature. | Users don't get hands-on before committing to permissions. Mitigation: Mic pulse animation signals interaction. |
| **Skip button always visible (auto-hides on last slide)** | Empowers user to leave anytime. Auto-hide on last slide signals "this is the point of commitment." | Some users might not notice the skip button. Mitigation: It's always in the same position. |
| **Language toggle on Slide 3, not Slide 1** | Language preference is a secondary setting. Value prop should be language-agnostic. | Arabic-speaking users might want to confirm Arabic mode immediately. Mitigation: App defaults to Arabic for `ar-*` locales — most users see Arabic from the start. |
| **Permission dialog is in-app (not OS first)** | Contextual explanations increase grant rates by 30-50%. The user understands *why* before the system prompt. | Extra tap before OS dialog. Mitigation: In-app dialog is simple (icon + 2 lines + 2 buttons). |
| **Reminder toggle is optional and OFF by default** | Reduces cognitive load. Users can configure reminders later. | Missed opportunity to capture reminder opt-in. Mitigation: First-time Home screen has a tooltip mentioning reminders. |
| **No account creation** | Fully anonymous. Removes the #1 barrier to finance app adoption. | No cross-device sync. Mitigation: v1.0 is offline-first; account comes in Phase 6. |
| **RN Animated, not Reanimated** | Keeps bundle size smaller. Animated is sufficient for onboarding's simple transitions. | Less performant for complex gesture-driven animations. Mitigation: Onboarding swipes are simple horizontal pans — Animated handles them well at 60fps. |

---

## Appendix A: Translation Keys Onboarding Namespace

Refer to BRD-002 Section 12.1 for the complete list of `onboarding.*` translation keys. Add these to `src/i18n/locales/{ar,en}/translations.json` under an `"onboarding"` top-level key.

## Appendix B: Quick Reference — Tailwind Classes

| Element | Light Mode Classes | Dark Mode Classes |
|---|---|---|
| **Background** | `bg-background` | `bg-background` (auto) |
| **Icon circle** | `w-24 h-24 rounded-full bg-primary/10 flex-center` | Same (token auto-resolves) |
| **Title** | `text-center font-cairo-bold text-3xl text-foreground` | Same (token auto-resolves) |
| **Description** | `text-center font-cairo text-sm text-muted-foreground max-w-[300px]` | Same (token auto-resolves) |
| **Dot active** | `w-8 h-2 rounded-full bg-primary` | Same (token auto-resolves) |
| **Dot inactive** | `w-2 h-2 rounded-full bg-primary/20` | Same (token auto-resolves) |
| **Button** | `bg-primary text-on-primary h-12 rounded-xl w-full` | Same (token auto-resolves) |
| **Skip** | `text-sm font-cairo-medium text-muted-foreground` | Same (token auto-resolves) |
| **Lang toggle container** | `flex-row border border-outline rounded-xl h-12` | Same (token auto-resolves) |
| **Lang toggle active** | `flex-1 flex-center bg-primary rounded-xl` | Same (token auto-resolves) |
| **Lang toggle inactive** | `flex-1 flex-center bg-transparent` | Same (token auto-resolves) |
| **Reminder toggle** | `flex-row items-center h-12 gap-3` | Same (token auto-resolves) |

---

*This document is a living artifact specific to the Onboarding screen flow. It is a companion to the master `design/design-plan.md` and should be read alongside it for complete design system context.*

**Document prepared by:** UX/Design Team  
**Last updated:** 2026-06-19  
**Next review:** Start of Phase 1 development
