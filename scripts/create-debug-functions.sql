-- Create helper functions for debugging

-- Function to check RLS policies
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_cmd TEXT,
  policy_roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::TEXT,
    p.policyname::TEXT,
    p.cmd::TEXT,
    p.roles
  FROM pg_policies p
  WHERE p.schemaname = 'public' 
    AND p.tablename IN ('trips', 'profiles', 'trip_collaborators');
END;
$$;

-- Function to get current user context
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS TABLE(
  auth_uid UUID,
  auth_role TEXT,
  session_user TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as auth_uid,
    auth.role()::TEXT as auth_role,
    session_user::TEXT as session_user;
END;
$$;

-- Function to test trip insertion with detailed logging
CREATE OR REPLACE FUNCTION test_trip_insert(
  p_user_id UUID,
  p_title TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  trip_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id UUID;
  v_profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RETURN QUERY SELECT FALSE, 'Profile does not exist for user: ' || p_user_id::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Try to insert trip
  BEGIN
    INSERT INTO trips (user_id, title, status, created_at, updated_at)
    VALUES (p_user_id, p_title, 'planning', NOW(), NOW())
    RETURNING id INTO v_trip_id;
    
    RETURN QUERY SELECT TRUE, 'Trip created successfully', v_trip_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, 'Insert failed: ' || SQLERRM, NULL::UUID;
  END;
END;
$$;
