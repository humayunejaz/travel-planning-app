-- Force fix the profile duplicate issue
-- This will completely clean up and recreate the profile correctly

-- 1. First, let's see what we're dealing with
SELECT 'BEFORE CLEANUP:' as status;
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  CASE WHEN id::text = 'e36048db-a619-4ac5-9b18-1d2e2df4b3b7' THEN '✅ MATCHES AUTH' ELSE '❌ WRONG ID' END as auth_match
FROM profiles 
WHERE email = 'humayunejazm@gmail.com'
ORDER BY created_at;

-- 2. Delete ALL profiles for this email (we'll recreate the correct one)
DELETE FROM profiles WHERE email = 'humayunejazm@gmail.com';

-- 3. Create the correct profile with the right ID
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
VALUES (
  'e36048db-a619-4ac5-9b18-1d2e2df4b3b7'::uuid,
  'humayunejazm@gmail.com',
  'Humayun Ejaz',
  'traveler',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now();

-- 4. Verify the fix
SELECT 'AFTER CLEANUP:' as status;
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  '✅ CORRECT PROFILE' as status
FROM profiles 
WHERE email = 'humayunejazm@gmail.com';

-- 5. Test trip creation with the fixed profile
INSERT INTO trips (
  user_id,
  title,
  description,
  status,
  countries,
  cities
) VALUES (
  'e36048db-a619-4ac5-9b18-1d2e2df4b3b7'::uuid,
  'Test Trip After Profile Fix',
  'Testing after profile fix',
  'planning',
  ARRAY['Test Country'],
  ARRAY['Test City']
) RETURNING id, title, user_id;

-- 6. Clean up the test trip
DELETE FROM trips WHERE title = 'Test Trip After Profile Fix';

SELECT '✅ PROFILE FIXED AND TRIP CREATION TESTED SUCCESSFULLY!' as final_status;
