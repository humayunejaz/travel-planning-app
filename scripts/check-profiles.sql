-- Check if profiles exist for all users

-- First, check all users in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Then, check all profiles
SELECT id, email, name, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Find users without profiles
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- Count of users without profiles
SELECT COUNT(*) as missing_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
