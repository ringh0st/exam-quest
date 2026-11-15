# @exam-quest/ai

The AI pipeline that turns a student's pages into a verified study quest. Plain TypeScript, so
the same code runs in Node (tests, evaluation) and in Supabase Edge Functions.

## Steps

1. **Read** (`readPages`): photos → text per page, with unsure words and unreadable lines
   flagged, and a check that the photos are study material at all.
2. The student checks and fixes the text in the app ("Check what I read").
3. **Write** (`writeQuest`): levels with lesson cards, quiz questions and flashcards, each citing
   the page and a quote it comes from.
4. **Check** (`checkQuest` + `applyCheck`): every quiz answer is checked against the pages; wrong
   answers are corrected or the question is removed. Nothing unchecked reaches a student.

Every step uses structured outputs (Zod schemas in `src/schemas.ts`, validated again after
parsing), caches its system prompt, opts into the server-side refusal fallback, and returns token
usage and cost so `ai_usage` can track cost per student.

## Prompts

Prompts live in `src/prompts/`, one file per step, each with a version string that is stored with
every result. Change a prompt → bump its version → run the evaluation.

## Models

`src/config.ts` sets the model and effort per step. Every step defaults to Claude Opus 5.5. Moving
a step to a cheaper model (Sonnet 5.5, Haiku 5.5) is a cost decision: make it with evaluation
results, not by guessing.

## Evaluation

```bash
npm run eval -w @exam-quest/ai
```

Put each test case in `eval/cases/<name>/`: page photos (`page-1.jpg`, `page-2.jpg`, …) and
`expected.txt` with the correct transcription. Cases are student material and are never
committed. The run prints word accuracy and cost per page and writes a JSON report to
`eval/reports/`. It calls the Claude API and costs money; it needs `ANTHROPIC_API_KEY` or an
`ant auth login` profile.

Goal for launch: at least 95% word accuracy on real Finnish pages and handwriting.
