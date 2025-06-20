-- Debug trip creation and saving issues
-- This will help us understand what's happening with database saves

-- 1. Check if we can connect to the database
SELECT 'Database connection working' as status;

-- 2. Check current user and profile
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 3. Check if profiles table has data
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check if trips table exists and has proper structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trips'
ORDER BY ordinal_position;

-- 5. Check recent trips
SELECT 
  id,
  user_id,
  title,
  status,
  created_at
FROM trips 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check RLS policies on trips table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'trips';

-- 7. Test if we can insert a simple trip
DO $$
DECLARE
  test_user_id uuid;
  test_trip_id uuid;
BEGIN
  -- Get current user ID
  test_user_id := auth.uid();
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No authenticated user found';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing trip creation for user: %', test_user_id;
  
  -- Try to insert a test trip
  INSERT INTO trips (
    user_id,
    title,
    description,
    status
  ) VALUES (
    test_user_id,
    'Test Trip - ' || now(),
    'Database connection test',
    'planning'
  ) RETURNING id INTO test_trip_id;
  
  RAISE NOTICE 'Test trip created successfully with ID: %', test_trip_id;
  
  -- Clean up the test trip
  DELETE FROM trips WHERE id = test_trip_id;
  RAISE NOTICE 'Test trip cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating test trip: %', SQLERRM;
END $$;
