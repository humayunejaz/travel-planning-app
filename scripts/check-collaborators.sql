-- Check trip_collaborators table structure and data

-- 1. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'trip_collaborators' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check all collaborators with trip details
SELECT 
  tc.id,
  tc.trip_id,
  tc.email,
  tc.created_at,
  t.title as trip_title,
  t.user_id as trip_owner,
  p.name as owner_name,
  p.email as owner_email
FROM trip_collaborators tc
LEFT JOIN trips t ON tc.trip_id = t.id
LEFT JOIN profiles p ON t.user_id = p.id
ORDER BY tc.created_at DESC;

-- 3. Count collaborators per trip
SELECT 
  t.id as trip_id,
  t.title,
  t.user_id,
  COUNT(tc.id) as collaborator_count
FROM trips t
LEFT JOIN trip_collaborators tc ON t.id = tc.trip_id
GROUP BY t.id, t.title, t.user_id
ORDER BY collaborator_count DESC;

-- 4. Check for any orphaned collaborators (collaborators without trips)
SELECT 
  tc.*
FROM trip_collaborators tc
LEFT JOIN trips t ON tc.trip_id = t.id
WHERE t.id IS NULL;

-- 5. Check RLS policies on trip_collaborators
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'trip_collaborators';

SELECT 'Collaborator table analysis complete!' as status;
