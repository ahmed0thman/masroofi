# Masroof (مصروف) — The Complete Learning Roadmap

> **From Expo Crash Course to Production React Native Developer**
>
> A hands-on textbook for building a voice-first, local-first, AI-assisted personal finance app for the Arabic market.
>
> **Target Reader:** Senior JS developer (close to senior) who's watched a 30-minute Expo crash course
> **Stack:** Expo SDK 56 · React Native 0.85 · TypeScript 6 · expo-router
> **Final Product:** Masroof (مصروف) — Voice-first expense tracking for Egypt

---

## Table of Contents

- **Phase 0:** Foundations & Setup
- **Phase 1:** Design System & Theming
- **Phase 2:** Navigation Architecture
- **Phase 3:** Core UI Components Library
- **Phase 4:** Data Layer (Local-first)
- **Phase 5:** Voice Recording & AI Integration
- **Phase 6:** Features Implementation
- **Phase 7:** Polish & Developer Experience
- **Phase 8:** Testing
- **Phase 9:** Production Readiness

---

## How to Use This Roadmap

Each phase is structured as a **chapter** with subsections that follow a consistent rhythm:

1. 📚 **Concept** — What this thing is, why it matters, how it works under the hood
2. 🛠️ **Hands-on** — Real code you write, files you create, decisions you make
3. 🔗 **Resources** — Curated links to official docs, tutorials, and deep-dives

The code examples are specific to Masroof. Every `Text` component renders Arabic. Every `View` respects RTL. Every number uses Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩). This is not a generic tutorial — it's the blueprint for a specific, production-quality app.

At the senior level, you don't need hand-holding. You need to understand the **why** behind each decision, the **trade-offs** you're making, and the **architecture** that will keep the app maintainable through 6 phases of feature growth. That's what this roadmap delivers.

---

## Phase 0: Foundations & Setup

> *"The quality of your foundation determines the ceiling of your architecture."*

### 0.1 Environment Setup

Before you write a single line of React Native code, you need a working development environment. This is the most common source of friction for newcomers, so let's be methodical.

#### What You Need

| Tool | Version (minimum) | Purpose |
|------|-------------------|---------|
| Node.js | 22.13.x | JavaScript runtime (SDK 56 requires this) |
| npm / yarn / pnpm | Any recent | Package manager |
| Xcode | 26.4+ | iOS development (macOS only) |
| Android Studio | Hedgehog (2023.1.1)+ | Android development |
| `expo-cli` | Bundled with `npx expo` | Expo development server |
| EAS CLI | Latest (`npm i -g eas-cli`) | Build & submit |
| Watchman | Latest | File watcher for Metro bundler |

**Node.js:** Expo SDK 56 requires Node.js 22.13.x or later. If you're managing multiple Node versions, use `nvm`:

```bash
nvm install 22.13
nvm use 22.13
node --version  # → v22.13.x
```

**Xcode:** Install from the Mac App Store or the Apple Developer portal. After installation, open it once to accept licenses and install command-line tools:

```bash
sudo xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app
```

**Android Studio:** Install, then go to *Preferences → Appearance & Behavior → System Settings → Android SDK* and ensure:
- Android SDK Platform 36 (matching `compileSdkVersion` for SDK 56)
- Android SDK Build-Tools 36
- Android Emulator
- Intel HAXM or Apple Hypervisor (for M1/M2, use the built-in ARM emulator)

Create an emulator with API 36 via the *Device Manager*.

**Physical device testing** is essential for voice features (microphone, haptics). On iOS, you'll need a paid Apple Developer account ($99/yr) for physical device deployment. For development, the simulator suffices for most UI work.

#### 🛠️ Verification

Create a quick smoke-test to confirm everything works:

```bash
npx create-expo-app smoke-test --template blank
cd smoke-test
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator. If you see the default screen, your environment is ready.

---

### 0.2 Expo CLI vs React Native CLI — Why Expo SDK 56?

This is a recurring debate in the React Native community. As a senior developer arriving from the JS world, you need to understand the trade-offs clearly — not just accept dogma.

**React Native CLI** gives you a bare React Native project. You control the native code (Java/Kotlin for Android, Objective-C/Swift for iOS). This was historically necessary for native module integration and fine-grained build configuration. But it came with a cost: every dependency update could break your native project; you had to maintain `Podfile`, `build.gradle`, and `Info.plist` alongside your JS code.

**Expo** is a managed framework on top of React Native. It provides:
- A curated SDK of well-tested, cross-platform packages
- A build service (EAS) that handles native compilation in the cloud
- Over-the-air updates via `expo-updates`
- File-based routing via `expo-router`
- Access to the native module ecosystem via Expo Modules API

**The Landscape Today (2026):** The gap between Expo and bare RN has narrowed dramatically. With Expo SDK 56:
- You can use **any** native library via the Expo Modules API or config plugins
- The React Native New Architecture (Fabric + TurboModules) is the default
- Expo UI provides stable SwiftUI (iOS) and Jetpack Compose (Android) native components
- Hermes is the default JavaScript engine
- Precompiled XCFrameworks make iOS builds 5x faster

**Why SDK 56 for Masroof?**
1. **Expo Router drops React Navigation dependency** — SDK 56 forks React Navigation, giving us cleaner imports and better performance
2. **SQLite with SQLCipher** is built-in via `expo-sqlite` — essential for local-first, encrypted storage
3. **React Compiler** is opt-in via `experiments.reactCompiler: true` — automatic memoization without `useMemo`/`React.memo`
4. **Expo Audio** (`expo-audio`) replaces the deprecated `expo-av` with a cleaner API for voice recording
5. **EAS Build** handles code signing, app store submission, and OTA updates — we don't want to manage native build pipelines
6. **Typed Routes** — type-safe navigation without manual type generation

**The Single Trade-off:** If you need a native module that hasn't been wrapped by Expo or doesn't support Expo Modules API, you need a "development build" (custom native binary) rather than Expo Go. For Masroof, the only potentially exotic module is Whisper.cpp for on-device speech recognition — which has Expo-compatible bindings.

> **Senior Decision:** Use Expo SDK 56 in managed workflow with dev client. The productivity gain vs. bare RN is enormous, and the limitations don't affect our use case. We can always eject later if needed (rarely necessary).

🔗 **Resources:**
- [Expo SDK 56 Release Notes](https://expo.dev/changelog/sdk-56)
- [Expo vs. React Native CLI: When to Use Which](https://docs.expo.dev/faq/#what-is-the-difference-between-expo-and-react-native)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [New Animation Backend in RN 0.85](https://reactnative.dev/blog/2026/04/07/react-native-0.85)

---

### 0.3 Project Initialization from Scratch

Let's create Masroof from scratch. We'll do this manually — not from a template — so you understand every file generated.

```bash
# Create the project using the blank TypeScript template
npx create-expo-app@latest masroof --template blank-typescript
cd masroof
```

**What was generated?** Let's examine each file:

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts. Entry point is `expo-router/entry` (we'll change this) |
| `app.json` | Expo configuration: app name, slug, icons, plugins, experiments |
| `tsconfig.json` | TypeScript configuration (extends `expo/tsconfig.base`) |
| `App.tsx` | Root component — we'll replace this with expo-router |
| `assets/` | Static assets: icons, splash screen images, fonts |
| `.gitignore` | Node modules, Expo build artifacts, environment files |

Now, let's transform this into Masroof's architecture.

**Step 1: Install expo-router and configure entry point**

```bash
npx expo install expo-router
```

In `package.json`, change the `"main"` field:

```json
{
  "main": "expo-router/entry"
}
```

**Step 2: Create the directory structure**

```bash
# Remove the default App.tsx (expo-router doesn't use it)
rm App.tsx

# Create the source directory structure
mkdir -p src/app
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/utils
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/config
mkdir -p src/styles
mkdir -p src/providers
mkdir -p src/services
mkdir -p src/db
mkdir -p tests
```

**Why this structure?**

- `src/app/` — Reserved exclusively for expo-router file-based routes. No components, no hooks.
- `src/components/` — Reusable UI components (Card, Button, VoiceBar, etc.)
- `src/lib/` — Third-party library wrappers and configurations
- `src/utils/` — Pure utility functions (formatting, validation, etc.)
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript type definitions and interfaces
- `src/constants/` — App-wide constants (colors, spacing, API URLs)
- `src/config/` — Environment configuration
- `src/styles/` — Global styles, theming utilities
- `src/providers/` — React context providers
- `src/services/` — Business logic services (AI, voice, etc.)
- `src/db/` — Database schema, migrations, repository pattern
- `tests/` — Test files (mirrors `src/` structure)

**Step 3: Create the root layout**

This is the foundation of expo-router navigation.

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
```

**Step 4: Create the index route**

```tsx
// src/app/index.tsx
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>مصروف</Text>
      <Text style={styles.subtitle}>مرحباً بك في تطبيق مصروف</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3EF',
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0E6655',
  },
  subtitle: {
    fontSize: 16,
    color: '#1b1c1a',
    marginTop: 8,
  },
});
```

---

### 0.4 TypeScript 6 Strict Mode Setup

The project already has strict mode enabled (`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`). But let's understand what this gives us:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

**What `strict: true` enables:**
- `strictNullChecks` — `null` and `undefined` are distinct types; you must handle them
- `noImplicitAny` — Every variable must have a type (explicit or inferred)
- `strictFunctionTypes` — More rigorous function parameter variance checking
- `strictBindCallApply` — Type-checks `bind`, `call`, `apply` arguments
- `strictPropertyInitialization` — Class properties must be initialized in constructor
- `noImplicitThis` — `this` in functions must have a contextual type
- `alwaysStrict` — Emit `"use strict"` for every file

