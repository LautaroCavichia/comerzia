import { neon } from '@neondatabase/serverless';
import { Encargo, Persona, Producto, Laboratorio, Almacen, NewEncargoForm, UpdateEncargo } from '../types';
import { safeDbOperation } from './errorHandling';

const sql = neon(process.env.REACT_APP_DATABASE_URL || '');

// Helper function to create date without timezone adjustment
const createDateFromString = (dateString: string | null): Date => {
  if (!dateString) return new Date();
  
  // For date-only strings (YYYY-MM-DD), create date in local timezone to avoid UTC shift
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JS
  }
  
  return new Date(dateString);
};

export class DatabaseService {
  private sellingPoint: string;

  constructor(sellingPoint: string = 'default') {
    this.sellingPoint = sellingPoint;
  }

  setSellingPoint(sellingPoint: string) {
    this.sellingPoint = sellingPoint;
  }
  // Encargos
  async getEncargos(): Promise<Encargo[]> {
    const result = await sql`
      SELECT * FROM encargos 
      WHERE selling_point = ${this.sellingPoint}
      ORDER BY fecha DESC, created_at DESC
    `;
    return result.map(row => ({
      ...row,
      fecha: createDateFromString(row.fecha),
      created_at: row.created_at ? new Date(row.created_at) : new Date(),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(),
      pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
    })) as Encargo[];
  }

  async createEncargo(encargo: NewEncargoForm): Promise<Encargo> {
    return safeDbOperation(async () => {
      const result = await sql`
        INSERT INTO encargos (
          fecha, producto, laboratorio, almacen, pedido, recibido, entregado,
          persona, telefono, avisado, pagado, observaciones, selling_point
        ) VALUES (
          ${encargo.fecha}, ${encargo.producto}, ${encargo.laboratorio}, 
          ${encargo.almacen}, ${encargo.pedido}, ${encargo.recibido}, ${encargo.entregado},
          ${encargo.persona}, ${encargo.telefono}, ${encargo.avisado}, 
          ${encargo.pagado}, ${encargo.observaciones}, ${this.sellingPoint}
        ) RETURNING *
      `;
      const row = result[0];
      return {
        ...row,
        fecha: createDateFromString(row.fecha),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
      } as Encargo;
    }, 'Create encargo');
  }

