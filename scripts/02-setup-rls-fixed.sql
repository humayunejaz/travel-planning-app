-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Agency users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can create own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
DROP POLICY IF EXISTS "Agency users can view all trips" ON trips;
DROP POLICY IF EXISTS "Users can view collaborators of own trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can manage collaborators of own trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Agency users can view all collaborators" ON trip_collaborators;
DROP POLICY IF EXISTS "Agency users can manage their notes" ON agency_notes;

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Simple profiles policies (no circular references)
CREATE POLICY "Enable read access for users to own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Agency users can view all profiles (simple check)
CREATE POLICY "Enable read access for agency users" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'agency' AND id = auth.uid()
    )
  );

-- Trips policies (reference auth.uid() directly, not profiles)
CREATE POLICY "Enable read access for trip owners" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for trip owners" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for trip owners" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Agency users can view all trips
CREATE POLICY "Enable read access for agency users on trips" ON trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'agency'
    )
  );

-- Trip collaborators policies
CREATE POLICY "Enable read access for trip collaborators" ON trip_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for trip owners on collaborators" ON trip_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for trip owners on collaborators" ON trip_collaborators
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for trip owners on collaborators" ON trip_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Agency notes policies
CREATE POLICY "Enable all access for agency users on their notes" ON agency_notes
  FOR ALL USING (
    auth.uid() = agency_user_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'agency'
    )
  );
