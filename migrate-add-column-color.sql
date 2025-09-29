-- Migration: Add color column to columns table
-- Run this SQL in your Supabase Dashboard → SQL Editor

-- Add color column to columns table if it doesn't exist
ALTER TABLE columns 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Update existing columns to have the default color
UPDATE columns 
SET color = '#3B82F6' 
WHERE color IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'columns' AND column_name = 'color';

SELECT 'Migration completed successfully!' as status;
