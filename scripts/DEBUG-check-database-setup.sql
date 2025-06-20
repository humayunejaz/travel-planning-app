-- Check if all tables exist and are properly configured
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'trips', 'trip_collaborators', 'agency_notes');

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'trips', 'trip_collaborators');

-- Check auth.users table
SELECT count(*) as user_count FROM auth.users;

-- Check profiles table
SELECT count(*) as profile_count FROM profiles;

-- Check trips table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trips' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test basic insert (this might fail due to RLS)
-- INSERT INTO trips (user_id, title, description, status) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Test Trip', 'Test Description', 'planning');
