-- Step 3: Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Create helper function for checking if a user is an agency user
CREATE OR REPLACE FUNCTION public.is_agency_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'agency'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Agency users can view all profiles" ON profiles
  FOR SELECT USING (is_agency_user());

-- Trips policies
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Agency users can view all trips" ON trips
  FOR SELECT USING (is_agency_user());

-- Trip collaborators policies
CREATE POLICY "Users can view collaborators of own trips" ON trip_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage collaborators of own trips" ON trip_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Agency users can view all collaborators" ON trip_collaborators
  FOR SELECT USING (is_agency_user());

-- Trip invitations policies
CREATE POLICY "Users can view invitations of own trips" ON trip_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage invitations of own trips" ON trip_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Agency users can view all invitations" ON trip_invitations
  FOR SELECT USING (is_agency_user());

-- Agency notes policies
CREATE POLICY "Agency users can manage their notes" ON agency_notes
  FOR ALL USING (
    auth.uid() = agency_user_id AND is_agency_user()
  );
