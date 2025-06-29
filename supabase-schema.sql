-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    unique_link TEXT UNIQUE NOT NULL,
    frame_link TEXT,
    google_drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_tasks table
CREATE TABLE client_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('call', 'project', 'revision')),
    stage TEXT NOT NULL CHECK (stage IN ('onboarding', 'pre-production', 'production', 'launch')),
    touchpoint INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    description TEXT,
    order_index INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_client_tasks_client_id ON client_tasks(client_id);
CREATE INDEX idx_clients_unique_link ON clients(unique_link);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_tasks_updated_at BEFORE UPDATE ON client_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks ENABLE ROW LEVEL SECURITY;

-- Admin policies for clients table
CREATE POLICY "Authenticated users can manage clients" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Public read access to clients via unique_link (for client-facing pages)
CREATE POLICY "Public can read clients" ON clients
    FOR SELECT USING (true);

-- Admin policies for client_tasks table  
CREATE POLICY "Authenticated users can manage client_tasks" ON client_tasks
    FOR ALL USING (auth.role() = 'authenticated');

-- Public read access to client_tasks (for client-facing pages)
CREATE POLICY "Public can read client_tasks" ON client_tasks
    FOR SELECT USING (true);