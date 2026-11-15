# Quest Note

A mobile study app (iOS + Android) that turns a student's own pages, notes or a chosen topic into
short lessons, quizzes, flashcards and a study plan that ends on their exam date.

Internal code name: `exam-quest` (repo and package names). Launch market: Finland (English UI first), then the EU.

## Getting started

Requirements: Node 22 (see `.nvmrc`) and npm.

```bash
npm install
npm run check                 # format, lint, typecheck, tests
cd apps/mobile && npx expo start
```

Scan the QR code with Expo Go on your phone to open the app. Features that need native code
(document scanner, push notifications) will require a development build later.

## Repository layout

| Path          | What it is                                                    |
| ------------- | ------------------------------------------------------------- |
| `apps/mobile` | Expo app (Expo Router, TypeScript)                            |
| `packages/ui` | Design system: tokens, themes and accessible components       |
| `supabase`    | Database, row-level security and server functions (EU region) |
| `ai`          | AI prompts, evaluation sets and reports                       |

Working rules (no hard-coded values, design system first, WCAG 2.2 AA) are in [CLAUDE.md](CLAUDE.md).
