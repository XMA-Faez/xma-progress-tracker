-- Add color assignment to team members table
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS color_index INTEGER DEFAULT NULL;

-- Add constraint to ensure color_index is between 0 and 9 (for 10 preset colors)
ALTER TABLE team_members 
ADD CONSTRAINT check_color_index_range 
CHECK (color_index IS NULL OR (color_index >= 0 AND color_index <= 9));
