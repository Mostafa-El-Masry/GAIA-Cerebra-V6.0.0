-- Remove Body Grounding, Emotional Naming, Sitting With Discomfort, Urge Surfing lessons.

delete from academy_lessons
where path_id in (select id from academy_paths where key = 'sanctum')
  and slug in (
    'body-grounding',
    'emotional-naming',
    'sitting-with-discomfort',
    'urge-surfing'
  );
