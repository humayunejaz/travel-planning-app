-- Insert sample agency user (you'll need to create this user in Supabase Auth first)
-- This is just for reference - you'll create the actual user through the Supabase dashboard

-- Sample data will be inserted automatically when users sign up and create trips
-- The triggers and functions will handle profile creation

-- You can manually insert an agency user profile if needed:
-- INSERT INTO profiles (id, email, name, role) 
-- VALUES ('your-agency-user-uuid', 'agency@example.com', 'Agency Admin', 'agency')
-- ON CONFLICT (id) DO NOTHING;
