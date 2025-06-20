-- Check all collaborations
SELECT 'All trip_collaborators:' as info;
SELECT * FROM trip_collaborators ORDER BY created_at DESC;

-- Check all profiles
SELECT 'All profiles:' as info;
SELECT id, email, name, role FROM profiles ORDER BY created_at DESC;

-- Check all trips
SELECT 'All trips:' as info;
SELECT id, title, user_id FROM trips ORDER BY created_at DESC;

-- Check for collaborations with profile matches
SELECT 'Collaborations with matching profiles:' as info;
SELECT 
    tc.id,
    tc.trip_id,
    tc.email,
    p.id as profile_id,
    p.name as profile_name,
    t.title as trip_title
FROM trip_collaborators tc
LEFT JOIN profiles p ON p.email = tc.email
LEFT JOIN trips t ON t.id = tc.trip_id
ORDER BY tc.created_at DESC;

-- Check RLS policies
SELECT 'Current RLS policies on trips:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'trips';

SELECT 'Current RLS policies on trip_collaborators:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'trip_collaborators';
