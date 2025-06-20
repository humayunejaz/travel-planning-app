-- First, let's see what users exist and their confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Confirm ALL existing users (including any agency users)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create or update profiles for all confirmed users
INSERT INTO profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  CASE 
    WHEN email ILIKE '%agency%' THEN 'agency'
    ELSE COALESCE(raw_user_meta_data->>'role', 'traveler')
  END as role
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  role = CASE 
    WHEN EXCLUDED.email ILIKE '%agency%' THEN 'agency'
    ELSE COALESCE(EXCLUDED.role, profiles.role)
  END;

-- Show final results
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
