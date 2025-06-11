-- Create trip_invitations table
CREATE TABLE IF NOT EXISTS trip_invitations (
  id TEXT PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trip_invitations_token ON trip_invitations(token);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON trip_invitations(email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip_id ON trip_invitations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status ON trip_invitations(status);
