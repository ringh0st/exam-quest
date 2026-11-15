# Supabase

Backend for Quest Note, hosted in an EU region.

## Layout

| Path          | What it is                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| `migrations/` | Database schema, applied in filename order. Every table has row-level security. |
| `tests/`      | Migration and row-level security tests on real Postgres                         |
| `functions/`  | Edge Functions, including the AI pipeline (coming next)                         |

## Data rules

- Students can only see their own rows, in every table.
- Linked rows must belong to the same student (composite foreign keys), so nobody can attach
  material to someone else's exam.
- AI-generated lessons, quiz items, flashcards, XP and AI usage are written only by the server.
  Students can read them but not change them (no faked XP, no edited answers).
- Review history is append-only for students.
- Moderation events are never visible to students.
- Deleting an account deletes all of the student's data.

## Tests

```bash
npm test -w @exam-quest/supabase
```

Locally this starts a throwaway Postgres 16 cluster (`PG_BIN` overrides the binary path). In CI it
uses the Postgres service container through `DATABASE_URL`. `tests/bootstrap.sql` recreates the
parts of a Supabase project the migrations depend on (API roles, `auth.users`, `auth.uid()`, default
grants) and is for tests only.

## Deploying

Needs the Supabase project (EU region). With the Supabase CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Secrets (AI keys, service-role key) live only in the Supabase project's settings, never in this repo.
