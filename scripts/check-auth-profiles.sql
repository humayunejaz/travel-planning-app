-- First, let's check if the profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);

-- Let's see what's in the profiles table (if it exists)
SELECT * FROM profiles LIMIT 10;

-- Let's check the auth.users table to see what users exist
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Let's see which users don't have corresponding profiles
SELECT 
  au.id as auth_user_id, 
  au.email as auth_email, 
  au.email_confirmed_at,
  p.id as profile_id,
  p.email as profile_email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
