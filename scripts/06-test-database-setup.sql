-- Step 6: Test the database setup

-- Test 1: Check if tables exist
SELECT 'Checking tables...' as test;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'trips', 'trip_collaborators', 'trip_invitations', 'agency_notes')
ORDER BY table_name;

-- Test 2: Check if triggers exist
SELECT 'Checking triggers...' as test;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at', 'update_trips_updated_at', 'update_agency_notes_updated_at')
ORDER BY trigger_name;

-- Test 3: Check if RLS is enabled
SELECT 'Checking RLS...' as test;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'trips', 'trip_collaborators', 'trip_invitations', 'agency_notes')
ORDER BY tablename;

-- Test 4: Check if policies exist
SELECT 'Checking policies...' as test;
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 5: Test user creation and profile creation
DO $$
DECLARE
  test_user_id uuid := uuid_generate_v4();
BEGIN
  -- Create a test user
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    test_user_id,
    'test-' || test_user_id || '@example.com',
    '{"name": "Test User", "role": "traveler"}'
  );
  
  -- Check if profile was created automatically
  PERFORM id FROM profiles WHERE id = test_user_id;
  
  IF FOUND THEN
    RAISE NOTICE 'Profile was created automatically for test user!';
  ELSE
    RAISE NOTICE 'Profile was NOT created automatically for test user!';
  END IF;
  
  -- Clean up
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- Test 6: Test trip creation
DO $$
DECLARE
  test_user_id uuid;
  test_trip_id uuid;
BEGIN
  -- Get an existing user
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create a test trip
    INSERT INTO trips (user_id, title, description)
    VALUES (test_user_id, 'Test Trip', 'This is a test trip')
    RETURNING id INTO test_trip_id;
    
    -- Check if trip was created
    IF test_trip_id IS NOT NULL THEN
      RAISE NOTICE 'Trip created successfully!';
      
      -- Clean up
      DELETE FROM trips WHERE id = test_trip_id;
    ELSE
      RAISE NOTICE 'Failed to create trip!';
    END IF;
  ELSE
    RAISE NOTICE 'No users found to test trip creation!';
  END IF;
END $$;

SELECT 'Database setup tests completed successfully!' as status;