**Path Aliases Deep Dive:**

The `@/*` → `./src/*` and `@/assets/*` → `./assets/*` aliases are configured in both `tsconfig.json` (for TypeScript) and need a matching resolver in Metro bundler.

Add the Metro config:

```bash
npx expo install babel-plugin-module-resolver
```

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/assets': './assets',
          },
        },
      ],
    ],
  };
};
```

**Why both?** TypeScript uses `tsconfig.json` `paths` for type checking and IDE autocompletion. Metro/Babel uses `module-resolver` for actual module resolution at build time. Both must be in sync.

---

### 0.5 expo-router File-Based Routing Deep Dive

expo-router is the most consequential architectural decision in this project. Let's understand it deeply.

**The Core Idea:** Every file in `src/app/` becomes a route. The file path maps to the URL path:

| File | URL |
|------|-----|
| `src/app/index.tsx` | `/` |
| `src/app/about.tsx` | `/about` |
| `src/app/settings/index.tsx` | `/settings` |
| `src/app/settings/profile.tsx` | `/settings/profile` |
| `src/app/users/[id].tsx` | `/users/123` (dynamic) |
| `src/app/(tabs)/index.tsx` | `/` (grouped, no URL prefix) |
| `src/app/_layout.tsx` | Root layout (not a route) |

**Layout Files (`_layout.tsx`):** These are the structural backbone. A layout file wraps all routes in its directory with a navigator. The root `_layout.tsx` wraps the entire app. A `(tabs)/_layout.tsx` wraps tab routes.

**Route Groups (parentheses):** Directories like `(tabs)` or `(auth)` group routes without affecting the URL. This is essential for organization without semantic impact on navigation.

**Dynamic Routes (brackets):** `[id].tsx` captures URL parameters. Access them via `useLocalSearchParams()`.

**How Navigation Works Under the Hood:**

expo-router uses a **file system watcher** (via Metro) to detect file changes. When you add, remove, or rename a file in `src/app/`, the bundler regenerates the route map. This is why you don't need to manually register routes — the file system IS the configuration.

In SDK 56, expo-router forked from React Navigation. This means:
- No more `@react-navigation/*` imports from your code
- Stack navigator comes from `expo-router` directly
- Tab navigator comes from `expo-router/js-tabs` or `expo-router/ui`
- Smaller bundle size, faster navigation, tighter integration with Expo

**Type-safe Routes (typedRoutes experiment):**

When `experiments.typedRoutes: true` is set in `app.json` (already done), Expo CLI generates type definitions for all your routes. This means:

```tsx
import { Link } from 'expo-router';

// ❌ TypeScript error — this route doesn't exist
<Link href="/nonexistent">Broken Link</Link>

// ✅ Autocompleted and type-checked
<Link href="/settings/profile">Profile</Link>
```

The generated types live in `.expo/types/` and are auto-registered via `tsconfig.json` include.

🔗 **Resources:**
- [Core Concepts of File-Based Routing](https://docs.expo.dev/router/basics/core-concepts/)
- [Expo Router Notation (Groups, Dynamic Routes)](https://docs.expo.dev/router/basics/notation/)
- [Typed Routes Reference](https://docs.expo.dev/router/reference/typed-routes/)
- [SDK 56 Migration Guide (React Navigation Fork)](https://docs.expo.dev/router/migrate/sdk-55-to-56/)

---

### 0.6 ESLint + Prettier Setup

Code quality tools are non-negotiable in a production codebase. Let's set them up properly.

```bash
# Install ESLint and related packages
npx expo install eslint --dev
npx expo install @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev
```

Create `.eslintrc.js`:

```js
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'expo',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
  },
};
```

Add Prettier for consistent formatting:

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

The VS Code settings already auto-fix on save (`source.fixAll` and `source.organizeImports`). This gives you a zero-friction workflow.

🔗 **Resources:**
- [Expo Unit Testing Guide](https://docs.expo.dev/develop/unit-testing/) (also covers lint setup)
- [TypeScript ESLint](https://typescript-eslint.io/)

---

## Phase 1: Design System & Theming

> *"A design system is not a collection of components — it's a shared language between design and engineering."*

### 1.1 RTL Layout Fundamentals in React Native

Before we write a single style, understand how Right-to-Left rendering works at the native level.

**The I18nManager API:**

React Native's `I18nManager` module wraps platform-specific RTL support:
- **iOS:** Uses `UIView` `semanticContentAttribute` and `NSUserInterfaceLayoutDirection`
- **Android:** Uses `android:supportsRTL` manifest attribute and `View` `layoutDirection`

When `I18nManager.isRTL` is `true`, React Native flips the flexbox coordinate system:
- `flexDirection: 'row'` lays children from right to left
- `alignItems: 'flex-start'` aligns to the right edge
- `marginStart` / `paddingEnd` replace `marginLeft` / `paddingRight`
- `textAlign: 'left'` becomes right-aligned

**The Golden Rule of RTL:** Never use `left`/`right` in style properties. Always use `start`/`end`:
- `marginLeft` → `marginStart`
- `marginRight` → `marginEnd`
- `paddingLeft` → `paddingStart`
- `paddingRight` → `paddingEnd`
- `left` → `start` (for absolute positioning)
- `right` → `end` (for absolute positioning)
- `borderLeftWidth` → `borderStartWidth`
- `borderRightWidth` → `borderEndWidth`

**Directional icons** (back arrows, chevrons) need explicit flipping:

```tsx
import { I18nManager } from 'react-native';

const styles = StyleSheet.create({
  backArrow: {
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
});
```

Non-directional icons (settings gear, home, search) should NOT be flipped.

**For Masroof, RTL is not an option — it's the default.** We set it at app startup:

```tsx
// src/lib/i18n.ts
import { I18nManager } from 'react-native';

// At app startup
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// This requires an app restart to take effect on iOS
// In production, the device language setting handles this
```

Note: `forceRTL` persists across restarts. This is intentional — once set, the app always renders RTL. For testing RTL during development, call `I18nManager.forceRTL(true)` and reload.

🔗 **Resources:**
- [React Native I18nManager Documentation](https://reactnative.dev/docs/i18nmanager)
- [Architecting RTL in React Native](https://medium.com/@ancybhairavi/architecting-rtl-in-react-native-what-breaks-and-what-works-8d96c8cba62b)
- [Implementing RTL in React Native Expo](https://dev.to/geekyants-inc/implementing-rtl-right-to-left-in-react-native-expo-a-step-by-step-guide-m01)

---

### 1.2 Cairo Font Integration

The Cairo font family supports both Arabic and Latin scripts with consistent visual weight — critical for an app where users code-switch between languages.

**Option A: Runtime Loading (simpler, works on all platforms)**

```bash
npx expo install @expo-google-fonts/cairo expo-font
```

```tsx
// src/hooks/useLoadFonts.ts
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';

export function useLoadFonts() {
  const [fontsLoaded, fontsError] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  return { fontsLoaded, fontsError };
}
```

**Option B: Config Plugin (more efficient, native build time)**

```json
{
  "plugins": [
    [
      "expo-font",
      {
        "fonts": [
          "./assets/fonts/Cairo-Regular.ttf",
          "./assets/fonts/Cairo-SemiBold.ttf",
          "./assets/fonts/Cairo-Bold.ttf"
        ]
      }
    ]
  ]
}
```

**For Masroof, use Option B** for production performance. The config plugin embeds fonts at build time, eliminating the runtime loading flash. During early development, Option A is fine for rapid iteration.

Regardless of method, the font family name to use in styles is `'Cairo'` (with the config plugin) or `'Cairo_400Regular'` etc. (with `@expo-google-fonts`). We'll abstract this in our theme.

🔗 **Resources:**
- [expo-font Documentation (SDK 56)](https://docs.expo.dev/versions/v56.0.0/sdk/font)
- [@expo-google-fonts/cairo on npm](https://www.npmjs.com/package/@expo-google-fonts/cairo)
- [Cairo Font on Google Fonts](https://fonts.google.com/specimen/Cairo)

---

### 1.3 Color Palette, Spacing, and Typography Constants

The design system is fully specified in `DESIGN.md`. Let's codify it as TypeScript constants.

```tsx
// src/constants/colors.ts
export const colors = {
  // Primary
  primary: '#0E6655',
  onPrimary: '#FFFFFF',
  primaryContainer: '#0E6655',
  onPrimaryContainer: '#94E1CB',
  inversePrimary: '#89D5C0',

  // Surfaces
  surface: '#FBF9F5',
  surfaceDim: '#DBDAD6',
  surfaceBright: '#FBF9F5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F3EF',
  surfaceContainer: '#F0EEEA',
  surfaceContainerHigh: '#EAE8E4',
  surfaceContainerHighest: '#E4E2DE',

  // On-surface
  onSurface: '#1B1C1A',
  onSurfaceVariant: '#3F4945',
  inverseSurface: '#30312E',
  inverseOnSurface: '#F2F0EC',

  // Outline
  outline: '#6F7975',
  outlineVariant: '#BEC9C4',
  surfaceTint: '#166A59',

  // Secondary
  secondary: '#5F5E5E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E5E2E1',
  onSecondaryContainer: '#656464',

  // Tertiary
  tertiary: '#43433E',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#5B5B55',
  onTertiaryContainer: '#D4D3CB',

  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',

  // Inverse
  primaryFixed: '#A5F2DB',
  primaryFixedDim: '#89D5C0',
  onPrimaryFixed: '#002019',
  onPrimaryFixedVariant: '#005142',

  secondaryFixed: '#E5E2E1',
  secondaryFixedDim: '#C8C6C5',
  onSecondaryFixed: '#1C1B1B',
  onSecondaryFixedVariant: '#474646',

  tertiaryFixed: '#E4E3DB',
  tertiaryFixedDim: '#C8C7BF',
  onTertiaryFixed: '#1B1C17',
  onTertiaryFixedVariant: '#474742',

  // Background
  background: '#FBF9F5',
  onBackground: '#1B1C1A',
  surfaceVariant: '#E4E2DE',
} as const;

export type ColorKey = keyof typeof colors;
```

```tsx
// src/constants/typography.ts
import { I18nManager } from 'react-native';

export const typography = {
  displayLg: {
    fontFamily: 'Cairo',
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 34 * 1.4,
    letterSpacing: 0,
  },
  headlineMd: {
    fontFamily: 'Cairo',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 24 * 1.5,
    letterSpacing: 0,
  },
  headlineSm: {
    fontFamily: 'Cairo',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 20 * 1.6,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: 'Cairo',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 18 * 1.7,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 16 * 1.7,
    letterSpacing: 0,
  },
  labelMd: {
    fontFamily: 'Cairo',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 14 * 1.4,
    letterSpacing: 0,
  },
  numeralXl: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 40 * 1.2,
    letterSpacing: 0,
  },
} as const;

export type TypographyKey = keyof typeof typography;
```

```tsx
// src/constants/spacing.ts
export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  safeArea: 20,
} as const;

export const borderRadius = {
  sm: 4,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;
```

The `as const` assertion is critical here. It tells TypeScript to infer the narrowest literal types (e.g., `'#0E6655'` instead of `string`), giving us autocomplete and type safety throughout the app.

---

### 1.4 Eastern Arabic Numeral Formatting

This is a unique requirement for Masroof. Standard Western numerals (0-9) must be converted to Eastern Arabic (٠-٩) throughout the UI.

```tsx
// src/utils/format.ts
/**
 * Formats a number using Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩).
 * Uses Intl.NumberFormat with ar-SA locale for correct numeral rendering.
 *
 * @param amount - The numeric amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted string with Eastern Arabic numerals
 *
 * @example
 * formatCurrency(450) // → "٤٥٠‏ ج.م."
 * formatCurrency(1250.5) // → "١٬٢٥٠٫٥‏ ج.م."
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Formats a number with Eastern Arabic numerals, no currency symbol.
 *
 * @example
 * formatNumber(1234) // → "١٬٢٣٤"
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat('ar-SA', {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Formats a date string or Date object to Arabic locale.
 *
 * @example
 * formatDate(new Date('2026-06-13')) // → "١٣ يونيو ٢٠٢٦"
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Converts a number to Eastern Arabic numeral string (no separators, no currency).
 *
 * @example
 * toEasternArabic(450) // → "٤٥٠"
 */
