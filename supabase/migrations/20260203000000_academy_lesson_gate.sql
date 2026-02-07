-- Lesson Gate: timer + quiz + irreversible completion
-- Run this after the base academy schema (academy_paths, academy_lessons) exists.

-- Extend academy_lessons
alter table academy_lessons
  add column if not exists video_url text,
  add column if not exists required_minutes integer not null default 15,
  add column if not exists completed_at timestamp with time zone;

-- Quizzes: exactly 10 questions per lesson, 4 options, correct_answer must match one of options
create table if not exists academy_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references academy_lessons(id) on delete cascade,
  question text not null,
  options text[] not null check (array_length(options, 1) = 4),
  correct_answer text not null,
  created_at timestamp with time zone default now()
);

create index if not exists academy_quizzes_lesson_id_idx on academy_quizzes(lesson_id);

comment on table academy_quizzes is 'Exactly 10 rows per lesson. correct_answer must equal one of options. Options shuffled in UI.';
