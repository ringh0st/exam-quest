-- Exam Quest: initial schema.
--
-- Rules (see CLAUDE.md):
-- * Every table has row-level security. Students can only ever see their own rows.
-- * Rows that link to another table must belong to the same student (composite foreign keys).
-- * AI-generated content, XP and usage are written only by the server (service role); students
--   can read them but not change them, so lessons can't be tampered with and XP can't be faked.
-- * Deleting an account deletes everything (on delete cascade from auth.users).

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 40),
  country text not null default 'FI' check (country ~ '^[A-Z]{2}$'),
  school_type text check (school_type in ('lowerSecondary', 'upperSecondary', 'vocational')),
  school_year smallint check (school_year between 1 and 10),
  -- When the student confirmed the age requirement and accepted the terms.
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Students read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Students update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Exams
-- ---------------------------------------------------------------------------------------------

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_kind text not null check (subject_kind in ('known', 'custom')),
  subject_id text check (subject_id ~ '^[a-zA-Z]{1,40}$'),
  custom_subject text,
  topic text check (char_length(topic) <= 120),
  exam_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint exams_subject_shape check (
    (subject_kind = 'known' and subject_id is not null and custom_subject is null)
    or (
      subject_kind = 'custom'
      and subject_id is null
      and char_length(btrim(custom_subject)) between 1 and 60
    )
  )
);

create index exams_user_date on public.exams (user_id, exam_date);
create trigger exams_updated_at before update on public.exams
  for each row execute function public.set_updated_at();

alter table public.exams enable row level security;

create policy "Students read their own exams" on public.exams
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add their own exams" on public.exams
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students change their own exams" on public.exams
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Students delete their own exams" on public.exams
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Study material: sources (one scan, paste or topic) and their pages
-- ---------------------------------------------------------------------------------------------

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id uuid,
  kind text not null check (kind in ('scan', 'paste', 'topic')),
  title text check (char_length(title) <= 120),
  -- Language of the material (BCP 47), detected when reading.
  language text check (language ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  status text not null default 'uploaded' check (
    status in ('uploaded', 'reading', 'needs_review', 'building', 'ready', 'failed', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- A source can only be linked to the same student's exam.
  foreign key (exam_id, user_id) references public.exams (id, user_id) on delete set null (exam_id)
);

create index sources_user on public.sources (user_id, created_at desc);
create trigger sources_updated_at before update on public.sources
  for each row execute function public.set_updated_at();

alter table public.sources enable row level security;

create policy "Students read their own sources" on public.sources
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add their own sources" on public.sources
  for insert to authenticated with check (user_id = (select auth.uid()) and status = 'uploaded');
create policy "Students delete their own sources" on public.sources
  for delete to authenticated using (user_id = (select auth.uid()));
-- Status changes come from the server pipeline only (no update policy for students).

create table public.source_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_id uuid not null,
  page_number smallint not null check (page_number between 1 and 50),
  -- Path of the uploaded photo; cleared when the photo is deleted after reading.
  storage_path text,
  -- Text read from the page (or pasted), editable by the student ("fix a word").
  text_content text check (char_length(text_content) <= 50000),
  -- Words the reader was unsure about: [{ "start": n, "end": n, "suggestions": [...] }]
  uncertain_spans jsonb not null default '[]'::jsonb check (jsonb_typeof(uncertain_spans) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, page_number),
  foreign key (source_id, user_id) references public.sources (id, user_id) on delete cascade
);

create trigger source_pages_updated_at before update on public.source_pages
  for each row execute function public.set_updated_at();

alter table public.source_pages enable row level security;

create policy "Students read their own pages" on public.source_pages
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add pages to their own sources" on public.source_pages
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students fix the text of their own pages" on public.source_pages
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Students delete their own pages" on public.source_pages
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- AI-generated learning content (written by the server, read by the student)
-- ---------------------------------------------------------------------------------------------

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid not null,
  level_index smallint not null check (level_index between 0 and 49),
  title text not null check (char_length(title) <= 120),
  -- Lesson cards with citations to source pages; validated by the server before saving.
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (source_id, level_index),
  foreign key (source_id, user_id) references public.sources (id, user_id) on delete cascade
);

