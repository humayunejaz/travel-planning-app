-- Step 3: Setup Row Level Security
-- Run this in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips policies
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own trips" ON trips;
CREATE POLICY "Users can create own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trips" ON trips;
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Trip collaborators policies
DROP POLICY IF EXISTS "Users can view collaborators of own trips" ON trip_collaborators;
CREATE POLICY "Users can view collaborators of own trips" ON trip_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_collaborators.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage collaborators of own trips" ON trip_collaborators;
CREATE POLICY "Users can manage collaborators of own trips" ON trip_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_collaborators.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Trip invitations policies
DROP POLICY IF EXISTS "Users can view invitations for own trips" ON trip_invitations;
CREATE POLICY "Users can view invitations for own trips" ON trip_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_invitations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage invitations for own trips" ON trip_invitations;
CREATE POLICY "Users can manage invitations for own trips" ON trip_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_invitations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Agency notes policies (only for agency users)
DROP POLICY IF EXISTS "Agency users can view all agency notes" ON agency_notes;
CREATE POLICY "Agency users can view all agency notes" ON agency_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'agency'
    )
  );

DROP POLICY IF EXISTS "Agency users can manage own notes" ON agency_notes;
CREATE POLICY "Agency users can manage own notes" ON agency_notes
  FOR ALL USING (auth.uid() = agency_user_id);

SELECT 'RLS policies created successfully!' as status;
