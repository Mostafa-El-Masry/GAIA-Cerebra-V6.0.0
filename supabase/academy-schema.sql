-- Academy schema (documentation only — not executed automatically)

-- PATHS TABLE
create table academy_paths (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  created_at timestamp with time zone default now()
);

-- Seed data:
insert into academy_paths (key, title) values
('self-healing', 'Self-Healing'),
('web-fundamentals', 'Web Fundamentals'),
('financial-literacy', 'Financial Literacy');

-- LESSONS TABLE
create table academy_lessons (
  id uuid primary key default gen_random_uuid(),

  path_id uuid not null references academy_paths(id) on delete cascade,

  slug text not null,
  title text not null,

  file_path text not null,

  completed boolean default false,
  first_opened_at timestamp with time zone,

  order_index integer default 0,

  estimated_minutes integer,
  tags text[],

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  unique(path_id, slug)
);
