-- Fixed Project Management Extension to existing schema

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment rules table (for admin interface)
CREATE TABLE IF NOT EXISTS assignment_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    stage TEXT NOT NULL,
    assigned_to UUID REFERENCES team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to client_tasks table for PM features (only if they don't exist)
DO $$ 
BEGIN
    -- Add assigned_to column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE client_tasks ADD COLUMN assigned_to UUID REFERENCES team_members(id);
    END IF;
    
    -- Add status column if it doesn't exist, with proper handling of existing completed values
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tasks' AND column_name = 'status') THEN
        ALTER TABLE client_tasks ADD COLUMN status TEXT;
        
        -- Set status based on existing completed values BEFORE adding the constraint
        UPDATE client_tasks SET status = CASE 
            WHEN completed = true THEN 'completed'
            ELSE 'not_started'
        END;
        
        -- Now add the constraint
        ALTER TABLE client_tasks ADD CONSTRAINT client_tasks_status_check 
        CHECK (status IN (
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
        ));
        
        -- Set default for future inserts
        ALTER TABLE client_tasks ALTER COLUMN status SET DEFAULT 'not_started';
    END IF;
    
    -- Add other columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tasks' AND column_name = 'due_date') THEN
        ALTER TABLE client_tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tasks' AND column_name = 'priority') THEN
        ALTER TABLE client_tasks ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tasks' AND column_name = 'notes') THEN
        ALTER TABLE client_tasks ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Insert default team members (only if they don't exist)
INSERT INTO team_members (name, email, role) 
SELECT 'Salma', 'salma@xma.com', 'Project Manager'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'salma@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Mahan', 'mahan@xma.com', 'CMO'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'mahan@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Kian', 'kian@xma.com', 'Content Creator'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'kian@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Faez', 'faez@xma.com', 'Dev/COO/Media Buyer'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'faez@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Arcen', 'arcen@xma.com', 'Content Creator'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'arcen@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Domi', 'domi@xma.com', 'Account Manager'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'domi@xma.com');

INSERT INTO team_members (name, email, role) 
SELECT 'Sakshi', 'sakshi@xma.com', 'Graphic Designer'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE email = 'sakshi@xma.com');

-- Insert default assignment rules (only if they don't exist)
INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Onboarding call', 'call', 'onboarding', (SELECT id FROM team_members WHERE name = 'Salma')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Onboarding call' AND task_type = 'call' AND stage = 'onboarding');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Creative Strategy & Writing', 'project', 'onboarding', (SELECT id FROM team_members WHERE name = 'Mahan')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Creative Strategy & Writing' AND task_type = 'project' AND stage = 'onboarding');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Account setup call', 'call', 'onboarding', (SELECT id FROM team_members WHERE name = 'Salma')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Account setup call' AND task_type = 'call' AND stage = 'onboarding');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Customized CRM setup', 'project', 'onboarding', (SELECT id FROM team_members WHERE name = 'Faez')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Customized CRM setup' AND task_type = 'project' AND stage = 'onboarding');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Pre-production Call', 'call', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Pre-production Call' AND task_type = 'call' AND stage = 'pre-production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Pre-production Revision Round', 'revision', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Pre-production Revision Round' AND task_type = 'revision' AND stage = 'pre-production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Video Script and Graphic Brief Approval', 'project', 'pre-production', (SELECT id FROM team_members WHERE name = 'Mahan')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Video Script and Graphic Brief Approval' AND task_type = 'project' AND stage = 'pre-production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Production Start', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Production Start' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Model & Location Selection', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Model & Location Selection' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Video Shoot', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Video Shoot' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Graphics Creation', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Sakshi')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Graphics Creation' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Video Editing', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Kian')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Video Editing' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Post Production Call', 'call', 'production', (SELECT id FROM team_members WHERE name = 'Salma')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Post Production Call' AND task_type = 'call' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Post-production Revision Round', 'revision', 'production', (SELECT id FROM team_members WHERE name = 'Kian')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Post-production Revision Round' AND task_type = 'revision' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Post-production Creatives Approval', 'project', 'production', (SELECT id FROM team_members WHERE name = 'Sakshi')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Post-production Creatives Approval' AND task_type = 'project' AND stage = 'production');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Pre-launch Call', 'call', 'launch', (SELECT id FROM team_members WHERE name = 'Salma')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Pre-launch Call' AND task_type = 'call' AND stage = 'launch');

INSERT INTO assignment_rules (task_name, task_type, stage, assigned_to) 
SELECT 'Ads Launch', 'project', 'launch', (SELECT id FROM team_members WHERE name = 'Faez')
WHERE NOT EXISTS (SELECT 1 FROM assignment_rules WHERE task_name = 'Ads Launch' AND task_type = 'project' AND stage = 'launch');

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_client_tasks_assigned_to ON client_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_client_tasks_status ON client_tasks(status);
CREATE INDEX IF NOT EXISTS idx_client_tasks_due_date ON client_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_rules_lookup ON assignment_rules(task_name, task_type, stage);

-- Add update triggers for new tables (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_updated_at') THEN
        CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assignment_rules_updated_at') THEN
        CREATE TRIGGER update_assignment_rules_updated_at BEFORE UPDATE ON assignment_rules
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add RLS policies for new tables (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members') THEN
        ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Authenticated users can manage team_members" ON team_members
            FOR ALL USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Public can read team_members" ON team_members
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assignment_rules') THEN
        ALTER TABLE assignment_rules ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Authenticated users can manage assignment_rules" ON assignment_rules
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;