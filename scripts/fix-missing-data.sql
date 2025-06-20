-- Check if we have any data at all
SELECT 'Checking database contents...' as status;

-- Check trips table
SELECT 'Trips count:' as info, COUNT(*) as count FROM trips;
SELECT 'Sample trips:' as info;
SELECT id, title, user_id, created_at FROM trips ORDER BY created_at DESC LIMIT 5;

-- Check trip_collaborators table
SELECT 'Collaborators count:' as info, COUNT(*) as count FROM trip_collaborators;
SELECT 'Sample collaborators:' as info;
SELECT id, trip_id, email, created_at FROM trip_collaborators ORDER BY created_at DESC LIMIT 5;

-- Check profiles table
SELECT 'Profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Sample profiles:' as info;
SELECT id, email, name, role FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check if RLS is blocking queries
SELECT 'Testing RLS policies...' as status;
SET row_security = off;
SELECT 'Trips (RLS off):' as info, COUNT(*) as count FROM trips;
SELECT 'Collaborators (RLS off):' as info, COUNT(*) as count FROM trip_collaborators;
SET row_security = on;

-- Check current user context
SELECT 'Current user context:' as info;
SELECT 
    current_user as db_user,
    current_setting('request.jwt.claims', true)::json as jwt_claims;

-- Create test data if none exists
DO $$
DECLARE
    test_user_id UUID := 'e36048db-a619-4ac5-9b18-1d2e2df4b3b7';
    test_email TEXT := 'humayunejazm@gmail.com';
    test_trip_id UUID;
BEGIN
    -- Ensure profile exists
    INSERT INTO profiles (id, email, name, role)
    VALUES (test_user_id, test_email, 'Humayun Ejaz', 'traveler')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role;
    
    RAISE NOTICE 'Profile ensured for user %', test_email;
    
    -- Create a test trip
    INSERT INTO trips (user_id, title, description, status, countries, cities)
    VALUES (
        test_user_id,
        'Test Trip for Collaboration',
        'This is a test trip to verify collaboration features',
        'planning',
        ARRAY['France', 'Italy'],
        ARRAY['Paris', 'Rome']
    )
    RETURNING id INTO test_trip_id;
    
    RAISE NOTICE 'Test trip created with ID: %', test_trip_id;
    
    -- Create a test collaboration (invite another email)
    INSERT INTO trip_collaborators (trip_id, email)
    VALUES (test_trip_id, 'collaborator@example.com');
    
    -- Also create a collaboration for the main user (self-collaboration for testing)
    INSERT INTO trip_collaborators (trip_id, email)
    VALUES (test_trip_id, test_email);
    
    RAISE NOTICE 'Test collaborations created';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test data: %', SQLERRM;
END $$;

-- Verify test data was created
SELECT 'After creating test data...' as status;
SELECT 'Trips:' as info, COUNT(*) as count FROM trips;
SELECT 'Collaborators:' as info, COUNT(*) as count FROM trip_collaborators;

-- Show the created data
SELECT 'Created trips:' as info;
SELECT id, title, user_id, status FROM trips;

SELECT 'Created collaborations:' as info;
SELECT tc.id, tc.trip_id, tc.email, t.title as trip_title
FROM trip_collaborators tc
LEFT JOIN trips t ON t.id = tc.trip_id;
