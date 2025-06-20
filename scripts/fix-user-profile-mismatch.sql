-- Fix user/profile mismatch issues

-- First, let's see what we have
SELECT 'Current auth users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

SELECT 'Current profiles:' as info;
SELECT id, email, name, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Find auth users without profiles
SELECT 'Auth users missing profiles:' as info;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Find profiles without auth users (orphaned profiles)
SELECT 'Orphaned profiles:' as info;
SELECT p.id, p.email, p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- Create missing profiles for existing auth users
INSERT INTO profiles (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'traveler')
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show final state
SELECT 'Final check - Auth users with profiles:' as info;
SELECT 
  au.id, 
  au.email as auth_email, 
  p.email as profile_email,
  p.name,
  p.role
FROM auth.users au
JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
