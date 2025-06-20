-- Step 5: Insert test data (optional)
-- Run this in your Supabase SQL Editor

-- Insert test profiles (these will be created automatically when users sign up)
-- This is just for testing purposes

INSERT INTO profiles (id, email, name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'traveler'),
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
    '2024-07-15', 
    '2024-07-30', 
    'planning'
  )
ON CONFLICT (id) DO NOTHING;

SELECT 'Test data inserted successfully!' as status;
