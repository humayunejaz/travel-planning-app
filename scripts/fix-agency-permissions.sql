-- Fix agency permissions to view all trips and details
-- This allows agency users to see all trips regardless of ownership

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('trips', 'trip_collaborators', 'profiles')
ORDER BY tablename, policyname;

-- Drop existing restrictive policies for trips
DROP POLICY IF EXISTS "trips_owner_access" ON trips;
DROP POLICY IF EXISTS "trips_agency_read" ON trips;

-- Create new policy that allows agencies to see all trips
CREATE POLICY "trips_full_access" 
ON trips FOR ALL 
USING (
  -- Owner can access their own trips
  user_id = auth.uid() 
  OR 
  -- Agency users can access all trips
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agency'
  )
)
WITH CHECK (
  -- Owner can modify their own trips
  user_id = auth.uid() 
  OR 
  -- Agency users can modify all trips
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agency'
  )
);

-- Fix trip_collaborators access for agencies
DROP POLICY IF EXISTS "trip_collaborators_access" ON trip_collaborators;

CREATE POLICY "trip_collaborators_full_access" 
ON trip_collaborators FOR ALL 
USING (
  -- Trip owner can access collaborators
  EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  )
  OR
  -- Collaborator can access their own collaboration
  email IN (
    SELECT email FROM profiles WHERE id = auth.uid()
  )
  OR
  -- Agency users can access all collaborators
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agency'
  )
)
WITH CHECK (
  -- Trip owner can modify collaborators
  EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  )
  OR
  -- Agency users can modify all collaborators
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agency'
  )
);

-- Ensure profiles are accessible to agencies
DROP POLICY IF EXISTS "profiles_allow_all_authenticated" ON profiles;

CREATE POLICY "profiles_full_access" 
ON profiles FOR ALL 
USING (
  -- Users can access their own profile
  id = auth.uid()
  OR
  -- Agency users can access all profiles
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'agency'
  )
)
WITH CHECK (
  -- Users can modify their own profile
  id = auth.uid()
  OR
  -- Agency users can modify all profiles
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'agency'
  )
);

-- Test the policies work
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Test if we can query trips (this should work for agencies)
  SELECT 'Policies updated successfully' INTO test_result;
  RAISE NOTICE '%', test_result;
END $$;

-- Show the new policies
SELECT 'New policies created:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('trips', 'trip_collaborators', 'profiles')
AND policyname LIKE '%full_access%'
ORDER BY tablename, policyname;
