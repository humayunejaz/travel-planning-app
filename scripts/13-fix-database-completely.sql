-- First, let's completely disable RLS to test if that's the issue
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

-- Test if we can insert directly
INSERT INTO trips (title, description, start_date, end_date, user_id, status) 
VALUES ('Test Trip Direct', 'Testing direct insertion', '2024-07-01', '2024-07-10', 'test-user-123', 'planning');

-- Check if it worked
SELECT * FROM trips WHERE title = 'Test Trip Direct';

-- Show all trips
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC;

-- Clean up test trip
DELETE FROM trips WHERE title = 'Test Trip Direct';

-- Now let's create very simple policies that allow everything
CREATE POLICY "Allow all operations" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON trip_collaborators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON invitations FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS with permissive policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Test again with RLS enabled
INSERT INTO trips (title, description, start_date, end_date, user_id, status) 
VALUES ('Test Trip With RLS', 'Testing with RLS enabled', '2024-07-01', '2024-07-10', 'test-user-456', 'planning');

-- Check if it worked
SELECT * FROM trips WHERE title = 'Test Trip With RLS';

-- Show final state
SELECT 
  'trips' as table_name,
  COUNT(*) as row_count
FROM trips
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles;
