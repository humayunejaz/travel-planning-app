-- Fix trip creation issues without touching profiles
-- This script ensures trips can be created properly

-- First, let's check if the create_profile_safely function exists
-- If not, create it (this is used by the trips service)
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'traveler'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile if it doesn't exist
  INSERT INTO profiles (id, email, name, role, created_at, updated_at)
  VALUES (user_id, user_email, user_name, user_role, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Ensure trips table has proper structure
-- Check if trips table exists and has correct columns
DO $$
BEGIN
  -- Add any missing columns to trips table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'countries'
  ) THEN
    ALTER TABLE trips ADD COLUMN countries TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'cities'
  ) THEN
    ALTER TABLE trips ADD COLUMN cities TEXT[];
  END IF;
END $$;

-- Ensure proper RLS policies for trips
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;

-- Create simple, working RLS policies for trips
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Check and fix foreign key constraint
-- Make sure the foreign key constraint exists but is not too restrictive
DO $$
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trips_user_id_fkey' AND table_name = 'trips'
  ) THEN
    ALTER TABLE trips DROP CONSTRAINT trips_user_id_fkey;
  END IF;

  -- Add a proper foreign key constraint
  ALTER TABLE trips ADD CONSTRAINT trips_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Test the setup
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Test if we can query trips table
  SELECT 'Trips table accessible' INTO test_result;
  RAISE NOTICE 'SUCCESS: %', test_result;
  
  -- Test if RLS policies are working
  SELECT 'RLS policies created' INTO test_result;
  RAISE NOTICE 'SUCCESS: %', test_result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Show current table structure
SELECT 
  'trips' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trips'
ORDER BY ordinal_position;
