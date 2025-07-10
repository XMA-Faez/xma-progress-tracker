-- Project Management Extension to existing schema

-- Create team members table
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment rules table (for admin interface)
CREATE TABLE assignment_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    stage TEXT NOT NULL,
    assigned_to UUID REFERENCES team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to client_tasks table for PM features
ALTER TABLE client_tasks 
ADD COLUMN assigned_to UUID REFERENCES team_members(id),
ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 
    'in_progress', 
    'waiting_for_client', 
    'waiting_for_team', 
    'blocked', 
    'review_required', 
    'client_review', 
    'revision_needed', 
    'completed', 
    'on_hold'
)),
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN notes TEXT;

-- Update the completed column logic (completed = true when status = 'completed')
UPDATE client_tasks SET completed = (status = 'completed');

-- Insert default team members
INSERT INTO team_members (name, email, role) VALUES
('Salma', 'salma@xma.com', 'Project Manager'),
('Mahan', 'mahan@xma.com', 'CMO'),
('Kian', 'kian@xma.com', 'Content Creator'),
('Faez', 'faez@xma.com', 'Dev/COO/Media Buyer'),
('Arcen', 'arcen@xma.com', 'Content Creator'),
('Domi', 'domi@xma.com', 'Account Manager'),
('Sakshi', 'sakshi@xma.com', 'Graphic Designer');

-- Insert default assignment rules
INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) VALUES
-- Onboarding
('Onboarding call', 'call', 'onboarding', (SELECT id FROM team_members WHERE name = 'Salma')),
('Creative Strategy & Writing', 'project', 'onboarding', (SELECT id FROM team_members WHERE name = 'Mahan')),
('Account setup call', 'call', 'onboarding', (SELECT id FROM team_members WHERE name = 'Salma')),
('Customized CRM setup', 'project', 'onboarding', (SELECT id FROM team_members WHERE name = 'Faez')),

-- Pre-production
('Pre-production Call', 'call', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')),
('Pre-production Revision Round', 'revision', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')),
('Video Script and Graphic Brief Approval', 'project', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')),

-- Production
('Production Start', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')),
('Model & Location Selection', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')),
('Video Shoot', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')),
('Graphics Creation', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Sakshi')),
('Video Editing', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')),
('Post Production Call', 'call', 'production', (SELECT id FROM team_members WHERE name = 'Salma')),
('Post-production Revision Round', 'revision', 'production', (SELECT id FROM team_members WHERE name = 'Kian')),
('Post-production Creatives Approval', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Sakshi')),

-- Launch
('Pre-launch Call', 'call', 'launch', (SELECT id FROM team_members WHERE name = 'Salma')),
('Ads Launch', 'project', 'launch', (SELECT id FROM team_members WHERE name = 'Faez'));

-- Create indexes for performance
CREATE INDEX idx_client_tasks_assigned_to ON client_tasks(assigned_to);
CREATE INDEX idx_client_tasks_status ON client_tasks(status);
CREATE INDEX idx_client_tasks_due_date ON client_tasks(due_date);
CREATE INDEX idx_assignment_rules_lookup ON assignment_rules(task_name, task_type, stage);

-- Add update triggers for new tables
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_rules_updated_at BEFORE UPDATE ON assignment_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for new tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_rules ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Authenticated users can manage team_members" ON team_members
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage assignment_rules" ON assignment_rules
    FOR ALL USING (auth.role() = 'authenticated');

-- Public read access for team member names (for client-facing pages)
CREATE POLICY "Public can read team_members" ON team_members
    FOR SELECT USING (true);