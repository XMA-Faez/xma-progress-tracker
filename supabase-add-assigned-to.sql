-- Add assigned_to field to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);