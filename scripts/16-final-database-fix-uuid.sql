-- First, let's see what tables we actually have and their column types
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check the actual column types for trips table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'trips'
ORDER BY ordinal_position;

-- Disable RLS on existing tables only
DO $$
BEGIN
    -- Check if tables exist before disabling RLS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trips') THEN
        ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on trips table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_collaborators') THEN
        ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on trip_collaborators table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on profiles table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_invitations') THEN
        ALTER TABLE trip_invitations DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on trip_invitations table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agency_notes') THEN
        ALTER TABLE agency_notes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on agency_notes table';
    END IF;
END $$;

-- Drop all existing policies (ignore errors if they don't exist)
DO $$
BEGIN
    -- Drop policies on trips table
    DROP POLICY IF EXISTS "Users can view own trips" ON trips;
    DROP POLICY IF EXISTS "Users can insert own trips" ON trips;
    DROP POLICY IF EXISTS "Users can update own trips" ON trips;
    DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
    DROP POLICY IF EXISTS "Enable read access for all users" ON trips;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON trips;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON trips;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON trips;
    DROP POLICY IF EXISTS "Allow all operations" ON trips;
    
    -- Drop policies on other tables
    DROP POLICY IF EXISTS "Allow all operations" ON trip_collaborators;
    DROP POLICY IF EXISTS "Allow all operations" ON profiles;
    DROP POLICY IF EXISTS "Allow all operations" ON trip_invitations;
    DROP POLICY IF EXISTS "Allow all operations" ON agency_notes;
    
    RAISE NOTICE 'Dropped all existing policies';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Show current trips
SELECT 'Current trips:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;

-- Test direct insertion with proper UUID handling
INSERT INTO trips (title, description, user_id, status, start_date, end_date) 
VALUES ('SQL Test Trip', 'Created directly from SQL', uuid_generate_v4(), 'planning', '2024-07-01', '2024-07-10')
RETURNING id, title, user_id, created_at;

-- Show trips after insertion
SELECT 'Trips after test insertion:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;

-- Test with a simple string user_id (in case our app is using strings)
DO $$
BEGIN
    INSERT INTO trips (title, description, user_id, status) 
    VALUES ('String Test Trip', 'Testing with string user_id', 'test-user-123', 'planning');
    RAISE NOTICE 'String user_id insertion successful';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'String user_id failed: %', SQLERRM;
END $$;

-- Show final state
SELECT 'Final trips list:' as info;
SELECT id, title, user_id, status, created_at FROM trips ORDER BY created_at DESC;
