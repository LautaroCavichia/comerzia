export interface Encargo {
  id: string;
  fecha: Date;
  producto: string;
  laboratorio: string;
  almacen: string;
  pedido: boolean;
  recibido: boolean;
  persona: string;
  telefono: string;
  avisado: boolean;
  pagado: boolean;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Persona {
  id: string;
  nombre: string;
  telefono: string;
  created_at: Date;
  updated_at: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  created_at: Date;
}

export interface Laboratorio {
  id: string;
  nombre: string;
  created_at: Date;
}

export interface Almacen {
  id: string;
  nombre: string;
  created_at: Date;
}

export type NewEncargo = Omit<Encargo, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEncargo = Partial<NewEncargo> & { id: string };