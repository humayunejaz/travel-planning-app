-- This script will drop all existing tables and start fresh
-- WARNING: This will delete all your data!

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS agency_notes CASCADE;
DROP TABLE IF EXISTS trip_invitations CASCADE;
DROP TABLE IF EXISTS trip_collaborators CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'Database reset complete. All tables have been dropped.' as status;
