-- Create user_client_pins table for pinning clients per user
CREATE TABLE IF NOT EXISTS user_client_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_client_pins_user_id ON user_client_pins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_client_pins_client_id ON user_client_pins(client_id);

-- Enable RLS
ALTER TABLE user_client_pins ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own pins
CREATE POLICY "Users can view their own pins" ON user_client_pins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pins" ON user_client_pins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pins" ON user_client_pins
    FOR DELETE USING (auth.uid() = user_id);