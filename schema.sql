-- Comerzia Database Schema
-- Run this in your Neon PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personas table
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    selling_point VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(telefono, selling_point)
);

-- Productos table
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    selling_point VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nombre, selling_point)
);

-- Laboratorios table
CREATE TABLE laboratorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    selling_point VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nombre, selling_point)
);

-- Almacenes table
CREATE TABLE almacenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    selling_point VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nombre, selling_point)
);

-- Encargos table
CREATE TABLE encargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    producto VARCHAR(255) NOT NULL,
    laboratorio VARCHAR(255) NOT NULL,
    almacen VARCHAR(255) NOT NULL,
    pedido BOOLEAN DEFAULT FALSE,
    recibido BOOLEAN DEFAULT FALSE,
    entregado BOOLEAN DEFAULT FALSE,
    persona VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    avisado BOOLEAN DEFAULT FALSE,
    pagado DECIMAL(10,2) DEFAULT 0.00,
    observaciones TEXT,
    selling_point VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_encargos_fecha ON encargos(fecha DESC);
CREATE INDEX idx_encargos_persona ON encargos(persona);
CREATE INDEX idx_encargos_telefono ON encargos(telefono);
CREATE INDEX idx_encargos_producto ON encargos(producto);
CREATE INDEX idx_encargos_laboratorio ON encargos(laboratorio);
CREATE INDEX idx_encargos_selling_point ON encargos(selling_point);
CREATE INDEX idx_personas_nombre ON personas(nombre);
CREATE INDEX idx_personas_selling_point ON personas(selling_point);
CREATE INDEX idx_productos_selling_point ON productos(selling_point);
CREATE INDEX idx_laboratorios_selling_point ON laboratorios(selling_point);
CREATE INDEX idx_almacenes_selling_point ON almacenes(selling_point);
CREATE INDEX idx_personas_telefono ON personas(telefono);

-- Sample data for almacenes (common storage locations)
INSERT INTO almacenes (nombre) VALUES
    ('Almacén Principal'),
    ('Almacén Secundario'),
    ('Refrigerado'),
    ('Farmacia'),
    ('Depósito');

-- Sample data for testing (optional)
INSERT INTO productos (nombre) VALUES
    ('Lentes de Contacto'),
    ('Armazón Oftálmico'),
    ('Lentes de Sol'),
    ('Cristales Progresivos');

INSERT INTO laboratorios (nombre) VALUES
    ('Laboratorio Central'),
    ('Óptica Express'),
    ('Visión Total');

INSERT INTO personas (nombre, telefono) VALUES
    ('María González', '+34612345678'),
    ('Juan Pérez', '+34623456789');