# Expo SDK 56

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Golden rule

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

## Before writing code

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ — SDK 56 changed the API surface significantly from earlier versions.

# Architecture

- File-based routing in `src/app/` — `index.tsx` (Home), `explore.tsx`, `_layout.tsx` (tab navigator)
- Tab navigation via `expo-router/unstable-native-tabs` (experimental native API)
- Platform-specific files use `.web.tsx` suffix (e.g. `animated-icon.web.tsx`, `app-tabs.web.tsx`, `use-color-scheme.web.tsx`)
- Path aliases: `@/` → `src/`, `@/assets/` → `assets/`
- Dark mode via `useColorScheme()` / `useTheme()` hook; theme constants in `src/constants/theme.ts`
- Global CSS at `src/global.css` (fonts only)
- React Compiler enabled (`experiments.reactCompiler: true`)
- Typed routes enabled (`experiments.typedRoutes: true`)

# Commands

| Action        | Command                 |
| ------------- | ----------------------- |
| Start dev     | `npm start`             |
| Android       | `npm run android`       |
| iOS           | `npm run ios`           |
| Web           | `npm run web`           |
| Lint          | `npm run lint`          |
| Reset project | `npm run reset-project` |

No test runner or typecheck script configured. TypeScript validation via `tsc` (strict mode) or editor.

# Caveats

- iOS/Android native builds require native project directories (`ios/`, `android/`) which are gitignored; generated via `npx expo prebuild` if needed
- `.expo/`, `dist/`, `web-build/`, `expo-env.d.ts` are gitignored build artifacts
- `.env*.local` files are gitignored; no `.env` loading is configured in this template
