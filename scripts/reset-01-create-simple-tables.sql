-- Reset Script 1: Create Simple Tables (No Foreign Keys)
-- Run this first after resetting your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (simple, no constraints)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'traveler',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table (simple, no foreign keys)
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,  -- No foreign key constraint
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  countries TEXT[],
  cities TEXT[],
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_collaborators table (simple)
CREATE TABLE trip_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID,  -- No foreign key constraint
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic indexes for performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_created_at ON trips(created_at);

-- Insert a test record to verify everything works
INSERT INTO profiles (id, email, name, role) 
VALUES (uuid_generate_v4(), 'test@example.com', 'Test User', 'traveler');

-- Test trip insertion
INSERT INTO trips (user_id, title, description, countries, cities, status)
VALUES (
  (SELECT id FROM profiles WHERE email = 'test@example.com' LIMIT 1),
  'Test Trip',
  'A test trip to verify database works',
  ARRAY['France', 'Italy'],
  ARRAY['Paris', 'Rome'],
  'planning'
);

-- Show what we created
SELECT 'Profiles created:' as info, count(*) as count FROM profiles
UNION ALL
SELECT 'Trips created:' as info, count(*) as count FROM trips;

-- Show the test data
SELECT 'Test trip:' as info, title, countries, cities FROM trips WHERE title = 'Test Trip';
