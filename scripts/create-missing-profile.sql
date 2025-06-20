-- Create the missing profile for the authenticated user
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
VALUES (
  'e36048db-a619-4ac5-9b18-1d2e2df4b3b7'::uuid,
  'humayunejazm@gmail.com',
  'Humayun Ejaz',
  'traveler',
  now(),
  now()
);

-- Verify the profile was created
SELECT 
  id,
  email,
  name,
  role,
  '✅ PROFILE CREATED' as status
FROM profiles 
WHERE id = 'e36048db-a619-4ac5-9b18-1d2e2df4b3b7'::uuid;

-- Test that trip creation will now work
SELECT 'Testing trip creation constraint...' as test;
-- This should not error if the profile exists
SELECT EXISTS(
  SELECT 1 FROM profiles WHERE id = 'e36048db-a619-4ac5-9b18-1d2e2df4b3b7'::uuid
) as profile_exists_for_trip_creation;
