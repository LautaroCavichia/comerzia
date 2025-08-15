-- Migration: Add email and notification preferences to personas table
-- Run this SQL in your Neon database to add the new fields

-- Add email column (optional)
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add notification preference columns
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS phone_notifications BOOLEAN DEFAULT FALSE;

ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT FALSE;

-- Update existing records to have notification defaults
UPDATE personas 
SET phone_notifications = FALSE, email_notifications = FALSE
WHERE phone_notifications IS NULL OR email_notifications IS NULL;

-- Add index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_personas_email ON personas(email) WHERE email IS NOT NULL;