# Golden rule

**Never do work yourself — always delegate to a subagent.** You are a coordinator. Use `task` tool for non-trivial coding, research, or design work.

## Delegation protocol

1. **Always start by re-reading this file** — respect the golden rule and instructions here on every turn.
2. **Analyze the user's prompt** to determine which subagent is the best fit. If the user explicitly names a subagent, use that one. Otherwise, match the task to the most suitable subagent from the table below.
3. **Delegate, don't do.** If the task is non-trivial (multi-step, research-heavy, code-gen, design, analysis), use `task` with the chosen subagent. Do not write code, edit files, or produce deliverables yourself.
4. **Only act directly** for trivial lookups (single read/glob/grep), simple answers, or tool orchestration (managing the todo list, reading files to inform delegation).

### Available subagents

| Subagent               | Best fit                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `explore`              | Fast codebase search, research questions, understanding code patterns (built-in)                                                     |
| `senior-react-native`  | React Native architecture, components, perf optimization, debugging, code review (.opencode/agents/)                                 |
| `react-native-expert`  | React Native code review, tutoring, best practices, educational content (.opencode/agents/)                                          |
| `pm-ba-expert`         | Product management, requirements, market analysis, business strategy, BRD/PRD authoring (.opencode/agents/)                          |
| `software-architect`   | Software architecture & system design, component decomposition, scalability, reliability, trade-off analysis (.opencode/agents/)     |
| `ux-research-designer` | Design strategy, design philosophy, visual identity, design language, component architecture, research synthesis (.opencode/agents/) |
| `general`              | Multi-step code generation, refactoring, implementation, file editing (built-in)                                                     |

---

# Project overview

**Masroof (مصروف)** — Voice-first, local-first, AI-assisted expense tracking for the Egyptian market.

Core philosophy: recording an expense should take <10s (tap mic → speak → save). No forms. SQLite intended for local storage. Offline-capable from day one. Long-term: AI insights, merchant normalization, budgeting.

---

# Technical stack & architecture

## Expo SDK 56

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code — SDK 56 changed the API surface significantly from earlier versions.

## Architecture

- File-based routing in `src/app/` — `index.tsx` (Home), `explore.tsx`, `_layout.tsx` (tab navigator)
- Tab navigation via `expo-router/unstable-native-tabs` (experimental native API)
- Platform-specific files use `.web.tsx` suffix (e.g. `animated-icon.web.tsx`, `app-tabs.web.tsx`, `use-color-scheme.web.tsx`)
- Path aliases: `@/` → `src/`, `@/assets/` → `assets/`
- Dark mode via `useColorScheme()` / `useTheme()` hook; theme constants in `src/constants/theme.ts`
- Global CSS at `src/app/global.css`
- React Compiler enabled (`experiments.reactCompiler: true`)
- Typed routes enabled (`experiments.typedRoutes: true`)
- Icons via `@expo/vector-icons` — import specific families: `import Ionicons from '@expo/vector-icons/Ionicons'`, `import MaterialIcons from '@expo/vector-icons/MaterialIcons'`, `import AntDesign from '@expo/vector-icons/AntDesign'`, etc.
- Utility: `cn()` in `src/lib/utils.ts` merges Tailwind classes via `clsx` + `tailwind-merge`

## UI components (`src/components/ui/`)

Built with `class-variance-authority` (cva) + NativeWind. All use the `cn()` utility and token classes from `global.css`. Import directly: `import { Button } from '@/components/ui/button'`.

### Available components

| Component | Variants | Sizes | Notes |
|---|---|---|---|
| **Button** | `default`, `secondary`, `outline`, `ghost`, `destructive`, `link` | `sm`, `md`, `lg`, `icon` | Supports `icon`, `iconAfter`, `loading` props |
| **Text** | `h1`, `h2`, `h3`, `h4`, `p`, `lead`, `large`, `small`, `muted` | — | Wraps RN `Text` with cva styling |
| **Avatar** | — | `sm`, `md`, `lg` | Image with fallback initials |
| **DirectionProvider** | — | — | RTL/LTR context; wrap root layout with it |

### Layout components (`src/components/layout/`)

| Component | File | Usage |
|---|---|---|
| **SafeAreaView** | `src/components/layout/SafeAreaView.tsx` | Styled safe area with `bg-background flex-1 p-5` defaults |
| **Container** | `src/components/layout/container.tsx` | Wraps the `.container` utility class (`flex-1 bg-background pt-16 px-4`)

> **This is an extensible component library.** New components should be added to `src/components/ui/` following the same patterns: `cva()` for variants, `cn()` for class merging, and token classes from `global.css` for all colors.

---

# Styling system

**All styling must use NativeWind/Tailwind CSS classes with color tokens defined in `src/app/global.css`.** Never use hardcoded hex/rgb colors.

