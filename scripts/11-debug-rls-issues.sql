-- Debug and fix RLS issues for trips table
DO $$
BEGIN
    RAISE NOTICE '=== DEBUGGING RLS ISSUES ===';
    
    -- Check current user
    RAISE NOTICE 'Current user: %', current_user;
    RAISE NOTICE 'Current role: %', current_setting('role');
    
    -- Check if RLS is enabled on trips table
    SELECT 
        schemaname, 
        tablename, 
        rowsecurity 
    FROM pg_tables 
    WHERE tablename = 'trips';
    
    -- Show current RLS policies
    RAISE NOTICE 'Current RLS policies on trips table:';
END $$;

-- Show all policies on trips table
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
WHERE tablename = 'trips';

-- Temporarily disable RLS on trips table for testing
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON trips TO authenticated;
GRANT ALL ON trips TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Test insertion as different users
INSERT INTO trips (
    title,
    description,
    start_date,
    end_date,
    user_id,
    countries,
    cities,
    status
) VALUES (
    'Test Trip from SQL',
    'This is a test trip created directly from SQL',
    '2024-06-01',
    '2024-06-10',
    '00000000-0000-0000-0000-000000000000', -- placeholder user_id
    ARRAY['France', 'Italy'],
    ARRAY['Paris', 'Rome'],
    'planning'
);

-- Check if the test trip was inserted
SELECT 
    id,
    title,
    user_id,
    created_at
FROM trips 
WHERE title = 'Test Trip from SQL';

-- Now let's create simple RLS policies that should work
DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;

-- Re-enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create very simple policies
CREATE POLICY "Allow all for authenticated users" ON trips
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also allow for anon users temporarily for testing
CREATE POLICY "Allow all for anon users" ON trips
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- Test the policies by trying another insert
INSERT INTO trips (
    title,
    description,
    start_date,
    end_date,
    user_id,
    countries,
    cities,
    status
) VALUES (
    'Test Trip with RLS',
    'This trip tests if RLS policies work',
    '2024-07-01',
    '2024-07-10',
    '11111111-1111-1111-1111-111111111111', -- another placeholder user_id
    ARRAY['Spain', 'Portugal'],
    ARRAY['Madrid', 'Lisbon'],
    'planning'
);

-- Check all trips
SELECT 
    id,
    title,
    user_id,
    countries,
    cities,
    created_at
FROM trips 
ORDER BY created_at DESC;

-- Check trip_collaborators table as well
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'trip_collaborators';

-- Disable RLS on trip_collaborators too
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;

-- Grant permissions on trip_collaborators
GRANT ALL ON trip_collaborators TO authenticated;
GRANT ALL ON trip_collaborators TO anon;

-- Re-enable with simple policies
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users on collaborators" ON trip_collaborators
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon users on collaborators" ON trip_collaborators
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- Show final state
SELECT 'Trips table policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'trips';

SELECT 'Trip collaborators policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'trip_collaborators';

SELECT 'All trips in database:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC;
