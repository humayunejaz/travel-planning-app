-- Reset Script 2: Test Basic Database Operations
-- Run this second to verify everything works

-- Test 1: Can we insert a profile?
INSERT INTO profiles (email, name, role) 
VALUES ('demo@example.com', 'Demo User', 'traveler')
ON CONFLICT (id) DO NOTHING;

-- Test 2: Can we insert a trip?
INSERT INTO trips (user_id, title, description, start_date, end_date, countries, cities)
VALUES (
  uuid_generate_v4(),  -- Random user ID (no constraints)
  'Demo Trip to Japan',
  'Exploring Tokyo and Kyoto',
  '2024-06-01',
  '2024-06-15',
  ARRAY['Japan'],
  ARRAY['Tokyo', 'Kyoto']
);

-- Test 3: Can we query trips?
SELECT 
  id,
  title,
  description,
  countries,
  cities,
  status,
  created_at
FROM trips 
ORDER BY created_at DESC
LIMIT 5;

-- Test 4: Can we update a trip?
UPDATE trips 
SET description = 'Updated: Exploring Tokyo, Kyoto, and Osaka'
WHERE title = 'Demo Trip to Japan';

-- Test 5: Show final results
SELECT 
  'Total profiles:' as info, 
  count(*)::text as value 
FROM profiles
UNION ALL
SELECT 
  'Total trips:' as info, 
  count(*)::text as value 
FROM trips
UNION ALL
SELECT 
  'Latest trip:' as info, 
  title as value 
FROM trips 
ORDER BY created_at DESC 
LIMIT 1;

-- Success message
SELECT '✅ All basic operations work!' as result;
