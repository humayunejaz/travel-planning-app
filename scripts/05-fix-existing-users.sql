-- Step 5: Fix existing users (create profiles for users that don't have them)

-- Find users without profiles
WITH users_without_profiles AS (
  SELECT u.id, u.email, u.raw_user_meta_data
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
)
SELECT 'Users without profiles:' as info, COUNT(*) as count FROM users_without_profiles;

-- Create profiles for users that don't have them
INSERT INTO profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.email),
  COALESCE(u.raw_user_meta_data->>'role', 'traveler')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Check if all users now have profiles
WITH users_without_profiles AS (
  SELECT u.id, u.email
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
)
SELECT 'Users still without profiles:' as info, COUNT(*) as count FROM users_without_profiles;

-- Show all users and their profiles
SELECT 'All users and their profiles:' as info;
SELECT 
  u.email as auth_email,
  p.email as profile_email,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

SELECT 'Existing users fixed successfully!' as status;
