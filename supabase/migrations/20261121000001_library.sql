-- Quest Note: the library. Everything a student adds is organised as
--   subject (course) → unit (chapter, lecture, week, topic …) → sources (materials)
-- Material without a subject sits in the student's inbox until it is sorted.
-- Exams link to a subject and, optionally, to the units they cover.
--
-- Same rules as the initial schema: row-level security on every table, rows only ever link to the
-- same student's rows (composite foreign keys), and deleting the account deletes everything.

-- ---------------------------------------------------------------------------------------------
-- Subjects
-- ---------------------------------------------------------------------------------------------

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  -- What the student calls the parts of this subject; only changes the wording in the app.
  unit_label text not null default 'unit' check (
    unit_label in ('unit', 'chapter', 'lecture', 'week', 'topic', 'module')
  ),
  -- How lessons are pitched for this subject. The student can change it at any time.
  level text not null default 'standard' check (level in ('foundation', 'standard', 'advanced')),
  -- Colour theme key from the design system (never a raw colour).
  tint text not null default 'violet' check (tint in ('violet', 'coral', 'mint', 'amber')),
  -- Optional link to a subject in the country pack (e.g. 'biology'), used for exam rules.
  catalog_subject text check (catalog_subject ~ '^[a-zA-Z]{1,40}$'),
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index subjects_user on public.subjects (user_id, position);
create trigger subjects_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();

alter table public.subjects enable row level security;

create policy "Students read their own subjects" on public.subjects
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add their own subjects" on public.subjects
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students change their own subjects" on public.subjects
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Students delete their own subjects" on public.subjects
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Units
-- ---------------------------------------------------------------------------------------------

create table public.units (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- Lets other tables require that a unit belongs to the subject they name.
  unique (id, subject_id, user_id),
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete cascade
);

create index units_subject on public.units (subject_id, position);
create trigger units_updated_at before update on public.units
  for each row execute function public.set_updated_at();

alter table public.units enable row level security;

create policy "Students read their own units" on public.units
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add their own units" on public.units
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students change their own units" on public.units
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Students delete their own units" on public.units
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Sources: where they sit in the library, and the new kinds of material
-- ---------------------------------------------------------------------------------------------

alter table public.sources
  add column subject_id uuid,
  add column unit_id uuid,
  add constraint sources_subject_fk foreign key (subject_id, user_id)
    references public.subjects (id, user_id) on delete set null (subject_id),
  add constraint sources_unit_fk foreign key (unit_id, subject_id, user_id)
    references public.units (id, subject_id, user_id) on delete set null (unit_id);

alter table public.sources drop constraint sources_kind_check;
alter table public.sources add constraint sources_kind_check check (
  kind in ('scan', 'upload', 'recording', 'paste', 'topic')
);

create index sources_library on public.sources (user_id, subject_id, unit_id);

-- Material without a subject is in the inbox, so it can't keep a unit either. Clearing the unit
-- here (rather than rejecting) also keeps deleting a subject simple: its material returns to the
-- inbox whatever order Postgres applies the foreign key actions in.
create or replace function public.sources_clear_unit_without_subject()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.subject_id is null then
    new.unit_id = null;
  end if;
  return new;
end;
$$;

create trigger sources_unit_follows_subject before insert or update on public.sources
  for each row execute function public.sources_clear_unit_without_subject();

-- Students may move their material around the library and rename it, nothing else. Status and
-- kind stay server-controlled, so the column grants allow only these fields.
revoke update on public.sources from authenticated;
grant update (title, subject_id, unit_id, exam_id) on public.sources to authenticated;
create policy "Students sort and rename their own sources" on public.sources
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Exams: which subject, and which units the exam covers
-- ---------------------------------------------------------------------------------------------

alter table public.exams
  add column library_subject_id uuid,
  add constraint exams_library_subject_fk foreign key (library_subject_id, user_id)
    references public.subjects (id, user_id) on delete set null (library_subject_id);

create table public.exam_units (
  exam_id uuid not null,
  unit_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (exam_id, unit_id),
  foreign key (exam_id, user_id) references public.exams (id, user_id) on delete cascade,
  foreign key (unit_id, user_id) references public.units (id, user_id) on delete cascade
);

alter table public.exam_units enable row level security;

create policy "Students read their own exam units" on public.exam_units
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Students add units to their own exams" on public.exam_units
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Students remove units from their own exams" on public.exam_units
  for delete to authenticated using (user_id = (select auth.uid()));
