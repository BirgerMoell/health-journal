-- Create the journal_entries table with all required columns
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    ai_response TEXT,
    mood TEXT,
    tags TEXT[]
);

-- Set up Row Level Security (RLS) policies
-- Enable RLS on the table
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own entries
CREATE POLICY "Users can view their own entries" 
ON journal_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own entries" 
ON journal_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own entries
CREATE POLICY "Users can update their own entries" 
ON journal_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own entries
CREATE POLICY "Users can delete their own entries" 
ON journal_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add necessary indexes
CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries(created_at);