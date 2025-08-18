-- Fix the unique constraint to properly handle NULL values
-- This allows multiple NULL telefono values for the same selling_point

-- Drop the existing constraint
ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_telefono_selling_point_unique;

-- Add the correct constraint that treats NULLs as the same value
-- Using a partial index instead of NULLS NOT DISTINCT for better PostgreSQL compatibility
CREATE UNIQUE INDEX personas_telefono_selling_point_idx 
ON personas (telefono, selling_point) 
WHERE telefono IS NOT NULL;

-- This allows multiple rows with telefono = NULL for the same selling_point
-- but ensures uniqueness for actual phone numbers within each selling_point