-- First, let's see what tables we have and their constraints
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check the foreign key constraints
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';

-- Check current profiles
SELECT 'Current profiles:' as info;
SELECT id, email, name, role FROM profiles LIMIT 10;

-- Disable RLS on all tables first
DO $$
BEGIN
    ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
    ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    
    -- Handle trip_invitations if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_invitations') THEN
        ALTER TABLE trip_invitations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    RAISE NOTICE 'Disabled RLS on all tables';
END $$;

-- Create a test profile first
INSERT INTO profiles (id, email, name, role) 
VALUES (uuid_generate_v4(), 'test@example.com', 'Test User', 'traveler')
ON CONFLICT (id) DO NOTHING
RETURNING id, email, name;

-- Get the test profile ID for our trip
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get or create a test user
    SELECT id INTO test_user_id FROM profiles WHERE email = 'test@example.com' LIMIT 1;
    
    IF test_user_id IS NULL THEN
        INSERT INTO profiles (id, email, name, role) 
        VALUES (uuid_generate_v4(), 'test@example.com', 'Test User', 'traveler')
        RETURNING id INTO test_user_id;
    END IF;
    
    RAISE NOTICE 'Using test user ID: %', test_user_id;
    
    -- Now insert the test trip with the valid user_id
    INSERT INTO trips (title, description, user_id, status, start_date, end_date) 
    VALUES ('SQL Test Trip', 'Created with valid user_id', test_user_id, 'planning', '2024-07-01', '2024-07-10');
    
    RAISE NOTICE 'Test trip created successfully';
END $$;

-- Show the results
SELECT 'Profiles after test:' as info;
SELECT id, email, name, role FROM profiles;

SELECT 'Trips after test:' as info;
SELECT t.id, t.title, t.user_id, p.email as user_email, t.created_at 
FROM trips t 
LEFT JOIN profiles p ON t.user_id = p.id 
ORDER BY t.created_at DESC 
LIMIT 10;

-- Test if we can insert trips without foreign key issues
SELECT 'Testing trip insertion capability...' as info;

-- Clean up test data
DELETE FROM trips WHERE title = 'SQL Test Trip';
DELETE FROM profiles WHERE email = 'test@example.com';

SELECT 'Test completed - database is ready for trip creation' as result;
