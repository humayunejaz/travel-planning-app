-- Enable RLS on trips table if not already enabled
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view trips they collaborate on" ON trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update trips they collaborate on" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;

-- Policy for viewing trips (owned or collaborated)
CREATE POLICY "Users can view their own trips" ON trips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view trips they collaborate on" ON trips
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trip_collaborators tc
            JOIN profiles p ON p.email = tc.email
            WHERE tc.trip_id = trips.id AND p.id = auth.uid()
        )
    );

-- Policy for inserting trips (only own trips)
CREATE POLICY "Users can insert their own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating trips (owned or collaborated)
CREATE POLICY "Users can update their own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update trips they collaborate on" ON trips
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM trip_collaborators tc
            JOIN profiles p ON p.email = tc.email
            WHERE tc.trip_id = trips.id AND p.id = auth.uid()
        )
    );

-- Policy for deleting trips (only owners)
CREATE POLICY "Users can delete their own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for trip_collaborators table
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view collaborators for their trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can view collaborators for trips they collaborate on" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can insert collaborators for their trips" ON trip_collaborators;
DROP POLICY IF EXISTS "Users can delete collaborators for their trips" ON trip_collaborators;

CREATE POLICY "Users can view collaborators for their trips" ON trip_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trips t
            WHERE t.id = trip_collaborators.trip_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view collaborators for trips they collaborate on" ON trip_collaborators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.email = trip_collaborators.email AND p.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert collaborators for their trips" ON trip_collaborators
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips t
            WHERE t.id = trip_collaborators.trip_id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete collaborators for their trips" ON trip_collaborators
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM trips t
            WHERE t.id = trip_collaborators.trip_id AND t.user_id = auth.uid()
        )
    );

-- Test the setup
SELECT 'Collaborator permissions setup complete!' as status;
