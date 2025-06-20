-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON profiles;
DROP POLICY IF EXISTS "Enable update for users to own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for agency users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for trip owners" ON trips;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON trips;
DROP POLICY IF EXISTS "Enable update for trip owners" ON trips;
DROP POLICY IF EXISTS "Enable delete for trip owners" ON trips;
DROP POLICY IF EXISTS "Enable read access for agency users on trips" ON trips;
DROP POLICY IF EXISTS "Enable read access for trip collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Enable insert for trip owners on collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Enable update for trip owners on collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Enable delete for trip owners on collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Enable all access for agency users on their notes" ON agency_notes;

-- Temporarily disable RLS to avoid conflicts
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Create a very simple policy for profiles that doesn't reference itself
CREATE POLICY "profiles_insert_policy" 
ON profiles FOR INSERT 
WITH CHECK (true);  -- Allow all inserts

CREATE POLICY "profiles_select_policy" 
ON profiles FOR SELECT 
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND auth.users.raw_user_meta_data->>'role' = 'agency'
));

CREATE POLICY "profiles_update_policy" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Simple trips policies
CREATE POLICY "trips_select_policy" 
ON trips FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND auth.users.raw_user_meta_data->>'role' = 'agency'
));

CREATE POLICY "trips_insert_policy" 
ON trips FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "trips_update_policy" 
ON trips FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "trips_delete_policy" 
ON trips FOR DELETE 
USING (user_id = auth.uid());

-- Simple trip_collaborators policies
CREATE POLICY "trip_collaborators_select_policy" 
ON trip_collaborators FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_id
  AND (trips.user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'agency'
  ))
));

CREATE POLICY "trip_collaborators_insert_policy" 
ON trip_collaborators FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "trip_collaborators_update_policy" 
ON trip_collaborators FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "trip_collaborators_delete_policy" 
ON trip_collaborators FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_id
  AND trips.user_id = auth.uid()
));

-- Simple agency_notes policies
CREATE POLICY "agency_notes_all_policy" 
ON agency_notes FOR ALL 
USING (agency_user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid()
  AND auth.users.raw_user_meta_data->>'role' = 'agency'
));
