-- Step 4: Insert test data

-- Insert test profiles
-- Note: In a real scenario, these would be created by the auth system
-- We're inserting them directly for testing purposes
INSERT INTO profiles (id, email, name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'user@example.com', 'Test User', 'traveler'),
  ('00000000-0000-0000-0000-000000000002', 'agency@example.com', 'Agency Admin', 'agency')
ON CONFLICT (id) DO NOTHING;

-- Insert test trips
INSERT INTO trips (id, user_id, title, description, countries, cities, start_date, end_date, status)
VALUES 
  (
    '00000000-0000-0000-0000-000000000101', 
    '00000000-0000-0000-0000-000000000001', 
    'Summer Vacation', 
    'A relaxing beach vacation', 
    ARRAY['Spain', 'Portugal'], 
    ARRAY['Barcelona', 'Lisbon'], 
    '2023-07-15', 
    '2023-07-30', 
    'planning'
  ),
  (
    '00000000-0000-0000-0000-000000000102', 
    '00000000-0000-0000-0000-000000000001', 
    'Winter Getaway', 
    'Skiing in the Alps', 
    ARRAY['Switzerland', 'France'], 
    ARRAY['Zermatt', 'Chamonix'], 
    '2023-12-20', 
    '2024-01-05', 
    'planning'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test collaborators
INSERT INTO trip_collaborators (trip_id, email)
VALUES 
  ('00000000-0000-0000-0000-000000000101', 'friend1@example.com'),
  ('00000000-0000-0000-0000-000000000101', 'friend2@example.com'),
  ('00000000-0000-0000-0000-000000000102', 'family@example.com')
ON CONFLICT (trip_id, email) DO NOTHING;

-- Insert test invitations
INSERT INTO trip_invitations (trip_id, email, token, invited_by, status, expires_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000101', 
    'newtraveler@example.com', 
    'token123', 
    '00000000-0000-0000-0000-000000000001', 
    'pending', 
    NOW() + INTERVAL '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000102', 
    'skier@example.com', 
    'token456', 
    '00000000-0000-0000-0000-000000000001', 
    'pending', 
    NOW() + INTERVAL '7 days'
  )
ON CONFLICT (token) DO NOTHING;

-- Insert test agency notes
INSERT INTO agency_notes (trip_id, agency_user_id, notes)
VALUES 
  (
    '00000000-0000-0000-0000-000000000101', 
    '00000000-0000-0000-0000-000000000002', 
    'Client prefers beachfront accommodations and has a seafood allergy.'
  ),
  (
    '00000000-0000-0000-0000-000000000102', 
    '00000000-0000-0000-0000-000000000002', 
    'Client is an experienced skier and wants advanced slopes.'
  )
ON CONFLICT (trip_id, agency_user_id) DO NOTHING;
