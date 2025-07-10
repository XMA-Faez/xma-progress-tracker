-- Add support for multiple team member assignments

-- Create a junction table for task assignments
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES client_tasks(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, team_member_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_team_member_id ON task_assignments(team_member_id);

-- Add RLS policies
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Authenticated users can manage task_assignments" ON task_assignments
    FOR ALL USING (auth.role() = 'authenticated');

-- Public read access for client-facing pages
CREATE POLICY "Public can read task_assignments" ON task_assignments
    FOR SELECT USING (true);

-- Migrate existing single assignments to the new table
INSERT INTO task_assignments (task_id, team_member_id)
SELECT id, assigned_to 
FROM client_tasks 
WHERE assigned_to IS NOT NULL
ON CONFLICT (task_id, team_member_id) DO NOTHING;

-- Note: After migration, you can optionally drop the assigned_to column from client_tasks
-- ALTER TABLE client_tasks DROP COLUMN assigned_to;