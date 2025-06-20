-- Create profiles for users that don't have them

-- First, identify users without profiles
WITH users_without_profiles AS (
  SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    COALESCE(au.raw_user_meta_data->>'role', 'traveler') as role
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.id IS NULL
)

-- Insert profiles for these users
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  name, 
  role::text::profile_role, 
  NOW(), 
  NOW()
FROM users_without_profiles
RETURNING id, email, name, role;

-- Verify all users now have profiles
SELECT COUNT(*) as still_missing
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
