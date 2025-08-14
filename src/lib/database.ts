import { neon } from '@neondatabase/serverless';
import { Encargo, Persona, Producto, Laboratorio, Almacen, NewEncargo, UpdateEncargo } from '../types';

const sql = neon(process.env.REACT_APP_DATABASE_URL || '');

export class DatabaseService {
  // Encargos
  async getEncargos(): Promise<Encargo[]> {
    const result = await sql`
      SELECT * FROM encargos 
      ORDER BY fecha DESC, created_at DESC
    `;
    return result.map(row => ({
      ...row,
      fecha: new Date(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    })) as Encargo[];
  }

  async createEncargo(encargo: NewEncargo): Promise<Encargo> {
    const result = await sql`
      INSERT INTO encargos (
        fecha, producto, laboratorio, almacen, pedido, recibido,
        persona, telefono, avisado, pagado, observaciones
      ) VALUES (
        ${encargo.fecha}, ${encargo.producto}, ${encargo.laboratorio}, 
        ${encargo.almacen}, ${encargo.pedido}, ${encargo.recibido},
        ${encargo.persona}, ${encargo.telefono}, ${encargo.avisado}, 
        ${encargo.pagado}, ${encargo.observaciones}
      ) RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      fecha: new Date(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    } as Encargo;
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
        persona = COALESCE(${encargo.persona}, persona),
        telefono = COALESCE(${encargo.telefono}, telefono),
        avisado = COALESCE(${encargo.avisado}, avisado),
        pagado = COALESCE(${encargo.pagado}, pagado),
        observaciones = COALESCE(${encargo.observaciones}, observaciones),
        updated_at = NOW()
      WHERE id = ${encargo.id}
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      fecha: new Date(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    } as Encargo;
  }

  async deleteEncargo(id: string): Promise<void> {
    await sql`DELETE FROM encargos WHERE id = ${id}`;
  }

  // Personas
  async getPersonas(): Promise<Persona[]> {
    const result = await sql`
      SELECT * FROM personas 
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    })) as Persona[];
  }

  async createPersona(nombre: string, telefono: string): Promise<Persona> {
    const result = await sql`
      INSERT INTO personas (nombre, telefono) 
      VALUES (${nombre}, ${telefono}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    } as Persona;
  }

  // Productos
  async getProductos(): Promise<Producto[]> {
    const result = await sql`
      SELECT * FROM productos 
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Producto[];
  }

  async createProducto(nombre: string): Promise<Producto> {
    const result = await sql`
      INSERT INTO productos (nombre) 
      VALUES (${nombre}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Producto;
  }

  // Laboratorios
  async getLaboratorios(): Promise<Laboratorio[]> {
    const result = await sql`
      SELECT * FROM laboratorios 
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Laboratorio[];
  }

  async createLaboratorio(nombre: string): Promise<Laboratorio> {
    const result = await sql`
      INSERT INTO laboratorios (nombre) 
      VALUES (${nombre}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Laboratorio;
  }

  // Almacenes
  async getAlmacenes(): Promise<Almacen[]> {
    const result = await sql`
      SELECT * FROM almacenes 
      ORDER BY nombre ASC
    `;
    return result.map(row => ({
      ...row,
      created_at: new Date(row.created_at)
    })) as Almacen[];
  }

  async createAlmacen(nombre: string): Promise<Almacen> {
    const result = await sql`
      INSERT INTO almacenes (nombre) 
      VALUES (${nombre}) 
      RETURNING *
    `;
    const row = result[0];
    return {
      ...row,
      created_at: new Date(row.created_at)
    } as Almacen;
  }

  // Search functionality
  async searchEncargos(query: string): Promise<Encargo[]> {
    const result = await sql`
      SELECT * FROM encargos 
      WHERE 
        persona ILIKE ${`%${query}%`} OR
        telefono ILIKE ${`%${query}%`} OR
        producto ILIKE ${`%${query}%`} OR
        laboratorio ILIKE ${`%${query}%`} OR
        observaciones ILIKE ${`%${query}%`}
      ORDER BY fecha DESC, created_at DESC
    `;
    return result.map(row => ({
      ...row,
      fecha: new Date(row.fecha),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    })) as Encargo[];
  }
}

export const db = new DatabaseService();