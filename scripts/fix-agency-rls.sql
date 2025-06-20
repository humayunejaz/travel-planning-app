-- This script fixes RLS policies to allow agencies to update trips

-- First, check if the agency_can_manage_trips policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trips' AND policyname = 'agency_can_manage_trips'
    ) THEN
        -- Create policy to allow agencies to view all trips
        CREATE POLICY agency_can_manage_trips ON trips
            FOR ALL
            TO authenticated
            USING (
                (SELECT role FROM profiles WHERE id = auth.uid()) = 'agency'
            )
            WITH CHECK (
                (SELECT role FROM profiles WHERE id = auth.uid()) = 'agency'
            );
            
        RAISE NOTICE 'Created agency_can_manage_trips policy';
    ELSE
        RAISE NOTICE 'agency_can_manage_trips policy already exists';
    END IF;
END
$$;

-- Ensure RLS is enabled on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
WHERE tablename = 'trips';

-- Test if agency can update trips
DO $$
DECLARE
    agency_id uuid;
    trip_id uuid;
    result text;
BEGIN
    -- Get an agency user if exists
    SELECT id INTO agency_id FROM profiles WHERE role = 'agency' LIMIT 1;
    
    -- Get a trip if exists
    SELECT id INTO trip_id FROM trips LIMIT 1;
    
    IF agency_id IS NOT NULL AND trip_id IS NOT NULL THEN
        -- Set auth context to agency user
        PERFORM set_config('request.jwt.claims', json_build_object('sub', agency_id)::text, true);
        
        -- Try to update a trip
        BEGIN
            UPDATE trips SET title = 'Test Agency Update ' || now() WHERE id = trip_id;
            result := 'SUCCESS: Agency can update trips';
        EXCEPTION WHEN OTHERS THEN
            result := 'FAILED: Agency cannot update trips - ' || SQLERRM;
        END;
        
        RAISE NOTICE '%', result;
    ELSE
        RAISE NOTICE 'Cannot test: No agency user or trips found';
    END IF;
END
$$;
