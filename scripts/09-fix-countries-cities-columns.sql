-- Ensure countries and cities columns exist and are properly typed
ALTER TABLE trips 
  ALTER COLUMN countries SET DEFAULT '{}',
  ALTER COLUMN cities SET DEFAULT '{}';

-- Make sure the columns are not null
UPDATE trips SET countries = '{}' WHERE countries IS NULL;
UPDATE trips SET cities = '{}' WHERE cities IS NULL;

-- Add not null constraints
ALTER TABLE trips 
  ALTER COLUMN countries SET NOT NULL,
  ALTER COLUMN cities SET NOT NULL;
