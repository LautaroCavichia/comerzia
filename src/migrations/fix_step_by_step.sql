-- STEP-BY-STEP FIX for the persona-encargo relationship issues
-- Run these one by one if you encounter any errors

-- Step 1: Add persona_id column (run this first)
ALTER TABLE encargos ADD COLUMN IF NOT EXISTS persona_id UUID;

-- Step 2: Add index
CREATE INDEX IF NOT EXISTS idx_encargos_persona_id ON encargos(persona_id);

-- Step 3: Migrate data - Match by phone (most reliable)
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.telefono = p.telefono 
  AND encargos.telefono IS NOT NULL
  AND p.telefono IS NOT NULL
  AND encargos.persona_id IS NULL;

-- Step 4: Migrate data - Match by name when both have no phone
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND encargos.telefono IS NULL
  AND p.telefono IS NULL
  AND encargos.persona_id IS NULL;

-- Step 5: Migrate data - Match by name for legacy orders
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND encargos.telefono IS NULL
  AND p.telefono IS NOT NULL
  AND encargos.persona_id IS NULL;

-- Step 6: Create personas for orphaned orders
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

-- Step 7: Link remaining orphaned orders
UPDATE encargos 
SET persona_id = p.id
FROM personas p 
WHERE encargos.selling_point = p.selling_point 
  AND encargos.persona = p.nombre 
  AND ((encargos.telefono = p.telefono) OR (encargos.telefono IS NULL AND p.telefono IS NULL))
  AND encargos.persona_id IS NULL;

-- Step 8: Check if constraint exists, add if not
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

-- Step 9: Create cascading trigger function
CREATE OR REPLACE FUNCTION update_encargos_on_persona_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE encargos 
  SET 
    persona = NEW.nombre,
    telefono = NEW.telefono,
    updated_at = NOW()
  WHERE persona_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger
DROP TRIGGER IF EXISTS trigger_cascade_persona_changes ON personas;
CREATE TRIGGER trigger_cascade_persona_changes
  AFTER UPDATE ON personas
  FOR EACH ROW
  WHEN (OLD.nombre IS DISTINCT FROM NEW.nombre OR OLD.telefono IS DISTINCT FROM NEW.telefono)
  EXECUTE FUNCTION update_encargos_on_persona_change();

-- Step 11: Create smart find_or_create function
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

-- Final verification
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