-- First, let's see what tables we actually have
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Disable RLS on existing tables only
DO $$
BEGIN
    -- Check if tables exist before disabling RLS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trips') THEN
        ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_collaborators') THEN
        ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_invitations') THEN
        ALTER TABLE trip_invitations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agency_notes') THEN
        ALTER TABLE agency_notes DISABLE ROW LEVEL SECURITY;
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Show current trips
SELECT 'Current trips:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;

-- Test direct insertion with a real UUID
INSERT INTO trips (title, description, user_id, status, start_date, end_date) 
VALUES ('SQL Test Trip', 'Created directly from SQL', uuid_generate_v4()::text, 'planning', '2024-07-01', '2024-07-10')
RETURNING id, title, user_id, created_at;

-- Show trips after insertion
SELECT 'Trips after test insertion:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 10;

-- Show table permissions
SELECT 'Table permissions:' as info;
SELECT schemaname, tablename, tableowner, hasinserts, hasselects, hasupdates, hasdeletes 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('trips', 'profiles', 'trip_collaborators', 'trip_invitations', 'agency_notes');
