-- Fix profile duplicate issues and ensure proper user-profile relationship

-- 1. First, let's see what profiles exist for this user
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM profiles 
WHERE email = 'humayunejazm@gmail.com'
ORDER BY created_at;

-- 2. Check what the auth user ID is
SELECT 
  auth.uid() as current_auth_id,
  auth.email() as current_auth_email;

-- 3. Clean up duplicate profiles - keep the one that matches auth.uid() if it exists
DO $$
DECLARE
  auth_user_id uuid;
  matching_profile_id uuid;
  duplicate_count int;
BEGIN
  -- Get current auth user ID
  auth_user_id := auth.uid();
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE 'No authenticated user found';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Current auth user ID: %', auth_user_id;
  
  -- Count profiles for this email
  SELECT COUNT(*) INTO duplicate_count
  FROM profiles 
  WHERE email = 'humayunejazm@gmail.com';
  
  RAISE NOTICE 'Found % profiles for this email', duplicate_count;
  
  -- Check if there's a profile with matching ID
  SELECT id INTO matching_profile_id
  FROM profiles 
  WHERE id = auth_user_id AND email = 'humayunejazm@gmail.com';
  
  IF matching_profile_id IS NOT NULL THEN
    RAISE NOTICE 'Found matching profile with correct ID: %', matching_profile_id;
    
    -- Delete other profiles with same email but different ID
    DELETE FROM profiles 
    WHERE email = 'humayunejazm@gmail.com' AND id != auth_user_id;
    
    RAISE NOTICE 'Cleaned up duplicate profiles';
  ELSE
    RAISE NOTICE 'No profile found with matching auth ID';
    
    -- Delete all existing profiles for this email
    DELETE FROM profiles WHERE email = 'humayunejazm@gmail.com';
    
    -- Create new profile with correct ID
    INSERT INTO profiles (id, email, name, role, created_at, updated_at)
    VALUES (
      auth_user_id,
      'humayunejazm@gmail.com',
      'Humayun Ejaz',
      'traveler',
      now(),
      now()
    );
    
    RAISE NOTICE 'Created new profile with correct ID: %', auth_user_id;
  END IF;
  
END $$;

-- 4. Verify the fix
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  CASE WHEN id = auth.uid() THEN '✅ MATCHES AUTH' ELSE '❌ MISMATCH' END as auth_match
FROM profiles 
WHERE email = 'humayunejazm@gmail.com';

-- 5. Test trip creation now
DO $$
DECLARE
  test_trip_id uuid;
  auth_user_id uuid;
BEGIN
  auth_user_id := auth.uid();
  
  INSERT INTO trips (
    user_id,
    title,
    description,
    status,
    countries,
    cities
  ) VALUES (
    auth_user_id,
    'Test Trip After Fix',
    'Testing after profile fix',
    'planning',
    ARRAY['Test Country'],
    ARRAY['Test City']
  ) RETURNING id INTO test_trip_id;
  
  RAISE NOTICE 'SUCCESS: Test trip created with ID: %', test_trip_id;
  
  -- Clean up test trip
  DELETE FROM trips WHERE id = test_trip_id;
  RAISE NOTICE 'Test trip cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;
