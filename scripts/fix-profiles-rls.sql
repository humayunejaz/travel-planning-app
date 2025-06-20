-- Fix the infinite recursion in profiles RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Agency users can view all profiles" ON profiles;

-- Create simplified policies that don't cause recursion
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- For agency users, use a direct check against auth.users metadata
CREATE POLICY "Agency users can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT (raw_user_meta_data->>'role')::text = 'agency' 
     FROM auth.users 
     WHERE id = auth.uid())
  );

SELECT 'Profiles RLS policies fixed' as result;
