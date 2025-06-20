-- Debug trip update issues
-- Run this to see what's happening with trip updates

-- 1. Check if trips exist
SELECT 'All trips in database:' as debug_info;
SELECT id, title, user_id, status, created_at, updated_at 
FROM trips 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check RLS policies on trips table
SELECT 'RLS policies on trips table:' as debug_info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'trips';

-- 3. Check current user context
SELECT 'Current user context:' as debug_info;
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user as postgres_user;

-- 4. Test if we can select trips as current user
SELECT 'Trips visible to current user:' as debug_info;
SELECT id, title, user_id, status 
FROM trips 
WHERE auth.uid() IS NOT NULL
LIMIT 5;

-- 5. Check if we can update a specific trip (replace with actual trip ID)
-- SELECT 'Testing update permissions:' as debug_info;
-- UPDATE trips 
-- SET title = title || ' (test)'
-- WHERE id = 'YOUR_TRIP_ID_HERE'
-- RETURNING id, title;