## Available color tokens (NativeWind)
Use Tailwind utility classes that map to CSS custom properties from `@theme` in `src/app/global.css`. For backgrounds: `bg-{token}`, for text: `text-{token}`, for borders: `border-{token}`. Supports opacity modifiers like `bg-primary/10`.

| Category | Token classes |
|---|---|
| **Background** | `bg-background`, `bg-surface`, `bg-surface-dim`, `bg-surface-bright`, `bg-surface-container-lowest/low/high/highest` |
| **Primary** | `bg-primary`, `text-primary`, `bg-primary-container`, `border-primary` |
| **Secondary** | `bg-secondary`, `text-secondary`, `bg-secondary-container` |
| **Tertiary** | `bg-tertiary`, `text-tertiary`, `bg-tertiary-container` |
| **On-* (text/icons on colored backgrounds)** | `text-on-primary`, `text-on-surface`, `text-on-surface-variant`, `text-on-background`, `text-muted-foreground` |
| **Semantic** | `bg-success`, `text-success`, `bg-warning`, `bg-error`, `bg-info` |
| **Outline/Border** | `border-outline`, `border-outline-variant`, `bg-input`, `bg-border` |
| **Foreground (alias)** | `text-foreground`, `bg-card`, `text-card-foreground`, `bg-popover`, `bg-muted`, `bg-accent`, `text-accent-foreground`, `bg-destructive`, `text-destructive-foreground` |

## Inline colors (for icons, imperative styles)

For cases where Tailwind classes don't apply (e.g. `color` prop on icons, imperative `Animated` styles), import the themed colors object:

```tsx
import { useThemeColors } from '@/styles/global';

function MyComponent() {
  const colors = useThemeColors();
  return <Ionicons name="footsteps" size={24} color={colors.primary} />;
}
```

The `colors` object mirrors the CSS tokens and provides `light`/`dark` variants with a `useThemeColors()` hook.

## Available component utility classes
Defined in `@layer components` in `global.css`:

| Class | Contents |
|---|---|
| `.container` | `flex-1 bg-background pt-16 px-4` |
| `.title` | `text-2xl font-bold text-foreground` |
| `.section-title` | `text-lg font-semibold text-secondary mt-7.5 mb-4` |
| `.empty` | `text-sm text-secondary` |
| `.header` | `flex-row justify-between items-center` |
| `.flex-center` | `items-center justify-center` |

## Available font families
Use via `font-{name}`: `font-cairo`, `font-cairo-bold`, `font-cairo-semibold`, `font-cairo-medium`, `font-cairo-light`, `font-cairo-extralight`, `font-cairo-extrabold`.

## Forbidden patterns
- `bg-[#hex]`, `text-[#hex]`, `color: '#hex'` — use token classes instead
- `StyleSheet.create` with hardcoded colors — use `className` with token classes

---

# Internationalization (i18n)

**All user-facing strings must use `t()` from `react-i18next`.** Never hardcode display strings.

## Setup
- Library: `i18next` v26 + `react-i18next` v17
- Import: `import { useTranslation } from 'react-i18next'`
- Bootstrap: `import '@/i18n'` in `_layout.tsx`
- Locales: `src/i18n/locales/{ar,en}/translations.json`
- Default: Arabic (`ar`), fallback: `ar`
- Detection: AsyncStorage → device locale → `ar`
- Typesafe: `src/i18n/types.ts` provides full type inference against the Arabic JSON schema

## Usage patterns
```tsx
const { t } = useTranslation();
t('common.appName');              // simple string
t('home.title', { name });        // interpolation
t('profile.followers', { count }); // pluralization (one/other keys)
```

## Translation file structure
Keys are namespaced by screen/domain:
```
common.{appName, loading, error, retry, cancel, save, delete, ...}
home.{title, subtitle, ...}
settings.{title, language, theme, notifications, ...}
profile.{title, followers, posts, ...}
```

New keys should be added to both `ar/translations.json` and `en/translations.json` under the appropriate namespace.

## Forbidden patterns
- Hardcoded user-facing strings like `"Loading..."`, `"حفظ"`, `"Next"` — use `t()` instead
- Inline text in JSX — always extract to translation files

---

# Development commands

| Action        | Command                 |
| ------------- | ----------------------- |
| Start dev     | `npm start`             |
| Android       | `npm run android`       |
| iOS           | `npm run ios`           |
| Web           | `npm run web`           |
| Lint          | `npm run lint`          |
| Reset project | `npm run reset-project` |

No test runner or typecheck script configured. TypeScript validation via `tsc` (strict mode) or editor.

---

# Caveats

- iOS/Android native builds require native project directories (`ios/`, `android/`) which are gitignored; generated via `npx expo prebuild` if needed
- `.expo/`, `dist/`, `web-build/`, `expo-env.d.ts` are gitignored build artifacts
- `.env*.local` files are gitignored; no `.env` loading is configured in this template
