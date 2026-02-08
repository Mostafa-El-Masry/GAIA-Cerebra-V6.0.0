-- Seed Sanctum path and 4 lessons. Run after academy_sanctum_extension.

do $$
declare
  pid uuid;
begin
  insert into academy_paths (key, title, path_type)
  values ('sanctum', 'Sanctum', 'sanctum')
  on conflict (key) do update set
    title = excluded.title,
    path_type = excluded.path_type
  returning id into pid;

  if pid is null then
    select id into pid from academy_paths where key = 'sanctum' limit 1;
  end if;

  if pid is not null then
    delete from academy_lessons where path_id = pid and slug in (
      'sitting-with-discomfort', 'urge-surfing', 'body-grounding', 'emotional-naming'
    );
  end if;
end $$;
