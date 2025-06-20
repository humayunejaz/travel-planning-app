-- Step 4: Create test data

-- Create a test agency user
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  uuid_generate_v4(),
  'agency@example.com',
  '{"role": "agency", "name": "Agency Admin"}'
)
ON CONFLICT (email) DO UPDATE
SET raw_user_meta_data = '{"role": "agency", "name": "Agency Admin"}';

-- Create a test traveler user
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  uuid_generate_v4(),
  'traveler@example.com',
  '{"role": "traveler", "name": "Test Traveler"}'
)
ON CONFLICT (email) DO UPDATE
SET raw_user_meta_data = '{"role": "traveler", "name": "Test Traveler"}';

-- The trigger should automatically create profiles for these users

-- Get the traveler user ID
DO $$
DECLARE
  traveler_id uuid;
  trip_id uuid;
BEGIN
  SELECT id INTO traveler_id FROM profiles WHERE email = 'traveler@example.com';
  
  IF traveler_id IS NOT NULL THEN
    -- Create a test trip
    INSERT INTO trips (user_id, title, description, countries, cities, start_date, end_date)
    VALUES (
      traveler_id,
      'Test Trip to Europe',
      'A wonderful journey through Europe',
      ARRAY['France', 'Italy', 'Spain'],
      ARRAY['Paris', 'Rome', 'Barcelona'],
      '2024-07-01',
      '2024-07-15'
    )
    RETURNING id INTO trip_id;
    
    -- Add a collaborator
    INSERT INTO trip_collaborators (trip_id, email)
    VALUES (trip_id, 'friend@example.com');
    
    -- Create an invitation
    INSERT INTO trip_invitations (trip_id, email, token, invited_by, expires_at)
    VALUES (
      trip_id,
      'invited@example.com',
      'test-token-' || uuid_generate_v4(),
      traveler_id,
      NOW() + INTERVAL '7 days'
    );
  END IF;
END $$;

-- Show the test data
SELECT 'Users and profiles:' as info;
SELECT u.email, p.name, p.role 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('agency@example.com', 'traveler@example.com');

SELECT 'Test trips:' as info;
SELECT t.title, t.countries, t.cities, t.start_date, t.end_date, p.email as owner
FROM trips t
JOIN profiles p ON t.user_id = p.id
WHERE p.email = 'traveler@example.com';

SELECT 'Test collaborators:' as info;
SELECT tc.email, t.title as trip_title
FROM trip_collaborators tc
JOIN trips t ON tc.trip_id = t.id
JOIN profiles p ON t.user_id = p.id
WHERE p.email = 'traveler@example.com';

SELECT 'Test invitations:' as info;
SELECT ti.email, ti.token, ti.status, t.title as trip_title
FROM trip_invitations ti
JOIN trips t ON ti.trip_id = t.id
JOIN profiles p ON t.user_id = p.id
WHERE p.email = 'traveler@example.com';

SELECT 'Test data created successfully!' as status;
