-- Disable email confirmation requirement in Supabase Auth

-- This script disables the email confirmation requirement
-- so users can sign in immediately after registration without confirming their email

UPDATE auth.config
SET confirm_email_on_signup = false;

-- Check if the change was applied
SELECT confirm_email_on_signup FROM auth.config;

-- Note: This is for development/testing only
-- In production, you should enable email confirmation for security
