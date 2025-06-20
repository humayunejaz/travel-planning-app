-- First, completely disable RLS on all tables
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
DROP POLICY IF EXISTS "Enable read access for all users" ON trips;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON trips;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON trips;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON trips;
DROP POLICY IF EXISTS "Allow all operations" ON trips;
DROP POLICY IF EXISTS "Allow all operations" ON trip_collaborators;
DROP POLICY IF EXISTS "Allow all operations" ON profiles;
DROP POLICY IF EXISTS "Allow all operations" ON invitations;

-- Show current trips
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;

-- Test direct insertion
INSERT INTO trips (title, description, user_id, status, start_date, end_date) 
VALUES ('SQL Test Trip', 'Created directly from SQL', 'test-user-id', 'planning', '2024-07-01', '2024-07-10')
RETURNING id, title, user_id;

-- Show trips after insertion
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;
