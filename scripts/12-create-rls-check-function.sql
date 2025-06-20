-- Create a function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policy_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity,
    COALESCE(p.policy_count, 0)
  FROM pg_tables t
  LEFT JOIN (
    SELECT 
      tablename,
      COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public' 
  AND t.tablename IN ('trips', 'trip_collaborators', 'profiles', 'invitations');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_rls_status() TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_status() TO anon;

-- Test the function
SELECT * FROM check_rls_status();

-- Also check what user the application is connecting as
SELECT current_user, session_user, current_setting('role');

-- Check if there are any trips in the database
SELECT 
  id,
  title,
  user_id,
  created_at,
  countries,
  cities
FROM trips 
ORDER BY created_at DESC 
LIMIT 10;

-- Show all RLS policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
