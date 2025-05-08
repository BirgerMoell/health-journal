-- Run this SQL in your Supabase SQL Editor to add the missing columns

-- Add the ai_response column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'journal_entries'
          AND column_name = 'ai_response'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN ai_response TEXT;
    END IF;
END $$;

-- Add the tags column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'journal_entries'
          AND column_name = 'tags'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Add the mood column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'journal_entries'
          AND column_name = 'mood'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN mood TEXT;
    END IF;
END $$;