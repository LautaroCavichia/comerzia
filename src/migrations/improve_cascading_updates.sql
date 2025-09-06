-- Migration: Improve cascading update logic
-- This keeps cascading functionality but makes it more precise and reliable

-- Step 1: Add a persona_id foreign key to link encargos directly to personas
-- This will be the authoritative relationship, while keeping name/phone for display
ALTER TABLE encargos 
ADD COLUMN IF NOT EXISTS persona_id UUID;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_encargos_persona_id 
ON encargos(persona_id);

-- Step 3: Migrate existing data to establish the persona_id relationships
-- We'll match encargos to personas using the most precise match possible

-- First pass: Match by phone number (most reliable when both exist)
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.telefono = p.telefono 
  AND encargos.telefono IS NOT NULL
  AND p.telefono IS NOT NULL
  AND encargos.persona_id IS NULL;

-- Second pass: Match by name when encargo has no phone and persona has no phone
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND encargos.telefono IS NULL
  AND p.telefono IS NULL
  AND encargos.persona_id IS NULL;

-- Third pass: Match by name when encargo has no phone but persona has phone
-- (for legacy orders created before phone was tracked)
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND encargos.telefono IS NULL
  AND p.telefono IS NOT NULL
  AND encargos.persona_id IS NULL;

-- Step 4: Handle remaining orphaned orders by creating personas for them
-- This handles cases where orders exist but no matching persona
INSERT INTO personas (id, nombre, telefono, selling_point, phone_notifications, email_notifications, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  e.persona,
  e.telefono,
  e.selling_point,
  false as phone_notifications,
  false as email_notifications,
  NOW() as created_at,
  NOW() as updated_at
FROM (
  SELECT DISTINCT persona, telefono, selling_point
  FROM encargos 
  WHERE persona_id IS NULL
) e
WHERE NOT EXISTS (
  SELECT 1 FROM personas p 
  WHERE p.nombre = e.persona 
    AND p.selling_point = e.selling_point
    AND ((p.telefono = e.telefono) OR (p.telefono IS NULL AND e.telefono IS NULL))
);

-- Step 5: Link remaining orphaned orders to newly created personas
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND ((encargos.telefono = p.telefono) OR (encargos.telefono IS NULL AND p.telefono IS NULL))
  AND encargos.persona_id IS NULL;

-- Step 6: Add foreign key constraint (PostgreSQL compatible way)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_encargos_persona_id' 
        AND table_name = 'encargos'
    ) THEN
        ALTER TABLE encargos 
        ADD CONSTRAINT fk_encargos_persona_id 
        FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 7: Create triggers for automatic cascading updates
-- This will keep the name and phone in encargos in sync with personas table

CREATE OR REPLACE FUNCTION update_encargos_on_persona_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all encargos that belong to this persona
  UPDATE encargos 
  SET 
    persona = NEW.nombre,
    telefono = NEW.telefono,
    updated_at = NOW()
  WHERE persona_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_cascade_persona_changes ON personas;
CREATE TRIGGER trigger_cascade_persona_changes
  AFTER UPDATE ON personas
  FOR EACH ROW
  WHEN (OLD.nombre IS DISTINCT FROM NEW.nombre OR OLD.telefono IS DISTINCT FROM NEW.telefono)
  EXECUTE FUNCTION update_encargos_on_persona_change();

-- Step 8: Create function to find or create persona when creating encargo
CREATE OR REPLACE FUNCTION find_or_create_persona(
  p_nombre VARCHAR(255),
  p_telefono VARCHAR(20),
  p_selling_point VARCHAR(50),
  p_email VARCHAR(255) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  persona_uuid UUID;
BEGIN
  -- Try to find existing persona by phone first (most reliable)
  IF p_telefono IS NOT NULL THEN
    SELECT id INTO persona_uuid
    FROM personas 
    WHERE telefono = p_telefono AND selling_point = p_selling_point;
    
    IF FOUND THEN
      -- Update name if different (cascading will handle encargos)
      UPDATE personas 
      SET nombre = p_nombre, email = COALESCE(p_email, email), updated_at = NOW()
      WHERE id = persona_uuid AND nombre != p_nombre;
      
      RETURN persona_uuid;
    END IF;
  END IF;
  
  -- Try to find by name when no phone
  IF p_telefono IS NULL THEN
    SELECT id INTO persona_uuid
    FROM personas 
    WHERE nombre = p_nombre AND telefono IS NULL AND selling_point = p_selling_point;
    
    IF FOUND THEN
      RETURN persona_uuid;
    END IF;
  END IF;
  
  -- Create new persona if not found
  INSERT INTO personas (nombre, telefono, selling_point, email, phone_notifications, email_notifications)
  VALUES (p_nombre, p_telefono, p_selling_point, p_email, false, false)
  RETURNING id INTO persona_uuid;
  
  RETURN persona_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Verify migration was successful
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count FROM encargos WHERE persona_id IS NULL;
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % orders still have NULL persona_id', orphaned_count;
    END IF;
    
    RAISE NOTICE 'Migration successful: All encargos now have persona_id relationships';
END $$;