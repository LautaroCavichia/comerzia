-- Comerzia Database Schema
-- Run this in your Neon PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personas table
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos table
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laboratorios table
CREATE TABLE laboratorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Almacenes table
CREATE TABLE almacenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    persona VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    avisado BOOLEAN DEFAULT FALSE,
    pagado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_encargos_fecha ON encargos(fecha DESC);
CREATE INDEX idx_encargos_persona ON encargos(persona);
CREATE INDEX idx_encargos_telefono ON encargos(telefono);
CREATE INDEX idx_encargos_producto ON encargos(producto);
CREATE INDEX idx_encargos_laboratorio ON encargos(laboratorio);
CREATE INDEX idx_personas_nombre ON personas(nombre);
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