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
    insert into academy_lessons (path_id, slug, title, file_path, lesson_type, duration_minutes, allows_reflection, allows_audio, allows_video, order_index)
    values
      (pid, 'sitting-with-discomfort', 'Sitting With Discomfort', 'lessons/sitting-with-discomfort.md', 'sanctum', 10, true, true, true, 1),
      (pid, 'urge-surfing', 'Urge Surfing', 'lessons/urge-surfing.md', 'sanctum', 15, true, true, true, 2),
      (pid, 'body-grounding', 'Body Grounding', 'lessons/body-grounding.md', 'sanctum', 10, true, true, true, 3),
      (pid, 'emotional-naming', 'Emotional Naming', 'lessons/emotional-naming.md', 'sanctum', 15, true, true, true, 4)
    on conflict (path_id, slug) do update set
      title = excluded.title,
      file_path = excluded.file_path,
      lesson_type = excluded.lesson_type,
      duration_minutes = excluded.duration_minutes,
      allows_reflection = excluded.allows_reflection,
      allows_audio = excluded.allows_audio,
      allows_video = excluded.allows_video,
      order_index = excluded.order_index,
      updated_at = now();
  end if;
end $$;
