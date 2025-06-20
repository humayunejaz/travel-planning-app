-- Create a simple test table if it doesn't exist
CREATE TABLE IF NOT EXISTS database_test (
  id SERIAL PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test record with current timestamp
INSERT INTO database_test (message)
VALUES ('Database test at ' || NOW());

-- Query the table to show all records
SELECT * FROM database_test ORDER BY created_at DESC;

-- Show count of records
SELECT COUNT(*) AS total_records FROM database_test;