create table public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null,
  position smallint not null check (position between 0 and 99),
  question text not null check (char_length(question) <= 500),
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 6),
  answer_index smallint not null check (answer_index between 0 and 5),
  explanation text check (char_length(explanation) <= 1000),
  -- Where the answer comes from in the source, for "From your page 2".
  source_span jsonb,
  -- Second-pass check against the source passed.
  verified boolean not null default false,
  unique (lesson_id, position),
  check (answer_index < jsonb_array_length(choices)),
  foreign key (lesson_id, user_id) references public.lessons (id, user_id) on delete cascade
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid not null,
  front text not null check (char_length(front) <= 300),
  back text not null check (char_length(back) <= 1000),
  source_span jsonb,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (source_id, user_id) references public.sources (id, user_id) on delete cascade
);

alter table public.lessons enable row level security;
alter table public.quiz_items enable row level security;
alter table public.flashcards enable row level security;

create policy "Students read their own lessons" on public.lessons
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students read their own quiz items" on public.quiz_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students read their own flashcards" on public.flashcards
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Spaced repetition (the app runs FSRS on the device and syncs state and review history)
-- ---------------------------------------------------------------------------------------------

create table public.card_states (
  flashcard_id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  due timestamptz not null,
  stability real not null check (stability >= 0),
  difficulty real not null check (difficulty between 0 and 10),
  elapsed_days integer not null default 0 check (elapsed_days >= 0),
  scheduled_days integer not null default 0 check (scheduled_days >= 0),
  reps integer not null default 0 check (reps >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  -- FSRS state: 0 new, 1 learning, 2 review, 3 relearning
  state smallint not null default 0 check (state between 0 and 3),
  last_review timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (flashcard_id, user_id) references public.flashcards (id, user_id) on delete cascade
);

create index card_states_due on public.card_states (user_id, due);
create trigger card_states_updated_at before update on public.card_states
  for each row execute function public.set_updated_at();

create table public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  flashcard_id uuid not null,
  -- FSRS rating: 1 again, 2 hard, 3 good, 4 easy
  rating smallint not null check (rating between 1 and 4),
  state smallint not null check (state between 0 and 3),
  elapsed_days integer not null check (elapsed_days >= 0),
  scheduled_days integer not null check (scheduled_days >= 0),
  reviewed_at timestamptz not null default now(),
  foreign key (flashcard_id, user_id) references public.flashcards (id, user_id) on delete cascade
);

create index review_logs_user on public.review_logs (user_id, reviewed_at desc);

alter table public.card_states enable row level security;
alter table public.review_logs enable row level security;

create policy "Students read their own card states" on public.card_states
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add their own card states" on public.card_states
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students update their own card states" on public.card_states
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Students read their own reviews" on public.review_logs
  for select to authenticated using (user_id = (select auth.uid()));
-- Review history is append-only for students.
create policy "Students log their own reviews" on public.review_logs
  for insert to authenticated with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- XP (earned only: written by the server when it verifies the work), AI usage, moderation
-- ---------------------------------------------------------------------------------------------

create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount between 1 and 500),
  reason text not null check (
    reason in (
      'level_complete',
      'quiz_correct',
      'word_fixed',
      'boss_defeated',
      'weekly_goal',
      'exam_reflection'
    )
  ),
  created_at timestamptz not null default now()
);

create index xp_events_user on public.xp_events (user_id, created_at desc);

create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  step text not null check (step in ('read', 'write', 'check', 'moderate', 'tutor')),
  model text not null,
  input_tokens integer not null check (input_tokens >= 0),
  output_tokens integer not null check (output_tokens >= 0),
  -- Cost in millionths of a US dollar, for cost-per-student tracking.
  cost_usd_micros bigint not null check (cost_usd_micros >= 0),
  created_at timestamptz not null default now()
);

create index ai_usage_user on public.ai_usage (user_id, created_at desc);

create table public.moderation_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_id uuid references public.sources (id) on delete set null,
  category text not null,
  action text not null check (action in ('allowed', 'blocked', 'escalated')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.xp_events enable row level security;
alter table public.ai_usage enable row level security;
alter table public.moderation_events enable row level security;

create policy "Students read their own XP" on public.xp_events
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students read their own AI usage" on public.ai_usage
  for select to authenticated using (user_id = (select auth.uid()));
-- moderation_events: no student access at all (server and reviewers only).
