-- Create the chat_messages table to store conversation history
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Set up Row Level Security (RLS) policies
-- Enable RLS on the table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own messages
CREATE POLICY "Users can view their own messages" 
ON chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages" 
ON chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own messages
CREATE POLICY "Users can update their own messages" 
ON chat_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON chat_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add necessary indexes
CREATE INDEX chat_messages_journal_entry_id_idx ON chat_messages(journal_entry_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);