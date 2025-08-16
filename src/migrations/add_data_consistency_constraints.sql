-- Migration: Add data consistency constraints and indexes
-- Run this SQL in your Neon database to improve data integrity

-- Add unique constraint for persona names within selling points (prevent exact duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_personas_unique_name_phone_selling_point 
ON personas(nombre, telefono, selling_point);

-- Add index for better encargo-persona lookups
CREATE INDEX IF NOT EXISTS idx_encargos_persona_telefono 
ON encargos(persona, telefono, selling_point);

-- Add index for faster consistency checks
CREATE INDEX IF NOT EXISTS idx_encargos_lookup_persona 
ON encargos(telefono, selling_point) WHERE persona IS NOT NULL;

-- Add check constraint to ensure phone numbers are not empty
ALTER TABLE personas 
ADD CONSTRAINT IF NOT EXISTS chk_personas_telefono_not_empty 
CHECK (LENGTH(TRIM(telefono)) > 0);

-- Add check constraint to ensure names are not empty
ALTER TABLE personas 
ADD CONSTRAINT IF NOT EXISTS chk_personas_nombre_not_empty 
CHECK (LENGTH(TRIM(nombre)) > 0);

-- Add check constraint for encargos persona name
ALTER TABLE encargos 
ADD CONSTRAINT IF NOT EXISTS chk_encargos_persona_not_empty 
CHECK (LENGTH(TRIM(persona)) > 0);

-- Add check constraint for encargos telefono
ALTER TABLE encargos 
ADD CONSTRAINT IF NOT EXISTS chk_encargos_telefono_not_empty 
CHECK (LENGTH(TRIM(telefono)) > 0);

-- Add check constraint for valid pagado amounts
ALTER TABLE encargos 
ADD CONSTRAINT IF NOT EXISTS chk_encargos_pagado_positive 
CHECK (pagado >= 0);

-- Create a function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for email format
ALTER TABLE personas 
ADD CONSTRAINT IF NOT EXISTS chk_personas_email_format 
CHECK (is_valid_email(email));

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_personas_updated_at ON personas;
CREATE TRIGGER trigger_update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_encargos_updated_at ON encargos;
CREATE TRIGGER trigger_update_encargos_updated_at
    BEFORE UPDATE ON encargos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();