export function toEasternArabic(value: number): string {
  return new Intl.NumberFormat('ar-SA', {
    useGrouping: false,
  }).format(value);
}
```

**Why `Intl.NumberFormat` instead of a manual character replacement?**

Manual replacement (`String.replace(/\d/g, d => easternArabicDigits[d])`) works for simple cases but fails for:
- Decimal separators (Arabic uses `٫` not `.`)
- Group separators (Arabic uses `٬` not `,`)
- Currency symbol placement (varies by locale)
- Negative number formatting

`Intl.NumberFormat` with `ar-SA` locale handles all of this correctly, leveraging ICU (International Components for Unicode) data built into JavaScript engines.

**Edge Cases to Watch:**
- `Intl.NumberFormat` in Hermes (React Native's JS engine) — Hermes supports `Intl` starting from v0.72. SDK 56 uses Hermes which includes full ICU data
- For non-Hermes environments, you may need `intl` polyfill. Test on both platforms early
- On Android, ensure the device has Arabic locale data (it does, since Android ships with Arabic support)

---

### 1.5 Theme Provider Architecture

Rather than passing colors/tokens manually to every component, we build a theme context that provides design tokens throughout the component tree.

```tsx
// src/providers/ThemeProvider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { colors } from '@/constants/colors';
import { typography, TypographyKey } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

export type Theme = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Why not a global style object?** React Native doesn't have CSS custom properties or a global stylesheet. A context-based theme provider gives us:
- Proper React reactivity (theme changes trigger re-renders)
- Dark mode support (future: swap the theme object based on `useColorScheme()`)
- Type safety for all theme tokens

In the root layout, wrap the app:

```tsx
// src/app/_layout.tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded, fontsError } = useLoadFonts();

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
```

---

### 1.6 Global Styles vs CSS-in-JS in React Native

React Native has no CSS. It uses JavaScript objects for styles via `StyleSheet.create()`. This is not CSS-in-JS in the web sense — it's closer to raw style objects that are compiled to native layout primitives.

**The Mental Model:**

