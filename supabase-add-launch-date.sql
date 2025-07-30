-- Add launch_date field to clients table
ALTER TABLE clients 
ADD COLUMN launch_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN clients.launch_date IS 'Target or actual launch date for the client project';