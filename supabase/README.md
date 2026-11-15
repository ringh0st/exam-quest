# Supabase

Backend for Exam Quest, hosted in an EU region. Will contain:

- `migrations/`: database schema, with row-level security on every table
- `functions/`: Edge Functions, including the AI pipeline (read → write → check)

Secrets (AI keys, service keys) live only in the Supabase project's environment, never in this repo.