| Web CSS | React Native |
|---------|--------------|
| `.class { color: red; }` | `StyleSheet.create({ myStyle: { color: 'red' } })` |
| `div` | `View` |
| `span` | `Text` |
| `display: flex` | Default (all views are flex containers) |
| `flex-direction: row` | `flexDirection: 'row'` |
| `box-shadow` | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation` |
| `::before` / `::after` | Not available (use explicit components) |
| Media queries | `useWindowDimensions()` or `Dimensions` API |

**Best Practices for Masroof:**

1. **Use `StyleSheet.create()`** for all component styles — it validates at compile time and optimizes for the native renderer
2. **Prefer inline styles only for truly dynamic values** (animations, runtime-computed colors)
3. **Extract common patterns** (`shadow`, `card`, `row`) into reusable style creators
4. **Never use `StyleSheet.absoluteFillObject`** — it was removed in RN 0.85. Use `StyleSheet.absoluteFill` or define custom absolute positioning

```tsx
// src/styles/common.ts
import { StyleSheet, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';

export const commonStyles = StyleSheet.create({
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
```

🔗 **Resources:**
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)
- [React Native Layout with Flexbox](https://reactnative.dev/docs/flexbox)
- [Platform-Specific Code in RN](https://reactnative.dev/docs/platform-specific-code)

---

### 1.7 Safe Area Handling

Notchless phones are extinct. Every modern device has a notch, punch-hole, dynamic island, or rounded corners. `react-native-safe-area-context` gives you the insets to avoid these.

```tsx
// src/providers/SafeAreaProvider.tsx
// expo-router already wraps this, but we can customize
import { SafeAreaProvider as OriginalProvider } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  return (
    <OriginalProvider>
      {children}
    </OriginalProvider>
  );
}
```

Usage in screens:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Screen content */}
    </View>
  );
}
```

For the bottom voice zone (a critical Masroof pattern), we'll account for the bottom safe area inset:

```tsx
const styles = StyleSheet.create({
  voiceZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    paddingBottom: insets.bottom,
  },
});
```

🔗 **Resources:**
- [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context)

---

## Phase 2: Navigation Architecture

> *"Navigation is the skeleton of your app. Build it wrong, and every feature feels wrong."*

### 2.1 expo-router File-Based Routing — Beyond the Basics

Let's build Masroof's route structure. Here's the complete file tree we'll create:

```
src/app/
├── _layout.tsx                 # Root layout (Stack navigator)
├── index.tsx                   # Splash/onboarding (redirects to tabs)
├── (tabs)/
│   ├── _layout.tsx             # Tab navigator layout
│   ├── index.tsx               # Home/Dashboard tab
│   ├── add.tsx                 # Voice recording tab (center button)
│   ├── transactions.tsx        # Transaction list tab
│   └── settings.tsx            # Settings tab
├── add/
│   ├── _layout.tsx             # Stack for add flows
│   ├── review.tsx              # Review & confirm expense
│   └── edit/[id].tsx           # Edit an existing expense
├── transactions/
│   ├── [id].tsx                # Transaction detail
│   └── category/[slug].tsx     # Category breakdown
├── settings/
│   ├── profile.tsx             # User profile
│   ├── reminders.tsx           # Smart reminder configuration
│   ├── backup.tsx              # Backup settings
│   ├── appearance.tsx          # Theme/numerals preferences
│   └── about.tsx               # About & licenses
└── modal/
    └── _layout.tsx             # Modal stack (presentation: modal)
```

**Key architectural decisions:**

1. **The root `_layout.tsx`** is a `Stack` navigator. This wraps the entire app in a stack, allowing us to push modals over tabs
2. **`(tabs)/_layout.tsx`** defines the tab bar. The `(tabs)` group keeps URL clean (no `/tabs/` prefix)
3. **`add/_layout.tsx`** is a nested stack inside the add tab. This supports the flow: voice recording → review → save
4. **`modal/_layout.tsx`** uses `presentation: 'modal'` for overlays

---

### 2.2 Tab Navigation Setup

```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons'; // or expo-symbols

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'المعاملات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'إضافة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 8} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

**Why `headerShown: false`?** We'll build custom headers per screen that respect RTL and the design system. The default header doesn't support Arabic titles well and doesn't match our visual language.

---

### 2.3 Stack Navigation for Modals and Detail Screens

The root layout needs to differentiate between regular screens and modals:

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function RootLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontFamily: 'Cairo',
          fontWeight: '600',
        },
      }}
    >
      {/* Tab group is the default screen */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Modal screens present differently */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
```

**The Modal Layout:**

```tsx
// src/app/modal/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="index" // will be modal/index.tsx
        options={{ title: 'modal title' }}
      />
    </Stack>
  );
}
```

---

### 2.4 Type-Safe Routes

With `experiments.typedRoutes: true` (already set in `app.json`), Expo CLI generates `expo-env.d.ts` with route types. You get:

- Autocomplete on `<Link href={} />`
- TypeScript errors on invalid routes
- Type safety on dynamic route parameters

**But there's a catch:** The generated types are based on your file structure at build time. When you add new routes, restart the dev server to regenerate them.

**Manual typing for query parameters:**

```tsx
import { useLocalSearchParams } from 'expo-router';

// For a dynamic route [id].tsx, params are auto-typed
const { id } = useLocalSearchParams<{ id: string }>();

// For query params (not from route path), type manually
const { category } = useLocalSearchParams<{ category?: string }>();
```

---

### 2.5 Deep Linking Configuration

Expo Router handles deep linking automatically. Every route is a URL:

```
masroof://transactions/123
masroof://add/review
masroof://settings/profile
```

This is configured via the URL scheme in `app.json`:

```json
{
  "expo": {
    "scheme": "masroof"
  }
}
```

**Importance for Masroof:** Smart reminders (Phase 5) will deep-link users directly to the microphone recording screen. With file-based routing, this is trivial:

```tsx
// When user taps notification, navigate to:
router.replace('/add');
```

No manual deep link handler needed. The notification tap just opens the app to the correct route.

---

### 2.6 Navigation Guards (Auth State)

Masroof is local-first with no mandatory account. But we need to handle:
- First-launch onboarding (shown once)
- Optional cloud account (shown if user wants backup)

```tsx
// src/lib/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'masroof-storage',
});

export const hasCompletedOnboarding = (): boolean => {
  return storage.getBoolean('onboarding_completed') ?? false;
};

export const setOnboardingCompleted = () => {
  storage.set('onboarding_completed', true);
};
```

```tsx
// src/app/_layout.tsx (updated)
import { Redirect } from 'expo-router';
import { hasCompletedOnboarding } from '@/lib/storage';

export default function RootLayout() {
  const { fontsLoaded } = useLoadFonts();
  const onboardingDone = hasCompletedOnboarding();

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
          redirect={!onboardingDone}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
          redirect={onboardingDone}
        />
      </Stack>
    </ThemeProvider>
  );
}
```

Note: The `redirect` prop on `Stack.Screen` controls initial route based on condition. This is the idiomatic expo-router approach — no manual `if` statements, just declarative routing.

🔗 **Resources:**
- [Common Navigation Patterns (expo-router)](https://docs.expo.dev/router/basics/common-navigation-patterns)
- [Expo Router API Reference](https://docs.expo.dev/versions/latest/sdk/router/)
- [Expo Router v56 Blog Post](https://expo.dev/blog/expo-router-v56-decoupling-from-react-navigation)
- [Native Tabs (expo-router)](https://docs.expo.dev/router/advanced/native-tabs/)

---

## Phase 3: Core UI Components Library

> *"Components are the vocabulary of your design system. Build a small, precise vocabulary."*

### 3.1 Design Principles for Masroof Components

Before we write component code, establish the rules:

1. **RTL-aware by default** — Every component must render correctly in RTL without conditionals
2. **Haptic feedback built in** — Every interactive component triggers a light haptic on interaction
3. **Accessibility first** — Proper `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`
4. **Loading states** — Every data-dependent component has a skeleton/loading variant
5. **Max 2 primary actions per screen** — Enforced at the component level, not by convention
6. **Cairo font throughout** — No system fonts anywhere

---

### 3.2 Base Text Component

Since the default `<Text>` component doesn't use Cairo font, we wrap it:

```tsx
// src/components/AppText.tsx
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface AppTextProps extends TextProps {
  variant?: keyof typeof import('@/constants/typography').typography;
  color?: string;
}

export function AppText({
  variant = 'bodyMd',
  color,
  style,
  children,
  ...props
}: AppTextProps) {
  const { typography, colors } = useTheme();
  const typographyStyle = typography[variant];

  return (
    <Text
      style={[
        typographyStyle,
        { color: color ?? colors.onSurface },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
```

Usage:

```tsx
<AppText variant="numeralXl" color={colors.primary}>
  {formatCurrency(450)}
</AppText>
```

---

### 3.3 Card Component

Cards are the primary content containers for transaction history and budget summaries.

```tsx
// src/components/Card.tsx
import { View, ViewProps, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import * as Haptics from 'expo-haptics';

interface CardProps extends ViewProps {
  onPress?: () => void;
  elevated?: boolean;
}

export function Card({
  onPress,
  elevated = true,
  style,
  children,
  ...props
}: CardProps) {
  const { colors, borderRadius: radii, spacing } = useTheme();

  const cardStyle = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...(elevated ? styles.elevated : {}),
      ...(elevated && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
      }),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={cardStyle}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle} {...props}>{children}</View>;
}
```

---

### 3.4 The VoiceBar Component (Critical!)

The VoiceBar occupies the bottom 30% of the screen and is the primary interaction zone for voice-first input. This is Masroof's most distinctive component.

```tsx
// src/components/VoiceBar.tsx
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';

interface VoiceBarProps {
  onMicPress: () => void;
  isRecording?: boolean;
  statusText?: string;
}

export function VoiceBar({
  onMicPress,
  isRecording = false,
  statusText = 'اضغط للتحدث',
}: VoiceBarProps) {
  const { colors, borderRadius: radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLow,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <View style={styles.statusContainer}>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
          {statusText}
        </AppText>
      </View>

      <Pressable
        style={[
          styles.micButton,
          {
            backgroundColor: colors.primary,
            width: 72,
            height: 72,
            borderRadius: 36, // pill shape
          },
          isRecording && styles.micButtonRecording,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onMicPress();
        }}
        accessibilityLabel={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}
        accessibilityRole="button"
        accessibilityState={{ selected: isRecording }}
      >
        <Ionicons
          name={isRecording ? 'mic' : 'mic-outline'}
          size={32}
          color={colors.onPrimary}
        />
      </Pressable>

      {isRecording && (
        <View style={styles.waveform}>
          {/* Real-time waveform visualization — Phase 7 */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusContainer: {
    marginBottom: 16,
  },
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    // Pulse animation will be added in Phase 7
  },
  waveform: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

**Design rationale:**
- Positioned absolute at bottom, height 30% — matches the "voice zone" constraint from DESIGN.md
- Large pill-shaped mic button — easy to hit, follows the "no hard corners" rule
- Safe area padding — avoids system navigation bar on newer iPhones
- Status text changes based on recording state — provides clear affordance
- RTL-native — `left: 0, right: 0` stretches correctly in both directions

---

### 3.5 Other Core Components

**Button:**

```tsx
// src/components/Button.tsx
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { AppText } from './AppText';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const { colors, borderRadius: radii, spacing } = useTheme();

  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary ? colors.primary : 'transparent';
  const textColor = isPrimary ? colors.onPrimary : colors.primary;
  const borderColor = variant === 'secondary' ? colors.primary : 'transparent';

  return (
    <Pressable
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderRadius: radii.full, // pill shape
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
      onPress={() => {
        if (!disabled && !loading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText
          variant="labelMd"
          color={textColor}
          style={disabled ? { opacity: 0.5 } : undefined}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
```

**Chip (Category selector):**

```tsx
// src/components/Chip.tsx
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { AppText } from './AppText';
import * as Haptics from 'expo-haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, spacing, borderRadius: radii } = useTheme();

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
          borderRadius: radii.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <AppText
        variant="labelMd"
        color={selected ? colors.onPrimaryContainer : colors.onSurfaceVariant}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
```

**BottomSheet (for review screen):**

```tsx
// src/components/BottomSheet.tsx
import { View, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNode, useEffect, useRef } from 'react';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colors, borderRadius: radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              paddingBottom: insets.bottom + spacing.md,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag indicator */}
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.outlineVariant },
            ]}
          />
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
```

**Each component follows a consistent pattern:**
1. Import theme via `useTheme()` hook
2. Destructure exact tokens needed
3. Use logical properties (`start`/`end`, not `left`/`right`)
4. Include haptic feedback on interaction
5. Set accessibility props
6. Support loading/disabled/error states

🔗 **Resources:**
- [React Native Pressable](https://reactnative.dev/docs/pressable)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Platform-Specific Shadows in RN](https://reactnative.dev/docs/shadow-props)

---

## Phase 4: Data Layer (Local-first)

> *"Data ownership is local. The cloud is a backup, not the source of truth."*

### 4.1 SQLite with expo-sqlite

Expo SDK 56 ships with `expo-sqlite` which provides direct SQLite access with synchronous and asynchronous APIs, prepared statements, and SQLCipher support for encryption.

**Installation:**

```bash
npx expo install expo-sqlite
```

**Why SQLite over WatermelonDB, Realm, or Firestore?**

| Database | Strengths | Weaknesses |
|----------|-----------|------------|
| **SQLite (expo-sqlite)** | Mature, reliable, single-file backup, SQLCipher encryption, zero dependencies | Requires writing SQL, manual reactive queries |
| **WatermelonDB** | Reactive queries, built for large lists | Complex setup, SQLite under the hood anyway |
| **Realm** | Object-oriented, reactive | Larger binary, less Expo-native, Realm licensing |
| **Firestore** | Real-time sync, Firebase ecosystem | Requires network, vendor lock-in, violates local-first principle |

**For Masroof's local-first architecture, SQLite is the correct choice:**
- We need full offline functionality — SQLite is inherently local
- The data model (expenses, categories, tickets) maps naturally to relational tables
- SQLCipher encrypts the database at rest — essential for financial data
- A single `.db` file is trivially backup-able (copy the file, done)

---

### 4.2 Database Schema Design

```tsx
// src/db/schema.ts
export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
  -- Tickets: raw voice recording + transcript pairs
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    audio_path TEXT NOT NULL,
    transcript TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Expenses: structured expense records
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    merchant TEXT,
    category TEXT,
    subcategory TEXT,
    notes TEXT,
    confidence REAL DEFAULT 0,
    extracted_json TEXT, -- full extraction output as JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Categories: user's category taxonomy
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Normalization: merchant/category alias mappings
  CREATE TABLE IF NOT EXISTS normalization (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('merchant', 'category', 'product')),
    original TEXT NOT NULL,
    canonical TEXT NOT NULL,
    user_confirmed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Budgets: monthly budget targets
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    category TEXT,
    amount REAL NOT NULL,
    period TEXT NOT NULL DEFAULT 'monthly',
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_expenses_merchant ON expenses(merchant);
  CREATE INDEX IF NOT EXISTS idx_normalization_type_original ON normalization(type, original);
`;
```

**Schema design principles:**
- **UUIDs as primary keys** — Avoids auto-increment collision; enables offline UUID generation (use `uuid` or `crypto.randomUUID()`)
- **ISO 8601 timestamps** — Sort correctly lexicographically; no timezone ambiguity
- **`extracted_json` column** — Stores the full AI extraction output as JSON for debugging, re-extraction, and future model improvements
- **`normalization` table** — Records canonical mappings for merchants, categories, and products. This is the foundation for Phase 4's normalization engine
- **Foreign keys with `ON DELETE SET NULL`** — Preserves expense data even if the original ticket is deleted

---

### 4.3 Repository Pattern for Data Access

The repository pattern abstracts database queries behind a clean interface. This is crucial for testability and future migration (switching to a sync engine doesn't change the repository interface).

```tsx
// src/db/database.ts
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('masroof.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Enable WAL mode for better concurrent performance
  await database.execAsync('PRAGMA journal_mode = WAL;');

  // Enable foreign keys
  await database.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await database.execAsync(CREATE_TABLES);

  // Track schema version for migrations
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

  const currentVersion = await database.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_version'
  );

  if (!currentVersion || currentVersion.version < SCHEMA_VERSION) {
    // Run migrations here in future schema versions
    await database.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      SCHEMA_VERSION
    );
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
```

**Expense Repository:**

```tsx
// src/db/repositories/expense.repository.ts
import { getDatabase } from '@/db/database';

export interface Expense {
  id: string;
  ticketId: string | null;
  amount: number;
  currency: string;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
  notes: string | null;
  confidence: number;
  extractedJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  id: string;
  ticketId?: string;
  amount: number;
  currency?: string;
  merchant?: string;
  category?: string;
  subcategory?: string;
  notes?: string;
  confidence?: number;
  extractedJson?: string;
}

export class ExpenseRepository {
  async create(input: CreateExpenseInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO expenses (id, ticket_id, amount, currency, merchant, category, subcategory, notes, confidence, extracted_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.ticketId ?? null,
        input.amount,
        input.currency ?? 'EGP',
        input.merchant ?? null,
        input.category ?? null,
        input.subcategory ?? null,
        input.notes ?? null,
        input.confidence ?? 0,
        input.extractedJson ?? null,
      ]
    );
  }

  async findById(id: string): Promise<Expense | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM expenses WHERE id = ?',
      id
    );
    return row ? this.mapRow(row) : null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> {
    const db = await getDatabase();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options?.category) {
      conditions.push('category = ?');
      params.push(options.category);
    }
    if (options?.startDate) {
      conditions.push('created_at >= ?');
      params.push(options.startDate);
    }
    if (options?.endDate) {
      conditions.push('created_at <= ?');
      params.push(options.endDate);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM expenses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, options?.limit ?? 50, options?.offset ?? 0]
    );
    return rows.map(this.mapRow);
  }

  async update(id: string, updates: Partial<Expense>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const params: unknown[] = [];

    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      params.push(updates.amount);
    }
    if (updates.merchant !== undefined) {
      fields.push('merchant = ?');
      params.push(updates.merchant);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      params.push(updates.category);
    }
    // ... other fields

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    params.push(id);

    await db.runAsync(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  }

  private mapRow(row: Record<string, unknown>): Expense {
    return {
      id: row.id as string,
      ticketId: row.ticket_id as string | null,
      amount: row.amount as number,
      currency: row.currency as string,
      merchant: row.merchant as string | null,
      category: row.category as string | null,
      subcategory: row.subcategory as string | null,
      notes: row.notes as string | null,
      confidence: row.confidence as number,
      extractedJson: row.extracted_json as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const expenseRepository = new ExpenseRepository();
```

---

### 4.4 Custom Hooks for CRUD Operations

React hooks form the reactive bridge between the database and the UI:

```tsx
// src/hooks/useExpenses.ts
import { useState, useEffect, useCallback } from 'react';
import { expenseRepository, Expense } from '@/db/repositories/expense.repository';

interface UseExpensesOptions {
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseRepository.findAll(options);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load expenses'));
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.category, options.startDate, options.endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (input: Parameters<typeof expenseRepository.create>[0]) => {
    await expenseRepository.create(input);
    await load(); // Refresh list
  }, [load]);

  const update = useCallback(async (id: string, updates: Partial<Expense>) => {
    await expenseRepository.update(id, updates);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const remove = useCallback(async (id: string) => {
    await expenseRepository.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    expenses,
    loading,
    error,
    refresh: load,
    create,
    update,
    delete: remove,
  };
}
```

**Why not use a state management library (Redux, Zustand, Jotai)?**

For a local-first app where the database is the single source of truth, global state management adds complexity without benefit. The pattern is simple:
1. **Read from SQLite** — `useExpenses()` hook queries the DB
2. **Write to SQLite** — Repository methods modify the DB and update local state
3. **UI reacts** — Updated state triggers re-render

If you need cross-screen state sharing (e.g., "selected category" in filters), React Context suffices. Redux-like global stores are useful for:
- Complex undo/redo
- Optimistic updates with rollback
- Middleware-heavy side effect management

Masroof doesn't need these. Yet. If Phase 6 (cloud sync) introduces conflict resolution, consider Zustand for its simplicity.

---

### 4.5 Offline-First Architecture Patterns

**The Offline-First Mindset:**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  User Action │ ──→ │  Local DB    │ ──→ │  UI Update  │
│  (tap mic)   │     │  (SQLite)    │     │  (instant)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ↓
                    ┌──────────────┐
                    │  Cloud Sync  │ (Phase 6, optional)
                    │  (encrypted) │
                    └──────────────┘
```

**Key patterns for Masroof:**

1. **Write-through caching:** Every mutation writes to SQLite first, then (optionally) syncs to cloud. UI never waits for network.
2. **Optimistic updates:** When the user saves an expense, the UI updates immediately. If cloud sync fails (Phase 6), the local change persists.
3. **Conflict resolution:** Last-write-wins with a change log. Each record has `updated_at` timestamp.
4. **Background sync:** When the app comes online, sync pending changes in the background. No user interaction required.

```tsx
// src/services/sync.service.ts (Phase 6 scaffolding)
interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  payload: string; // JSON
  created_at: string;
  attempts: number;
}
```

The sync queue table stores pending cloud sync operations. When the network is available, a background service processes them. This pattern ensures that:
- Local operations are never blocked by network conditions
- Sync is eventually consistent
- The user never sees a loading spinner for cloud operations

🔗 **Resources:**
- [expo-sqlite Documentation (SDK 56)](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [Repository Pattern in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/repository-ddd-pattern/)

---

## Phase 5: Voice Recording & AI Integration

> *"The mic is the primary input device. Everything else is fallback."*

### 5.1 expo-audio for Voice Recording

Expo SDK 56 introduces `expo-audio` as the replacement for the deprecated `expo-av`. It provides a cleaner, more focused API for audio recording and playback.

```bash
npx expo install expo-audio
```

**Configuration in `app.json`:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "يحتاج مصروف إلى الوصول إلى الميكروفون لتسجيل المصروفات الصوتية",
          "recordAudioAndroid": true
        }
      ]
    ]
  }
}
```

**The Voice Recorder Hook:**

```tsx
// src/hooks/useVoiceRecorder.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio, useAudioRecorder, RecordingPresets } from 'expo-audio';
import * as Haptics from 'expo-haptics';

interface RecordingResult {
  uri: string;
  durationMs: number;
  meteringData: number[]; // For waveform visualization
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPermissionGranted: boolean;
  permissionStatus: string;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingResult | null>;
  requestPermission: () => Promise<void>;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('لم يتم الطلب بعد');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const meteringData = useRef<number[]>([]);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const requestPermission = useCallback(async () => {
    const { granted, status } = await Audio.requestRecordingPermissionsAsync();
    setIsPermissionGranted(granted);
    setPermissionStatus(status === 'granted' ? 'تم منح الإذن' : status);
    return granted;
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = isPermissionGranted || (await requestPermission());
    if (!hasPermission) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Track recording duration
      let seconds = 0;
      durationInterval.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
      }, 1000);

      // Collect metering data periodically for waveform
      // Note: actual metering varies by platform — this is a simplified version
    } catch (error) {
      console.error('Failed to start recording', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isPermissionGranted, requestPermission, recorder]);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!recorder.isRecording) return null;

    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    try {
      await recorder.stop();
      setIsRecording(false);
      setDuration(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result: RecordingResult = {
        uri: recorder.uri ?? '',
        durationMs: duration * 1000,
        meteringData: meteringData.current,
      };

      return result;
    } catch (error) {
      console.error('Failed to stop recording', error);
      return null;
    }
  }, [recorder, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  return {
    isRecording,
    isPermissionGranted,
    permissionStatus,
    duration,
    startRecording,
    stopRecording,
    requestPermission,
  };
}
```

**Important design decisions:**
- **`RecordingPresets.HIGH_QUALITY`** — For speech recognition, 16kHz mono is sufficient, but we use high quality to preserve audio for re-transcription with improved models later
- **`staysActiveInBackground: true`** — Allows recording to continue if the user switches apps briefly
- **Haptic feedback** — Heavy feedback when recording starts, success/error on stop

---

### 5.2 Microphone Permissions

Permissions in modern iOS and Android are increasingly strict. Handle them properly:

```tsx
// src/hooks/useMicrophonePermission.ts
import { useEffect, useState } from 'react';
import { Audio } from 'expo-audio';
import { Alert, Linking, Platform } from 'react-native';

export function useMicrophonePermission() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const checkPermission = async (): Promise<boolean> => {
    if (permissionResponse?.granted) return true;

    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'الإذن مطلوب',
        'يحتاج مصروف إلى الوصول إلى الميكروفون لتسجيل المصروفات الصوتية. يرجى منح الإذن من الإعدادات.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'فتح الإعدادات', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  };

  return {
    granted: permissionResponse?.granted ?? false,
    canAskAgain: permissionResponse?.canAskAgain ?? true,
    checkPermission,
    requestPermission,
  };
}
```

**User experience principle:** Never gate the app on permissions at first launch. Show the app, explain why the mic is needed, then request permission. Contextual permission requests convert better.

---

### 5.3 Speech-to-Text Integration

For Phase 1 (MVP), we'll use a placeholder that simulates transcription. The full Whisper.cpp integration is described architecturally but implemented when the native module is ready.

**Architecture for STT:**

```tsx
// src/services/stt.service.ts
/**
 * Speech-to-Text Service
 *
 * Architecture:
 * ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
 * │ Audio File   │ → │ Whisper.cpp  │ → │ Transcript  │
 * │ (16kHz PCM)  │    │ (on-device)  │    │             │
 * └─────────────┘    └──────────────┘    └─────────────┘
 *
 * The Whisper.cpp model runs entirely on-device.
 * No audio data leaves the device.
 * Supports Arabic, English, and code-switched input.
 */

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  confidence: number;
}

export class STTService {
  private modelLoaded = false;

  async loadModel(): Promise<void> {
    // Load Whisper.cpp model from local assets
    // Model file stored in assets/ directory or downloaded on first launch
    this.modelLoaded = true;
  }

  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    // TODO: Implement actual Whisper.cpp integration
    // For Phase 1 MVP, return placeholder
    return {
      text: 'هذا نص تجريبي للتعرف على الصوت',
      language: 'ar',
      segments: [],
      confidence: 0.95,
    };
  }
}

export const sttService = new STTService();
```

**For Phase 2 (Structured Extraction), we'll add NLU:**

```tsx
// src/services/extraction.service.ts
export interface ExtractedExpense {
  amount: number | null;
  currency: string;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
  items: Array<{ name: string; price: number }> | null;
  date: string | null;
  confidence: number;
  rawTranscript: string;
}

export class ExtractionService {
  async extract(transcript: string): Promise<ExtractedExpense> {
    // TODO: Implement on-device LLM (Gemma 3n) integration
    // For Phase 1 MVP, return mock extraction
    return {
      amount: null,
      currency: 'EGP',
      merchant: null,
      category: null,
      subcategory: null,
      items: null,
      date: new Date().toISOString().split('T')[0],
      confidence: 0,
      rawTranscript: transcript,
    };
  }
}

export const extractionService = new ExtractionService();
```

---

### 5.4 The Recording Flow (End-to-End)

Here's how all the pieces connect:

```tsx
// src/app/(tabs)/add.tsx — the voice recording screen
import { View, StyleSheet } from 'react-native';
import { VoiceBar } from '@/components/VoiceBar';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useRouter } from 'expo-router';
import { sttService } from '@/services/stt.service';

export default function AddExpenseScreen() {
  const router = useRouter();
  const {
    isRecording,
    startRecording,
    stopRecording,
    duration,
  } = useVoiceRecorder();

  const handleMicPress = async () => {
    if (isRecording) {
      const recording = await stopRecording();
      if (recording?.uri) {
        // Navigate to review screen with the recording URI
        router.push({
          pathname: '/add/review',
          params: { audioUri: recording.uri },
        });
      }
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Content area — shows recent expenses or quick stats */}
      <View style={styles.content}>
        {/* Will be filled in Phase 6 */}
      </View>

      {/* Voice zone — always present at bottom */}
      <VoiceBar
        onMicPress={handleMicPress}
        isRecording={isRecording}
        statusText={
          isRecording
            ? `تسجيل... ${duration}s`
            : 'اضغط للتحدث'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  content: {
    flex: 1,
    paddingBottom: '30%', // Leave room for VoiceBar
  },
});
```

🔗 **Resources:**
- [expo-audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Building Production Audio Recorder with Expo](https://dev.to/albert_nahas_cdc8469a6ae8/building-a-production-audio-recorder-with-expo-and-react-native-3h7n)
- [Whisper.cpp (on-device STT)](https://github.com/ggerganov/whisper.cpp)

---

## Phase 6: Features Implementation

> *"Each feature is a complete vertical: database → service → hook → component → screen."*

### 6.1 Add Expense Screen (Voice-First, Form-Fallback)

The add screen is the most important screen in the app. It must feel effortless.

**Flow:**
1. User opens app → sees VoiceBar at bottom
2. Taps mic → records expense → navigates to review
3. Review screen shows extracted data → user confirms or corrects
4. Save to SQLite → success haptic → return to home

**Review Screen:**

```tsx
// src/app/add/review.tsx
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { VoiceBar } from '@/components/VoiceBar';
import { expenseRepository } from '@/db/repositories/expense.repository';
import { extractionService, ExtractedExpense } from '@/services/extraction.service';
import { useTheme } from '@/providers/ThemeProvider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { formatCurrency } from '@/utils/format';

export default function ReviewExpenseScreen() {
  const { audioUri } = useLocalSearchParams<{ audioUri: string }>();
  const { colors, spacing } = useTheme();
  const [extraction, setExtraction] = useState<ExtractedExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['طعام', 'مواصلات', 'بقالة', 'ترفيه', 'صحة', 'أخرى'];

  useEffect(() => {
    async function processAudio() {
      try {
        // TODO: Call STT + extraction service
        // const transcript = await sttService.transcribe(audioUri);
        // const result = await extractionService.extract(transcript.text);
        // Simulated:
        await new Promise(r => setTimeout(r, 1500)); // Simulate processing
        setExtraction({
          amount: 450,
          currency: 'EGP',
          merchant: 'Carrefour',
          category: 'بقالة',
          subcategory: null,
          items: null,
          date: new Date().toISOString().split('T')[0],
          confidence: 0.92,
          rawTranscript: 'دفعت ٤٥٠ جنيه في كارفور على أكل البيت',
        });
        setSelectedCategory('بقالة');
      } catch (error) {
        console.error('Extraction failed', error);
      } finally {
        setLoading(false);
      }
    }
    processAudio();
  }, [audioUri]);

  const handleSave = async () => {
    if (!extraction) return;

    await expenseRepository.create({
      id: crypto.randomUUID(),
      amount: extraction.amount ?? 0,
      merchant: extraction.merchant ?? undefined,
      category: selectedCategory ?? extraction.category ?? undefined,
      notes: extraction.rawTranscript,
      confidence: extraction.confidence,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <AppText variant="headlineMd">جاري المعالجة...</AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
            يتم استخراج معلومات المصروف
          </AppText>
        </View>
        <VoiceBar
          onMicPress={() => {}}
          statusText="جارٍ التعرف على الصوت..."
          isRecording={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContent}>
        {/* Amount display */}
        <View style={styles.amountContainer}>
          <AppText variant="numeralXl" color={colors.primary}>
            {formatCurrency(extraction?.amount ?? 0)}
          </AppText>
        </View>

        {/* Extracted fields */}
        <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <AppText variant="headlineSm">تفاصيل المصروف</AppText>

          <View style={styles.fieldRow}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>التاجر</AppText>
            <AppText variant="bodyMd">{extraction?.merchant ?? '—'}</AppText>
          </View>

          <View style={styles.fieldRow}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>التصنيف</AppText>
            <View style={styles.categoryRow}>
              {categories.map(cat => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldRow}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>التاريخ</AppText>
            <AppText variant="bodyMd">{extraction?.date ?? '—'}</AppText>
          </View>

          <View style={styles.fieldRow}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>دقة الاستخراج</AppText>
            <AppText variant="bodyMd">
              {Math.round((extraction?.confidence ?? 0) * 100)}%
            </AppText>
          </View>
        </Card>

        {/* Original transcript */}
        <Card style={{ marginHorizontal: spacing.lg }}>
          <AppText variant="labelMd" color={colors.onSurfaceVariant}>
            النص الأصلي
          </AppText>
          <AppText variant="bodyMd" style={{ marginTop: spacing.xs }}>
            {extraction?.rawTranscript}
          </AppText>
        </Card>
      </ScrollView>

      {/* Save button */}
      <View style={styles.saveContainer}>
        <Button
          title="حفظ المصروف"
          onPress={handleSave}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingTop: 20,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  fieldRow: {
    marginTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  saveContainer: {
    padding: 20,
  },
});
```

---

### 6.2 Transaction List with Filtering

```tsx
// src/app/(tabs)/transactions.tsx
import { View, FlatList, StyleSheet, TextInput } from 'react-native';
import { useExpenses } from '@/hooks/useExpenses';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/providers/ThemeProvider';
import { formatCurrency, formatDate } from '@/utils/format';
import { router } from 'expo-router';
import { useState } from 'react';

export default function TransactionsScreen() {
  const { colors, spacing } = useTheme();
  const { expenses, loading, refresh } = useExpenses({ limit: 100 });
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? expenses.filter(
        e =>
          e.merchant?.includes(searchQuery) ||
          e.category?.includes(searchQuery)
      )
    : expenses;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerHigh }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface, fontFamily: 'Cairo' }]}
          placeholder="بحث في المعاملات..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
      </View>

      {/* Transaction list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/transactions/${item.id}`)}
            style={{ marginBottom: spacing.sm }}
          >
            <View style={styles.transactionRow}>
              <View>
                <AppText variant="bodyMd">{item.merchant ?? '—'}</AppText>
                <AppText variant="labelMd" color={colors.onSurfaceVariant}>
                  {item.category ?? 'غير مصنف'} · {formatDate(item.createdAt)}
                </AppText>
              </View>
              <AppText variant="headlineSm" color={colors.primary}>
                {formatCurrency(item.amount)}
              </AppText>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              لا توجد معاملات بعد
            </AppText>
          </View>
        }
      />
    </View>
  );
}
```

---

### 6.3 Category Management

Categories come from a combination of:
1. **System defaults** — 6-8 default categories (طعام, مواصلات, بقالة, ترفيه, صحة, فواتير, تعليم, أخرى)
2. **User-created** — Users add custom categories
3. **AI-suggested** — From extraction service (Phase 2+)

```tsx
// src/db/repositories/category.repository.ts
export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const db = await getDatabase();
    return db.getAllAsync<Category>(
      'SELECT * FROM categories ORDER BY sort_order ASC'
    );
  }

  async createDefaultCategories(): Promise<void> {
    const defaults = [
      { name: 'طعام', icon: 'fast-food', color: '#E74C3C' },
      { name: 'مواصلات', icon: 'car', color: '#3498DB' },
      { name: 'بقالة', icon: 'cart', color: '#2ECC71' },
      { name: 'ترفيه', icon: 'game-controller', color: '#9B59B6' },
      { name: 'صحة', icon: 'medkit', color: '#1ABC9C' },
      { name: 'فواتير', icon: 'document-text', color: '#F39C12' },
      { name: 'تعليم', icon: 'school', color: '#2980B9' },
      { name: 'أخرى', icon: 'ellipsis-horizontal', color: '#95A5A6' },
    ];

    for (const cat of defaults) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), cat.name, cat.icon, cat.color, 0]
      );
    }
  }
}
```

---

### 6.4 Dashboard with Charts (Phase 5)

The dashboard shows spending overview using `react-native-chart-kit` or a custom drawing with React Native Skia:

```tsx
// src/app/(tabs)/index.tsx (Dashboard)
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/providers/ThemeProvider';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/utils/format';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const { expenses } = useExpenses({ limit: 50 });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category aggregation
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    const cat = e.category ?? 'أخرى';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Total spending */}
      <Card style={{ marginBottom: spacing.md }}>
        <AppText variant="labelMd" color={colors.onSurfaceVariant}>
          إجمالي المصروفات
        </AppText>
        <AppText variant="displayLg" color={colors.primary}>
          {formatCurrency(totalSpent)}
        </AppText>
      </Card>

      {/* Category breakdown */}
      <Card style={{ marginBottom: spacing.md }}>
        <AppText variant="headlineSm" style={{ marginBottom: spacing.md }}>
          تحليل التصنيفات
        </AppText>
        {Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <AppText variant="bodyMd">{category}</AppText>
              <AppText variant="bodyMd" color={colors.primary}>
                {formatCurrency(amount)}
              </AppText>
            </View>
          ))}
      </Card>

      {/* Recent transactions */}
      <AppText variant="headlineSm" style={{ marginBottom: spacing.sm }}>
        آخر المعاملات
      </AppText>
      {expenses.slice(0, 5).map(expense => (
        <Card key={expense.id} style={{ marginBottom: spacing.xs }}>
          {/* Transaction row */}
        </Card>
      ))}
    </ScrollView>
  );
}
```

🔗 **Resources:**
- [Building Accessible Lists in RN](https://reactnative.dev/docs/accessibility#lists)
- [React Native FlatList Performance](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)

---

## Phase 7: Polish & Developer Experience

> *"An app that feels good to use is used. An app that feels good to build is maintained."*

### 7.1 Gesture Handling with Reanimated

`react-native-gesture-handler` and `react-native-reanimated` are pre-installed (SDK 56 includes them). They replace the built-in `PanResponder` and `Animated` APIs with native-driven animations.

**Swipe-to-Confirm (for expense recording):**

```tsx
// src/components/SwipeToConfirm.tsx
import { StyleSheet, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';
import { AppText } from './AppText';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
}

