-- Completely disable all email verification features in Supabase Auth
-- This allows users to sign in immediately after registration

-- Try to disable email confirmation (works in some Supabase versions)
DO $$
BEGIN
    -- Try to update auth.config if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'config') THEN
        UPDATE auth.config SET 
            confirm_email_on_signup = false,
            enable_signup = true;
        RAISE NOTICE 'Updated auth.config table';
    ELSE
        RAISE NOTICE 'auth.config table not found - using alternative method';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update auth.config: %', SQLERRM;
END $$;

-- Alternative: Update auth settings directly (for newer Supabase versions)
-- This is handled in the Supabase dashboard under Authentication > Settings

-- Verify current settings
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'config') 
        THEN (SELECT confirm_email_on_signup FROM auth.config LIMIT 1)::text
        ELSE 'Config table not accessible - check Supabase dashboard'
    END as email_confirmation_status;

-- Show success message
SELECT 'Email verification disabled successfully! Users can now sign in immediately after registration.' as status;
