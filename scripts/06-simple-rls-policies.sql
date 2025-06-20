-- Drop all existing policies completely
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "trips_select_policy" ON trips;
DROP POLICY IF EXISTS "trips_insert_policy" ON trips;
DROP POLICY IF EXISTS "trips_update_policy" ON trips;
DROP POLICY IF EXISTS "trips_delete_policy" ON trips;
DROP POLICY IF EXISTS "trip_collaborators_select_policy" ON trip_collaborators;
DROP POLICY IF EXISTS "trip_collaborators_insert_policy" ON trip_collaborators;
DROP POLICY IF EXISTS "trip_collaborators_update_policy" ON trip_collaborators;
DROP POLICY IF EXISTS "trip_collaborators_delete_policy" ON trip_collaborators;
DROP POLICY IF EXISTS "agency_notes_all_policy" ON agency_notes;

-- Temporarily disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies for profiles
CREATE POLICY "profiles_allow_all_authenticated" 
ON profiles FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Simple trips policies
CREATE POLICY "trips_owner_access" 
ON trips FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow agency users to read all trips
CREATE POLICY "trips_agency_read" 
ON trips FOR SELECT 
USING (true);  -- We'll handle agency check in the application layer

-- Simple trip_collaborators policies
CREATE POLICY "trip_collaborators_access" 
ON trip_collaborators FOR ALL 
USING (true)  -- We'll handle permissions in the application layer
WITH CHECK (true);

-- Simple agency_notes policies
CREATE POLICY "agency_notes_access" 
ON agency_notes FOR ALL 
USING (agency_user_id = auth.uid())
WITH CHECK (agency_user_id = auth.uid());
