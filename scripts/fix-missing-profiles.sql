-- This script will create profiles for any authenticated users that don't have them
-- First, let's make sure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('traveler', 'agency')) DEFAULT 'traveler',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now let's insert profiles for users that don't have them
INSERT INTO profiles (id, email, name, role, created_at)
SELECT 
  au.id, 
  au.email, 
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)), 
  COALESCE(au.raw_user_meta_data->>'role', 'traveler')::text,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.email_confirmed_at IS NOT NULL;

-- Let's see the results
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
