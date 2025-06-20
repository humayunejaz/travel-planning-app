-- Check if the user creation trigger is working properly

-- First, check if the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
  routine_name, 
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Test the trigger with a new user
DO $$
DECLARE
  test_user_id uuid := uuid_generate_v4();
  profile_exists boolean;
BEGIN
  -- Create a test user
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    test_user_id,
    'test-' || test_user_id || '@example.com',
    '{"name": "Test User", "role": "traveler"}'
  );
  
  -- Check if profile was created automatically
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE 'SUCCESS: Profile was created automatically for test user!';
  ELSE
    RAISE NOTICE 'FAILURE: Profile was NOT created automatically for test user!';
  END IF;
  
  -- Clean up
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;
