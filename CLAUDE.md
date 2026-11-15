# Exam Quest: rules for working in this repo

A mobile study app (iOS + Android, Expo / React Native, TypeScript). Students scan pages, paste text
or pick a topic; AI turns it into lessons, quizzes, flashcards and a gamified plan that ends on
their exam date. Launch market: Finland (English UI first), then the EU. Users are 13+.

## Layout

```
apps/mobile/     Expo app. Routes in src/app/ (Expo Router). See apps/mobile/AGENTS.md for Expo rules.
packages/ui/     Design system: tokens, themes, components. The only place visual values live.
supabase/        Database migrations, row-level security, Edge Functions (EU region).
ai/              AI prompts (versioned), evaluation sets and reports.
```

## Commands

```bash
npm install          # from the repo root; workspaces are npm workspaces
npm run check        # format check + lint + typecheck + tests (what CI runs). Must pass before a PR.
npm run format       # prettier --write
cd apps/mobile && npx expo start
```

Add Expo/React Native packages with `npx expo install <pkg>` inside `apps/mobile` so versions match the
SDK. In sandboxes where Expo's API is unreachable, use `EXPO_OFFLINE=1 npx expo install <pkg>`.

## Non-negotiables

### No hard-coded values

- **Colours, spacing, sizes, radii, fonts, motion:** only from design tokens in `packages/ui`. Lint
  blocks colour literals, inline styles and numeric sizes in `StyleSheet.create` (0 and 1 allowed).
- **User-facing text:** only from translation files (`apps/mobile/src/i18n/locales/*.json`) via
  `t('…')`. Lint blocks string literals in JSX. Keys are typed; add keys to `en.json` first.
- **Country rules** (grade scales, exam periods, consent age, help lines): country packs, not code.
- **Limits, prices, feature flags:** one config module, ideally served by the backend.
- **Secrets:** server-side environment variables only. Never in the app bundle or the repo.
- **AI prompts:** versioned files in `ai/`, each with an evaluation set. Not inline strings in code.

### Design system first

- Build screens from `@exam-quest/ui` components. App code may not import `Pressable`, `Touchable*`,
  `Button` or `Image` from `react-native` (lint-enforced); add or extend a UI component instead.
- A new visual need means a new token or component variant, with a preview and tests.
- Themes: light, dark and calm mode share components and swap tokens.

### Accessibility: WCAG 2.2 AA, always

- Every interactive element has a role, label and state; UI components require labels in their types.
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and icons. Token pairs are tested in CI.
- Respect the system font scale up to 200%; layouts reflow, nothing truncates important text.
- Touch targets ≥ 44×44 pt (48 dp).
- Colour is never the only signal (pair it with an icon or text).
- Respect reduced motion; haptics can be turned off.
- Announce important changes (quiz result, XP, "quest ready") to screen readers.
- No mandatory time limits; every input has an alternative (scan, paste, type, voice).
- Tests query by role and accessible name (`getByRole('button', { name })`), not by test IDs.

### Code quality

- TypeScript strict (see `tsconfig.base.json`); no `any`; type-only imports use `import type`.
- Business logic lives in plain, tested modules (`features/*`, `services/*`), not in components.
- Validate every AI response against a schema before use; retry or fail gracefully.
- Supabase: schema changes are migrations; every table has row-level security.
- Tests: unit tests for logic, component tests for UI, a few end-to-end tests for the main flow.
  React Native Testing Library v14: `render` is async (`await render(...)`).

### Product rules (from research)

- Rewards are earned, never sold. No paid chests or currencies.
- No lives or hearts; mistakes go to review. Streaks are weekly with rest days.
- Calm mode can switch off every game layer.
- No notifications during school hours or quiet hours; at most one a day.
- Squads never see a student's pages, grades or mistakes.
- Label AI clearly (tutor and generated content).

## Workflow

- Small pull requests from a feature branch; never commit straight to `main`.
- Fill in the PR template checklist. `npm run check` must pass.
- Design reference: the Exam Quest design canvas (screens, flows, plan) shared by the founder.
