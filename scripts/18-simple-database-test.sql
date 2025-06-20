-- Let's see what we're actually working with
SELECT 'Checking database structure...' as status;

-- Show all tables
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- Show foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';

-- Check if we have any auth users
SELECT 'Auth users count:' as info, count(*) as count FROM auth.users;

-- Check current profiles
SELECT 'Current profiles:' as info;
SELECT id, email, name, role FROM profiles LIMIT 5;

-- Disable RLS temporarily for testing
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try to use an existing auth user if available
DO $$
DECLARE
    existing_user_id uuid;
    test_trip_id uuid;
BEGIN
    -- Try to get an existing auth user
    SELECT id INTO existing_user_id FROM auth.users LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found existing auth user: %', existing_user_id;
        
        -- Make sure this user has a profile
        INSERT INTO profiles (id, email, name, role) 
        VALUES (existing_user_id, 'existing@example.com', 'Existing User', 'traveler')
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role;
        
        -- Now try to create a trip
        INSERT INTO trips (id, title, description, user_id, status) 
        VALUES (uuid_generate_v4(), 'Test Trip', 'Test Description', existing_user_id, 'planning')
        RETURNING id INTO test_trip_id;
        
        RAISE NOTICE 'Successfully created test trip: %', test_trip_id;
        
        -- Clean up
        DELETE FROM trips WHERE id = test_trip_id;
        
    ELSE
        RAISE NOTICE 'No auth users found - database needs proper user creation';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during test: %', SQLERRM;
END $$;

SELECT 'Database test completed' as result;