const SWIPE_THRESHOLD = Dimensions.get('window').width * 0.6;

export function SwipeToConfirm({
  onConfirm,
  label = 'اسحب للتأكيد',
}: SwipeToConfirmProps) {
  const { colors, borderRadius: radii } = useTheme();
  const translateX = useSharedValue(0);
  const isConfirmed = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isConfirmed.value && event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        isConfirmed.value = true;
        translateX.value = withSpring(SWIPE_THRESHOLD);
        runOnJS(onConfirm)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: radii.full,
        },
      ]}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.slider,
            {
              backgroundColor: colors.primary,
              borderRadius: radii.full,
            },
            animatedStyle,
          ]}
        >
          <AppText color={colors.onPrimary} variant="labelMd">
            ←
          </AppText>
        </Animated.View>
      </GestureDetector>
      <AppText
        variant="bodyMd"
        color={colors.onSurfaceVariant}
        style={styles.label}
      >
        {label}
      </AppText>
    </View>
  );
}
```

**Animation Backend in RN 0.85:** React Native 0.85 introduced the new Shared Animation Backend (built in collaboration with Software Mansion). This allows:
- Animating layout props (Flexbox, position) with native driver
- Better integration between `Animated` and `Reanimated`
- Deterministic Shadow Tree commits during animations

For Masroof, this means:
- Smooth mic button pulse animation during recording
- Card entrance animations as expenses load
- Sheet transitions for the review bottom sheet

---

### 7.2 Haptic Feedback System

Rather than scattering `Haptics.impactAsync()` calls throughout the codebase, create a unified feedback system:

```tsx
// src/lib/haptics.ts
import * as Haptics from 'expo-haptics';

