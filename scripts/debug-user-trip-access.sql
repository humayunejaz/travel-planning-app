-- Debug user and trip access issues
-- This will help us understand why getTripById is failing

-- 1. Check all profiles
SELECT 'PROFILES' as table_name, id, email, name, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- 2. Check all trips with their owners
SELECT 'TRIPS' as table_name, t.id, t.title, t.user_id, p.email as owner_email, t.created_at
FROM trips t
LEFT JOIN profiles p ON t.user_id = p.id
ORDER BY t.created_at DESC;

-- 3. Check all collaborators
SELECT 'COLLABORATORS' as table_name, tc.trip_id, tc.email, t.title as trip_title
FROM trip_collaborators tc
LEFT JOIN trips t ON tc.trip_id = t.id
ORDER BY tc.created_at DESC;

-- 4. Check for orphaned trips (trips without valid user profiles)
SELECT 'ORPHANED_TRIPS' as issue, t.id, t.title, t.user_id, 'No matching profile' as problem
FROM trips t
LEFT JOIN profiles p ON t.user_id = p.id
WHERE p.id IS NULL;

-- 5. Show current auth user (if available)
SELECT 'CURRENT_AUTH_USER' as info, auth.uid() as current_user_id;