  async updateEncargo(encargo: UpdateEncargo): Promise<Encargo> {
    const result = await sql`
      UPDATE encargos SET
        fecha = COALESCE(${encargo.fecha}, fecha),
        producto = COALESCE(${encargo.producto}, producto),
        laboratorio = COALESCE(${encargo.laboratorio}, laboratorio),
        almacen = COALESCE(${encargo.almacen}, almacen),
        pedido = COALESCE(${encargo.pedido}, pedido),
        recibido = COALESCE(${encargo.recibido}, recibido),
        entregado = COALESCE(${encargo.entregado}, entregado),
        persona = COALESCE(${encargo.persona}, persona),
        telefono = COALESCE(${encargo.telefono}, telefono),
        avisado = COALESCE(${encargo.avisado}, avisado),
        pagado = COALESCE(${encargo.pagado}, pagado),
        observaciones = COALESCE(${encargo.observaciones}, observaciones),
        updated_at = NOW()
      WHERE id = ${encargo.id} AND selling_point = ${this.sellingPoint}
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      fecha: createDateFromString(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
    } as Encargo;
  }

  async deleteEncargo(id: string): Promise<void> {
    await sql`DELETE FROM encargos WHERE id = ${id} AND selling_point = ${this.sellingPoint}`;
  }

  // Personas
  async getPersonas(): Promise<Persona[]> {
    const result = await sql`
      SELECT * FROM personas 
      WHERE selling_point = ${this.sellingPoint}
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      phone_notifications: row.phone_notifications || false,
      email_notifications: row.email_notifications || false
    })) as Persona[];
  }

  async createPersona(nombre: string, telefono: string): Promise<Persona> {
    const result = await sql`
      INSERT INTO personas (nombre, telefono, selling_point) 
      VALUES (${nombre}, ${telefono}, ${this.sellingPoint}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      phone_notifications: row.phone_notifications || false,
      email_notifications: row.email_notifications || false
    } as Persona;
  }

  async createPersonaWithNotifications(data: {
    nombre: string;
    telefono: string;
    email?: string;
    phone_notifications: boolean;
    email_notifications: boolean;
  }): Promise<Persona> {
    const result = await sql`
      INSERT INTO personas (
        nombre, telefono, email, phone_notifications, email_notifications, selling_point
      ) VALUES (
        ${data.nombre}, ${data.telefono}, ${data.email || null}, 
        ${data.phone_notifications}, ${data.email_notifications}, ${this.sellingPoint}
      ) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      phone_notifications: row.phone_notifications || false,
      email_notifications: row.email_notifications || false
    } as Persona;
  }

  async updatePersonaNotifications(id: string, phoneNotifications: boolean, emailNotifications: boolean): Promise<void> {
    await sql`
      UPDATE personas 
      SET phone_notifications = ${phoneNotifications}, 
          email_notifications = ${emailNotifications},
          updated_at = NOW()
      WHERE id = ${id} AND selling_point = ${this.sellingPoint}
    `;
  }

  async deletePersona(id: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const persona = await sql`
        SELECT nombre, telefono FROM personas 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (persona.length === 0) {
        throw new Error('Persona not found');
      }

      const { nombre, telefono } = persona[0];

      // Check if there are related encargos
      const relatedEncargos = await sql`
        SELECT COUNT(*) as count FROM encargos 
        WHERE (persona = ${nombre} OR telefono = ${telefono}) AND selling_point = ${this.sellingPoint}
      `;

      if (relatedEncargos[0].count > 0) {
        throw new Error(`Cannot delete persona: ${relatedEncargos[0].count} related orders exist. Delete orders first or reassign them to another person.`);
      }

      // Safe to delete persona
      await sql`DELETE FROM personas WHERE id = ${id} AND selling_point = ${this.sellingPoint}`;
      
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  async updatePersonaEmail(id: string, email: string): Promise<void> {
    await sql`
      UPDATE personas 
      SET email = ${email || null}, updated_at = NOW()
      WHERE id = ${id} AND selling_point = ${this.sellingPoint}
    `;
  }

  async updatePersonaName(id: string, newName: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const oldPersona = await sql`
        SELECT nombre, telefono FROM personas 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (oldPersona.length === 0) {
        throw new Error('Persona not found');
      }

      const oldName = oldPersona[0].nombre;
      
      // Update persona name
      await sql`
        UPDATE personas 
        SET nombre = ${newName}, updated_at = NOW()
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;

      // Update all related encargos with the new name
      await sql`
        UPDATE encargos 
        SET persona = ${newName}, updated_at = NOW()
        WHERE persona = ${oldName} AND selling_point = ${this.sellingPoint}
      `;

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  async updatePersonaPhone(id: string, newPhone: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const oldPersona = await sql`
        SELECT nombre, telefono FROM personas 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (oldPersona.length === 0) {
        throw new Error('Persona not found');
      }

      const oldPhone = oldPersona[0].telefono;
      
      // Check for duplicate phone numbers
      const existing = await sql`
        SELECT id FROM personas 
        WHERE telefono = ${newPhone} AND selling_point = ${this.sellingPoint} AND id != ${id}
      `;
      
      if (existing.length > 0) {
        throw new Error('Phone number already exists for another person');
      }

      // Update persona phone
      await sql`
        UPDATE personas 
        SET telefono = ${newPhone}, updated_at = NOW()
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;

      // Update all related encargos with the new phone
      await sql`
        UPDATE encargos 
        SET telefono = ${newPhone}, updated_at = NOW()
        WHERE telefono = ${oldPhone} AND selling_point = ${this.sellingPoint}
      `;

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  async updatePersonaComplete(id: string, data: {
    nombre?: string;
    telefono?: string;
    email?: string;
  }): Promise<void> {
    await sql`BEGIN`;
    try {
      const oldPersona = await sql`
        SELECT nombre, telefono FROM personas 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (oldPersona.length === 0) {
        throw new Error('Persona not found');
      }

      const oldName = oldPersona[0].nombre;
      const oldPhone = oldPersona[0].telefono;
      
      // Check for duplicate phone if changing
      if (data.telefono && data.telefono !== oldPhone) {
        const existing = await sql`
          SELECT id FROM personas 
          WHERE telefono = ${data.telefono} AND selling_point = ${this.sellingPoint} AND id != ${id}
        `;
        
        if (existing.length > 0) {
          throw new Error('Phone number already exists for another person');
        }
      }

      // Update persona record
      await sql`
        UPDATE personas 
        SET 
          nombre = COALESCE(${data.nombre}, nombre),
          telefono = COALESCE(${data.telefono}, telefono),
          email = COALESCE(${data.email}, email),
          updated_at = NOW()
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;

      // Update related encargos if name changed
      if (data.nombre && data.nombre !== oldName) {
        await sql`
          UPDATE encargos 
          SET persona = ${data.nombre}, updated_at = NOW()
          WHERE persona = ${oldName} AND selling_point = ${this.sellingPoint}
        `;
      }

      // Update related encargos if phone changed
      if (data.telefono && data.telefono !== oldPhone) {
        await sql`
          UPDATE encargos 
          SET telefono = ${data.telefono}, updated_at = NOW()
          WHERE telefono = ${oldPhone} AND selling_point = ${this.sellingPoint}
        `;
      }

      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  // Productos
  async getProductos(): Promise<Producto[]> {
    const result = await sql`
      SELECT * FROM productos 
      WHERE selling_point = ${this.sellingPoint}
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Producto[];
  }

  async createProducto(nombre: string): Promise<Producto> {
    const result = await sql`
      INSERT INTO productos (nombre, selling_point) 
      VALUES (${nombre}, ${this.sellingPoint}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Producto;
  }

  async deleteProducto(id: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const producto = await sql`
        SELECT nombre FROM productos 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (producto.length === 0) {
        throw new Error('Producto not found');
      }

      const { nombre } = producto[0];

      // Check if there are related encargos
      const relatedEncargos = await sql`
        SELECT COUNT(*) as count FROM encargos 
        WHERE producto = ${nombre} AND selling_point = ${this.sellingPoint}
      `;

      if (relatedEncargos[0].count > 0) {
        throw new Error(`Cannot delete product: ${relatedEncargos[0].count} related orders exist. Delete orders first or change them to use a different product.`);
      }

      // Safe to delete producto
      await sql`DELETE FROM productos WHERE id = ${id} AND selling_point = ${this.sellingPoint}`;
      
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  // Laboratorios
  async getLaboratorios(): Promise<Laboratorio[]> {
    const result = await sql`
      SELECT * FROM laboratorios 
      WHERE selling_point = ${this.sellingPoint}
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Laboratorio[];
  }

  async createLaboratorio(nombre: string): Promise<Laboratorio> {
    const result = await sql`
      INSERT INTO laboratorios (nombre, selling_point) 
      VALUES (${nombre}, ${this.sellingPoint}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Laboratorio;
  }

  async deleteLaboratorio(id: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const laboratorio = await sql`
        SELECT nombre FROM laboratorios 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (laboratorio.length === 0) {
        throw new Error('Laboratorio not found');
      }

      const { nombre } = laboratorio[0];

      // Check if there are related encargos
      const relatedEncargos = await sql`
        SELECT COUNT(*) as count FROM encargos 
        WHERE laboratorio = ${nombre} AND selling_point = ${this.sellingPoint}
      `;

      if (relatedEncargos[0].count > 0) {
        throw new Error(`Cannot delete laboratory: ${relatedEncargos[0].count} related orders exist. Delete orders first or change them to use a different laboratory.`);
      }

      // Safe to delete laboratorio
      await sql`DELETE FROM laboratorios WHERE id = ${id} AND selling_point = ${this.sellingPoint}`;
      
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  // Almacenes
  async getAlmacenes(): Promise<Almacen[]> {
    const result = await sql`
      SELECT * FROM almacenes 
      WHERE selling_point = ${this.sellingPoint}
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Almacen[];
  }

  async createAlmacen(nombre: string): Promise<Almacen> {
    const result = await sql`
      INSERT INTO almacenes (nombre, selling_point) 
      VALUES (${nombre}, ${this.sellingPoint}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Almacen;
  }

  async deleteAlmacen(id: string): Promise<void> {
    await sql`BEGIN`;
    try {
      const almacen = await sql`
        SELECT nombre FROM almacenes 
        WHERE id = ${id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (almacen.length === 0) {
        throw new Error('Almacen not found');
      }

      const { nombre } = almacen[0];

      // Check if there are related encargos
      const relatedEncargos = await sql`
        SELECT COUNT(*) as count FROM encargos 
        WHERE almacen = ${nombre} AND selling_point = ${this.sellingPoint}
      `;

      if (relatedEncargos[0].count > 0) {
        throw new Error(`Cannot delete warehouse: ${relatedEncargos[0].count} related orders exist. Delete orders first or change them to use a different warehouse.`);
      }

      // Safe to delete almacen
      await sql`DELETE FROM almacenes WHERE id = ${id} AND selling_point = ${this.sellingPoint}`;
      
      await sql`COMMIT`;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  // Find persona by phone or name with better matching
  async findPersonaByContact(telefono: string, nombre?: string): Promise<Persona | null> {
    let result;
    
    if (nombre) {
      // Try exact match on both phone and name first
      result = await sql`
        SELECT * FROM personas 
        WHERE selling_point = ${this.sellingPoint} 
        AND (telefono = ${telefono} OR nombre = ${nombre})
        ORDER BY 
          CASE WHEN telefono = ${telefono} AND nombre = ${nombre} THEN 1
               WHEN telefono = ${telefono} THEN 2
               WHEN nombre = ${nombre} THEN 3
               ELSE 4 END
        LIMIT 1
      `;
    } else {
      // Phone only search
      result = await sql`
        SELECT * FROM personas 
        WHERE telefono = ${telefono} AND selling_point = ${this.sellingPoint}
        LIMIT 1
      `;
    }

    if (result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      phone_notifications: row.phone_notifications || false,
      email_notifications: row.email_notifications || false
    } as Persona;
  }

  // Get all encargos for a specific persona (consistent lookup)
  async getEncargosForPersona(personaId: string): Promise<Encargo[]> {
    const persona = await sql`
      SELECT nombre, telefono FROM personas 
      WHERE id = ${personaId} AND selling_point = ${this.sellingPoint}
    `;

    if (persona.length === 0) return [];

    const { nombre, telefono } = persona[0];

    const result = await sql`
      SELECT * FROM encargos 
      WHERE selling_point = ${this.sellingPoint} 
      AND (persona = ${nombre} OR telefono = ${telefono})
      ORDER BY fecha DESC, created_at DESC
    `;

    return result.map(row => ({
      ...row,
      fecha: createDateFromString(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
    })) as Encargo[];
  }

  // Data consistency check and repair
  async checkDataConsistency(): Promise<{
    orphanedEncargos: number;
    inconsistentPersonas: number;
    duplicatePhones: number;
  }> {
    // Find encargos with no matching persona
    const orphanedEncargos = await sql`
      SELECT COUNT(*) as count FROM encargos e
      LEFT JOIN personas p ON (e.persona = p.nombre OR e.telefono = p.telefono) 
        AND e.selling_point = p.selling_point
      WHERE e.selling_point = ${this.sellingPoint} AND p.id IS NULL
    `;

    // Find personas referenced in encargos but with different data
    const inconsistentPersonas = await sql`
      SELECT COUNT(DISTINCT e.persona) as count FROM encargos e
      JOIN personas p ON e.telefono = p.telefono AND e.selling_point = p.selling_point
      WHERE e.selling_point = ${this.sellingPoint} AND e.persona != p.nombre
    `;

    // Find duplicate phone numbers
    const duplicatePhones = await sql`
      SELECT COUNT(*) as count FROM (
        SELECT telefono FROM personas 
        WHERE selling_point = ${this.sellingPoint}
        GROUP BY telefono 
        HAVING COUNT(*) > 1
      ) as dups
    `;

    return {
      orphanedEncargos: orphanedEncargos[0].count,
      inconsistentPersonas: inconsistentPersonas[0].count,
      duplicatePhones: duplicatePhones[0].count
    };
  }

  // Repair data inconsistencies
  async repairDataInconsistencies(): Promise<{ fixed: number; errors: string[] }> {
    await sql`BEGIN`;
    let fixed = 0;
    const errors: string[] = [];

    try {
      // Fix inconsistent persona names in encargos
      const inconsistentRecords = await sql`
        SELECT DISTINCT e.persona as old_name, p.nombre as correct_name, e.telefono
        FROM encargos e
        JOIN personas p ON e.telefono = p.telefono AND e.selling_point = p.selling_point
        WHERE e.selling_point = ${this.sellingPoint} AND e.persona != p.nombre
      `;

      for (const record of inconsistentRecords) {
        await sql`
          UPDATE encargos 
          SET persona = ${record.correct_name}, updated_at = NOW()
          WHERE telefono = ${record.telefono} 
          AND persona = ${record.old_name} 
          AND selling_point = ${this.sellingPoint}
        `;
        fixed++;
      }

      await sql`COMMIT`;
      return { fixed, errors };
    } catch (error) {
      await sql`ROLLBACK`;
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { fixed: 0, errors };
    }
  }

  // Update encargo with persona/telefono cascade
  async updateEncargoWithPersonaCascade(encargo: UpdateEncargo): Promise<Encargo> {
    await sql`BEGIN`;
    try {
      // Get the current encargo data
      const currentEncargo = await sql`
        SELECT * FROM encargos 
        WHERE id = ${encargo.id} AND selling_point = ${this.sellingPoint}
      `;
      
      if (currentEncargo.length === 0) {
        throw new Error('Encargo not found');
      }

      const current = currentEncargo[0];
      
      // Check if persona or telefono are being updated
      const isPersonaUpdate = encargo.persona && encargo.persona !== current.persona;
      const isTelefonoUpdate = encargo.telefono && encargo.telefono !== current.telefono;

      if (isPersonaUpdate || isTelefonoUpdate) {
        // Find the persona record that matches current telefono
        const personaRecord = await sql`
          SELECT * FROM personas 
          WHERE telefono = ${current.telefono} AND selling_point = ${this.sellingPoint}
          LIMIT 1
        `;

        if (personaRecord.length > 0) {
          const persona = personaRecord[0];
          
          // Check if telefono is being updated to a different existing persona
          if (isTelefonoUpdate) {
            const existingPersona = await sql`
              SELECT id FROM personas 
              WHERE telefono = ${encargo.telefono} AND selling_point = ${this.sellingPoint}
            `;
            
            if (existingPersona.length > 0) {
              throw new Error('Cannot update telefono: number already exists for another person');
            }
          }
          
          // Update the persona record
          const updateData: any = {};
          if (isPersonaUpdate) updateData.nombre = encargo.persona;
          if (isTelefonoUpdate) updateData.telefono = encargo.telefono;
          
          await sql`
            UPDATE personas 
            SET 
              nombre = COALESCE(${updateData.nombre}, nombre),
              telefono = COALESCE(${updateData.telefono}, telefono),
              updated_at = NOW()
            WHERE id = ${persona.id} AND selling_point = ${this.sellingPoint}
          `;

          // If telefono changed, update all related encargos
          if (isTelefonoUpdate) {
            await sql`
              UPDATE encargos 
              SET telefono = ${encargo.telefono}, updated_at = NOW()
              WHERE telefono = ${current.telefono} AND selling_point = ${this.sellingPoint}
            `;
          }

          // If persona name changed, update all related encargos
          if (isPersonaUpdate) {
            await sql`
              UPDATE encargos 
              SET persona = ${encargo.persona}, updated_at = NOW()
              WHERE persona = ${current.persona} AND selling_point = ${this.sellingPoint}
            `;
          }
        } else if (isPersonaUpdate || isTelefonoUpdate) {
          // No existing persona found, create one if we have both name and phone
          const newPersonaName = encargo.persona || current.persona;
          const newPersonaTelefono = encargo.telefono || current.telefono;
          
          if (newPersonaName && newPersonaTelefono) {
            await sql`
              INSERT INTO personas (nombre, telefono, selling_point)
              VALUES (${newPersonaName}, ${newPersonaTelefono}, ${this.sellingPoint})
            `;
          }
        }
      }

      // Update the encargo record
      const result = await sql`
        UPDATE encargos SET
          fecha = COALESCE(${encargo.fecha}, fecha),
          producto = COALESCE(${encargo.producto}, producto),
          laboratorio = COALESCE(${encargo.laboratorio}, laboratorio),
          almacen = COALESCE(${encargo.almacen}, almacen),
          pedido = COALESCE(${encargo.pedido}, pedido),
          recibido = COALESCE(${encargo.recibido}, recibido),
          entregado = COALESCE(${encargo.entregado}, entregado),
          persona = COALESCE(${encargo.persona}, persona),
          telefono = COALESCE(${encargo.telefono}, telefono),
          avisado = COALESCE(${encargo.avisado}, avisado),
          pagado = COALESCE(${encargo.pagado}, pagado),
          observaciones = COALESCE(${encargo.observaciones}, observaciones),
          updated_at = NOW()
        WHERE id = ${encargo.id} AND selling_point = ${this.sellingPoint}
        RETURNING *
      `;

      await sql`COMMIT`;
      
      const row = result[0];
      return {
        ...row,
        fecha: createDateFromString(row.fecha),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
      } as Encargo;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }

  // Search functionality (improved)
  async searchEncargos(query: string): Promise<Encargo[]> {
    const result = await sql`
      SELECT * FROM encargos 
      WHERE selling_point = ${this.sellingPoint} AND (
        persona ILIKE ${`%${query}%`} OR
        telefono ILIKE ${`%${query}%`} OR
        producto ILIKE ${`%${query}%`} OR
        laboratorio ILIKE ${`%${query}%`} OR
        observaciones ILIKE ${`%${query}%`}
      )
      ORDER BY fecha DESC, created_at DESC
    `;
    return result.map(row => ({
      ...row,
      fecha: createDateFromString(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      pagado: typeof row.pagado === 'string' ? parseFloat(row.pagado) || 0 : (row.pagado || 0)
    })) as Encargo[];
  }
}

export const db = new DatabaseService();