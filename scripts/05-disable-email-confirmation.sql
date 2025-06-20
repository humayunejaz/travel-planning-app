-- Step 5: Disable email confirmation for easier testing
-- This is optional and should only be used in development

UPDATE auth.config
SET email_confirmation_required = false
WHERE email_confirmation_required = true;
