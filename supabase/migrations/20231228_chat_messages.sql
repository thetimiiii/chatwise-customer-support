-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_website_id ON chat_messages(website_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add RLS policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow insert through widget (with valid embed token)
CREATE POLICY "Allow widget to insert messages"
    ON chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM websites
            WHERE websites.id = website_id
            AND websites.embed_token IS NOT NULL
        )
    );

-- Allow select through widget (with valid embed token)
CREATE POLICY "Allow widget to view messages"
    ON chat_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM websites
            WHERE websites.id = website_id
            AND websites.embed_token IS NOT NULL
        )
    );
