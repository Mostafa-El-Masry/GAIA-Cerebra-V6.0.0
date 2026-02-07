-- Academy/Sanctum extension: path_type, lesson_type, lesson_sessions, lesson_reflections.
-- Does NOT remove or rename any existing tables or columns.

-- Enum types
do $$ begin
  create type academy_path_type as enum ('academy', 'sanctum');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type academy_lesson_type as enum ('learning', 'sanctum');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type lesson_reflection_type as enum ('text', 'voice', 'video');
exception
  when duplicate_object then null;
end $$;

-- paths: add path_type
alter table academy_paths
  add column if not exists path_type academy_path_type not null default 'academy';

-- lessons: add new columns (keep all existing columns unchanged)
alter table academy_lessons
  add column if not exists lesson_type academy_lesson_type not null default 'learning',
  add column if not exists duration_minutes integer not null default 15,
  add column if not exists allows_reflection boolean not null default false,
  add column if not exists allows_audio boolean not null default false,
  add column if not exists allows_video boolean not null default false;

-- Backfill duration_minutes from required_minutes where it exists (lesson_gate migration)
do $$ begin
  update academy_lessons
  set duration_minutes = required_minutes
  where required_minutes is not null and required_minutes <> duration_minutes;
exception when undefined_column then null;
end $$;

-- lesson_sessions
create table if not exists lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  lesson_id uuid not null references academy_lessons(id) on delete cascade,
  started_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone,
  duration_completed integer not null default 0,
  completed boolean not null default false
);

create index if not exists lesson_sessions_lesson_id_idx on lesson_sessions(lesson_id);
create index if not exists lesson_sessions_user_id_idx on lesson_sessions(user_id);

-- lesson_reflections
create table if not exists lesson_reflections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references academy_lessons(id) on delete cascade,
  user_id uuid,
  type lesson_reflection_type not null,
  content text,
  local_path text,
  created_at timestamp with time zone not null default now()
);

create index if not exists lesson_reflections_lesson_id_idx on lesson_reflections(lesson_id);
create index if not exists lesson_reflections_user_id_idx on lesson_reflections(user_id);
