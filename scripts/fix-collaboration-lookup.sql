-- First, let's see what's actually in the trip_collaborators table
SELECT 'Current trip_collaborators data:' as info;
SELECT id, trip_id, email, created_at FROM trip_collaborators ORDER BY created_at DESC;

-- Check if there are any collaborations with similar emails (case issues, spaces, etc.)
SELECT 'Emails in trip_collaborators (checking for case/space issues):' as info;
SELECT DISTINCT 
    email,
    LENGTH(email) as email_length,
    LOWER(email) as email_lower,
    TRIM(email) as email_trimmed
FROM trip_collaborators;

-- Check profiles table for the user
SELECT 'Profiles matching humayunejazm@gmail.com:' as info;
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE email ILIKE '%humayunejazm@gmail.com%' OR email ILIKE '%humayun%';

-- Check if there are any RLS issues by trying to select as superuser
SELECT 'Testing RLS bypass:' as info;
SET row_security = off;
SELECT tc.*, t.title 
FROM trip_collaborators tc
LEFT JOIN trips t ON t.id = tc.trip_id
WHERE tc.email ILIKE '%humayun%';
SET row_security = on;

-- Create a test collaboration if none exists
DO $$
DECLARE
    test_trip_id UUID;
    test_email TEXT := 'humayunejazm@gmail.com';
BEGIN
    -- Get the first trip ID
    SELECT id INTO test_trip_id FROM trips LIMIT 1;
    
    IF test_trip_id IS NOT NULL THEN
        -- Insert a test collaboration
        INSERT INTO trip_collaborators (trip_id, email)
        VALUES (test_trip_id, test_email)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Test collaboration created for trip % and email %', test_trip_id, test_email;
    ELSE
        RAISE NOTICE 'No trips found to create test collaboration';
    END IF;
END $$;

-- Verify the test collaboration was created
SELECT 'After creating test collaboration:' as info;
SELECT tc.*, t.title 
FROM trip_collaborators tc
LEFT JOIN trips t ON t.id = tc.trip_id
WHERE tc.email = 'humayunejazm@gmail.com';
