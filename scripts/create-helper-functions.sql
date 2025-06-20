-- Create helper functions to safely interact with profiles table without triggering RLS recursion

-- Function to check if a profile exists
CREATE OR REPLACE FUNCTION check_profile_exists(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE id = user_id;
  RETURN profile_count > 0;
END;
$$;

-- Function to create a profile safely
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_name,
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Function to get a user profile safely
CREATE OR REPLACE FUNCTION get_user_profile_safely(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.name, p.role, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.id = user_id;
END;
$$;

SELECT 'Helper functions created successfully' as result;
