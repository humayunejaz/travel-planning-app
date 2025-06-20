-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('trip_collaborators', 'trips')
ORDER BY tablename, policyname;

-- Test inserting a collaboration with a non-existent user email
DO $$
DECLARE
    test_trip_id UUID;
    test_user_id UUID := 'e36048db-a619-4ac5-9b18-1d2e2df4b3b7';
BEGIN
    -- Get or create a test trip
    SELECT id INTO test_trip_id FROM trips WHERE user_id = test_user_id LIMIT 1;
    
    IF test_trip_id IS NULL THEN
        INSERT INTO trips (user_id, title, description, status)
        VALUES (test_user_id, 'Test Trip for Collaboration', 'Testing collaboration permissions', 'planning')
        RETURNING id INTO test_trip_id;
        
        RAISE NOTICE 'Created test trip: %', test_trip_id;
    ELSE
        RAISE NOTICE 'Using existing test trip: %', test_trip_id;
    END IF;
    
    -- Try to insert collaboration with non-existent email
    BEGIN
        INSERT INTO trip_collaborators (trip_id, email)
        VALUES (test_trip_id, 'nonexistent@example.com');
        
        RAISE NOTICE 'Successfully inserted collaboration for non-existent email';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert collaboration: %', SQLERRM;
    END;
    
    -- Try to insert collaboration with existing email
    BEGIN
        INSERT INTO trip_collaborators (trip_id, email)
        VALUES (test_trip_id, 'humayunejazm@gmail.com');
        
        RAISE NOTICE 'Successfully inserted collaboration for existing email';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert collaboration for existing email: %', SQLERRM;
    END;
    
END $$;

-- Check what collaborations exist
SELECT 'Current collaborations:' as info;
SELECT tc.id, tc.trip_id, tc.email, t.title as trip_title, t.user_id as trip_owner
FROM trip_collaborators tc
LEFT JOIN trips t ON t.id = tc.trip_id
ORDER BY tc.created_at DESC;

-- Test querying collaborations
SELECT 'Testing collaboration queries:' as info;
SELECT 'Query for humayunejazm@gmail.com:' as test;
SELECT * FROM trip_collaborators WHERE email = 'humayunejazm@gmail.com';

SELECT 'Query for nonexistent@example.com:' as test;
SELECT * FROM trip_collaborators WHERE email = 'nonexistent@example.com';