export const HapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  soft: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  rigid: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  selection: () => Haptics.selectionAsync(),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

**Haptic feedback policy (from DESIGN.md):**
- Every successful voice command → `medium`
- Every tap on a primary action → `light`
- Every selection change → `selection`
- Error/failure → `error`
- Success/completion → `success`

---

### 7.3 Error Boundaries

React error boundaries are class components (hooks don't support `componentDidCatch`). Wrap each tab or section:

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/constants/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <AppText variant="headlineSm">حدث خطأ</AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
            {this.state.error?.message ?? 'خطأ غير متوقع'}
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <AppText variant="labelMd" color={colors.primary}>
              إعادة المحاولة
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

### 7.4 Performance Optimization

**React Compiler (Automatic Memoization):**

SDK 56 ships with `experiments.reactCompiler: true` in `app.json`. This enables React's experimental compiler at build time. The compiler automatically memoizes components and hooks based on their static analysis, eliminating:
- Manual `React.memo()` calls
- `useMemo()` for derived data
- `useCallback()` for event handlers

**What this means for you:** Write code naturally. Don't wrap everything in `useCallback`. Let the compiler handle optimization. Trust the compiler's reach analysis.

**When to still optimize manually:**
1. **FlatList `renderItem`** — Always define outside the component or wrap in `useCallback`. FlatList uses referential equality to avoid re-rendering items
2. **Context values** — Objects passed to context providers should be stable references

```tsx
// Optimal FlatList usage
const renderItem = useCallback(({ item }: { item: Expense }) => (
  <ExpenseCard expense={item} onPress={() => handlePress(item.id)} />
), [handlePress]);

// Context with stable value
const themeValue = useMemo(() => ({
  colors,
  typography,
  spacing,
  borderRadius,
}), [colors, typography, spacing, borderRadius]);
```

**Image optimization:**

Use `expo-image` for optimized image loading. It provides:
- Automatic caching
- Blurhash placeholders
- Memory-efficient loading

```tsx
import { Image } from 'expo-image';

// Instead of <Image source={require('./icon.png')} />
<Image
  source={require('@/assets/images/icon.png')}
  style={{ width: 200, height: 200 }}
  placeholder={{ blurhash: 'LKO2:N%2Tw=w}~9Z=w}~9Z=w}~9Z' }}
  contentFit="cover"
/>
```

🔗 **Resources:**
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Haptics (SDK 56)](https://docs.expo.dev/versions/v56.0.0/sdk/haptics/)
- [React Compiler in Expo SDK 56](https://expo.dev/changelog/sdk-56)
- [New Animation Backend in RN 0.85](https://reactnative.dev/blog/2026/04/07/react-native-0.85)

---

## Phase 8: Testing

> *"Untested code is legacy code."*

### 8.1 Unit Testing with Jest + React Native Testing Library

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

**Jest Configuration:**

```json
// package.json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterSetup": ["./tests/setup.ts"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1",
      "^@/assets/(.*)$": "<rootDir>/assets/$1"
    }
  }
}
```

**Test setup file:**

```tsx
// tests/setup.ts
import '@testing-library/react-native/extend-expect';

// Mock expo-haptics (don't vibrate during tests)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  loadAsync: jest.fn(),
}));
```

**Component Test Example:**

```tsx
// tests/components/Card.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Card } from '@/components/Card';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AppText } from '@/components/AppText';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <Card>
          <AppText>محتوى البطاقة</AppText>
        </Card>
      </ThemeProvider>
    );

    expect(screen.getByText('محتوى البطاقة')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <ThemeProvider>
        <Card onPress={onPress}>
          <AppText>بطاقة قابلة للنقر</AppText>
        </Card>
      </ThemeProvider>
    );

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with accessibility role', () => {
    render(
      <ThemeProvider>
        <Card onPress={() => {}}>
          <AppText>بطاقة</AppText>
        </Card>
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });
});
```

**Hook Test Example:**

```tsx
// tests/hooks/useExpenses.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useExpenses } from '@/hooks/useExpenses';

// Mock the expense repository
jest.mock('@/db/repositories/expense.repository', () => ({
  expenseRepository: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useExpenses', () => {
  it('should load expenses on mount', async () => {
    const mockExpenses = [
      { id: '1', amount: 100, merchant: 'Carrefour', category: 'بقالة' },
      { id: '2', amount: 50, merchant: 'Uber', category: 'مواصلات' },
    ];

    const { findAll } = require('@/db/repositories/expense.repository').expenseRepository;
    findAll.mockResolvedValue(mockExpenses);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.expenses).toHaveLength(2);
    expect(result.current.expenses[0].merchant).toBe('Carrefour');
  });

  it('should handle errors gracefully', async () => {
    const { findAll } = require('@/db/repositories/expense.repository').expenseRepository;
    findAll.mockRejectedValue(new Error('DB connection failed'));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.expenses).toEqual([]);
  });
});
```

---

### 8.2 E2E Testing with Maestro

Maestro is a mobile E2E testing framework that's simpler to set up than Detox and works well with Expo.

```bash
# Install Maestro
curl -Ls 'https://get.maestro.mobile.dev' | bash
```

```yaml
# .maestro/record_expense.yaml
appId: com.masroof.app
---
- launchApp
- tapOn:
    point: "50%,90%"  # Mic button position
- assertVisible: "اضغط للتحدث"
- tapOn: "المعاملات"
- assertVisible: "لا توجد معاملات بعد"
```

🔗 **Resources:**
- [Expo Unit Testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Mobile E2E Testing](https://maestro.mobile.dev/)
- [jest-expo documentation](https://github.com/expo/expo/tree/main/packages/jest-expo)

---

## Phase 9: Production Readiness

> *"Building the app is 50%. Shipping it is the other 50%."*

### 9.1 App Icon and Splash Screen

The splash screen is configured in `app.json`:

```json
{
  "expo": {
    "splash": {
      "backgroundColor": "#F5F3EF",
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain"
    },
    "icon": "./assets/images/icon.png",
    "ios": {
      "icon": "./assets/images/icon.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#F5F3EF"
      }
    }
  }
}
```

**Splash screen best practices:**
- Use a simple logo on a background matching your surface color
- Keep the splash screen minimal — it's a loading state, not a brand billboard
- The `expo-splash-screen` plugin (already configured) shows the splash immediately and hides when fonts are loaded

---

### 9.2 Over-the-Air Updates with expo-updates

```bash
npx expo install expo-updates
```

Configuration in `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID",
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

**How OTA updates work:**
1. You publish a JS bundle update via `eas update`
2. The app checks for updates on launch (or in background)
3. If a newer runtime-compatible update exists, it's downloaded
4. On next app restart, the new bundle is used

**Hermes bytecode diffing (SDK 56):** Enabled by default. Instead of downloading the full bundle for each update, only binary patches are downloaded. This makes updates ~10x smaller.

**Important:** OTA updates can only change JS/asset bundles. Native code changes require a new build via EAS Build.

---

### 9.3 App Build with EAS Build

```bash
npm i -g eas-cli
eas login
eas build:configure
```

**`eas.json`:**

```json
{
  "cli": {
    "version": ">= 14.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build commands:**

```bash
# Development build
eas build --platform all --profile development

# Preview build for internal testing
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

**Code signing:**
- **iOS:** EAS manages certificates and provisioning profiles automatically via `eas credentials`
- **Android:** EAS managed signing keys or you can upload your own

---

### 9.4 Performance Monitoring with Sentry

```bash
npx expo install @sentry/react-native
```

```tsx
// src/lib/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 0.2, // Sample 20% of transactions for performance
  environment: __DEV__ ? 'development' : 'production',
  enableNative: true,
});

// Wrap root component
const RootLayoutWithSentry = Sentry.wrap(RootLayout);
```

---

### 9.5 CI/CD Setup

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.13'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test

  eas-build:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22.13'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile production --non-interactive
```

---

### 9.6 App Store Submission Prep

**iOS App Store:**
1. Enroll in Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Configure: name (مصروف), subtitle, description (Arabic + English), keywords, screenshots
4. Submit via EAS Submit: `eas submit --platform ios --profile production`
5. Prepare for review: test account credentials, demo video, privacy policy URL

**Google Play Store:**
1. Enroll in Google Play Console ($25 one-time)
2. Create app listing
3. Upload AAB via `eas submit --platform android --profile production`
4. Complete store listing: description, screenshots, category (Finance), content rating

**Key submission requirements:**
- Privacy policy URL (required by both stores for finance apps)
- Test account credentials
- Clear explanation of microphone usage
- Data deletion mechanism
- Minimum OS versions: iOS 16.4+, Android 11+

🔗 **Resources:**
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [expo-updates API Reference (SDK 56)](https://docs.expo.dev/versions/v56.0.0/sdk/updates)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Expo + GitHub Actions CI](https://docs.expo.dev/build/automate-with-workflows/)

---

## Closing Thoughts

You've now walked through the complete architecture of a production-grade React Native application. Let me leave you with some principles that will serve you beyond Masroof:

**1. Understand the platform, not just the framework.**
React Native abstracts iOS and Android, but it doesn't erase them. When something breaks — a gesture doesn't feel right, a shadow renders differently, a keyboard covers an input — the answer is often in the platform's native behavior, not in React Native's API. Developer tools like Xcode's Accessibility Inspector and Android Studio's Layout Inspector are your friends.

**2. Local-first is a mindset, not a feature.**
The instinct of every web developer is "save to server, then update UI." Break that instinct. For mobile apps, the user's data is on their device. The server is a backup. Design your data layer around this truth and your app will work offline, feel instant, and respect user privacy.

**3. Voice-first forces better design.**
Designing for voice input constrains your UI in productive ways. When the primary interaction is speaking, you can't have 50 form fields, complex multi-step flows, or cluttered screens. The "max 2 primary actions per screen" rule emerged naturally from this constraint. Apply similar constraints to your own products — limitation breeds creativity.

**4. Build for the Arabic market properly.**
RTL is not just flipping layouts. It's right-aligned text, Eastern Arabic numerals, Cairo font with correct line height, respectful of cultural context (Ramadan spending, Friday weekends, EGP currency). The apps that win in regional markets are the ones that feel native — not English apps with a translation layer.

**5. Production quality is a habit, not a phase.**
Don't save accessibility for Phase 8. Don't save error handling for Phase 9. Build haptic feedback into your Button component from day one. Add accessibility labels when you create the component, not when QA files a bug. The difference between a demo and a product is the accumulation of these small decisions.

---

## Appendix: Dependency Quick Reference

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~56.0.11 | Expo core SDK |
| `react-native` | 0.85.3 | React Native core |
| `expo-router` | ~56.2.10 | File-based routing |
| `expo-sqlite` | ~56.0.4 | SQLite database |
| `expo-audio` | Latest | Voice recording |
| `expo-haptics` | ~56.0.3 | Haptic feedback |
| `expo-font` | ~56.0.6 | Font loading |
| `expo-image` | ~56.0.11 | Optimized images |
| `expo-splash-screen` | ~56.0.10 | Splash screen |
| `expo-status-bar` | ~56.0.4 | Status bar |
| `expo-updates` | ~56.0.x | OTA updates |
| `react-native-gesture-handler` | ~2.31.1 | Gesture system |
| `react-native-reanimated` | 4.3.1 | Native animations |
| `react-native-safe-area-context` | ~5.7.0 | Safe area insets |
| `react-native-screens` | 4.25.2 | Native screen containers |
| `@expo-google-fonts/cairo` | Latest | Cairo font |
| `jest-expo` | ~56.0.4 | Jest preset for Expo |
| `@testing-library/react-native` | Latest | Component testing |
| `typescript` | ~6.0.3 | TypeScript compiler |

---

*This roadmap is a living document. As you build Masroof, you'll discover patterns, decisions, and trade-offs that aren't captured here. Document them. The mark of a senior developer is not knowing everything — it's knowing how to learn and adapt.*
