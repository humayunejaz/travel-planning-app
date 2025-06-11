-- Check if countries and cities columns exist, if not add them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trips' AND column_name = 'countries') THEN
        ALTER TABLE trips ADD COLUMN countries TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trips' AND column_name = 'cities') THEN
        ALTER TABLE trips ADD COLUMN cities TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Check if trip_collaborators table exists, if not create it
CREATE TABLE IF NOT EXISTS trip_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, email)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
