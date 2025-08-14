# Comerzia

Una aplicación web en español para registrar y gestionar encargos con tabla principal, autocompletado de personas/teléfonos y catálogos.

## Características

- ✅ **Interfaz en español** - Todos los textos y placeholders en español
- ✅ **Gestión de encargos** - Tabla con 11 columnas según especificación
- ✅ **Edición inline** - Editar directamente en la tabla con Enter/Esc
- ✅ **Búsqueda global** - Buscar por persona, teléfono, producto o laboratorio
- ✅ **Autocompletado** - Personas y teléfonos se sincronizan automáticamente
- ✅ **Catálogos dinámicos** - Agregar productos, laboratorios y personas sobre la marcha
- ✅ **Normalización E.164** - Teléfonos se normalizan automáticamente
- ✅ **Exportación CSV** - Exportar datos filtrados a Excel/CSV
- ✅ **Responsive** - Optimizado para móviles y tablets
- ✅ **Deploy estático** - Compatible con Netlify sin backend

## Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Base de datos**: Neon PostgreSQL (serverless)
- **Validación**: Zod + React Hook Form
- **Fechas**: React DatePicker
- **Teléfonos**: libphonenumber-js
- **Deploy**: Netlify (estático)

## Estructura de la Tabla

Las columnas de la tabla principal son (en este orden):

1. **FECHA** - Selector de fecha con calendar dropdown
2. **PRODUCTO** - Dropdown con opción "Nuevo…"
3. **LABORATORIO** - Dropdown con autocompletado y opción "Nuevo…"
4. **ALMACÉN** - Dropdown de catálogo
5. **PEDIDO** - Toggle Sí/No
6. **RECIBIDO** - Toggle Sí/No
7. **PERSONA** - Dropdown conectado a DB con autocompletado
8. **TELÉFONO** - Autocompletado sincronizado con PERSONA
9. **AVISADO** - Toggle Sí/No
10. **PAGADO** - Toggle Sí/No
11. **OBSERVACIONES** - Textarea expandible

## Configuración

### 1. Instalar dependencias

```bash
yarn install
```

### 2. Configurar base de datos Neon

1. Crear cuenta en [Neon](https://neon.tech/)
2. Crear nuevo proyecto PostgreSQL
3. Ejecutar el schema SQL:

```sql
-- Copiar y ejecutar todo el contenido de schema.sql
```

4. Copiar la URL de conexión

### 3. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env` y agregar:

```
REACT_APP_DATABASE_URL=postgresql://[usuario]:[password]@[endpoint]/[dbname]?sslmode=require
```

### 4. Desarrollo local

```bash
yarn start
```

La aplicación estará disponible en http://localhost:3000

## Deployment en Netlify

### Opción 1: Deploy manual

```bash
yarn build
```

Subir la carpeta `build/` a Netlify.

### Opción 2: Deploy automático

1. Conectar repositorio a Netlify
2. Configurar variables de entorno en Netlify:
   - `REACT_APP_DATABASE_URL`
3. El deploy será automático con cada push

La configuración ya está lista en `netlify.toml`.

## Uso de la Aplicación

### Agregar encargo

1. Clic en **"Nuevo Encargo"**
2. Llenar formulario (campos obligatorios marcados con *)
3. Para personas nuevas: usar "Nueva persona..." y agregar teléfono
4. Para productos/laboratorios nuevos: usar "Nuevo..." en los dropdowns
5. Los teléfonos se normalizan automáticamente a formato E.164

### Editar encargos

- **Edición inline**: Clic en cualquier celda → Enter para guardar, Esc para cancelar
- **Toggles**: Clic directo en Sí/No para cambiar estado
- **Observaciones**: Ctrl+Enter para guardar en modo multilínea

### Buscar y filtrar

- Escribir en la barra de búsqueda (busca en persona, teléfono, producto, laboratorio)
- La búsqueda es en tiempo real

### Exportar datos

- Clic en **"Exportar CSV"** para descargar los datos filtrados
- Compatible con Excel y hojas de cálculo

## Arquitectura

```
src/
├── components/          # Componentes React
│   ├── EncargosView.tsx    # Vista principal
│   ├── EncargosTable.tsx   # Tabla de encargos
│   ├── SearchBar.tsx       # Barra de búsqueda
│   ├── AddEncargoModal.tsx # Modal para agregar
│   ├── EditableCell.tsx    # Celda editable inline
│   └── ToggleCell.tsx      # Toggle Sí/No
├── lib/                 # Lógica de negocio
│   ├── database.ts         # Cliente de base de datos
│   └── phoneUtils.ts       # Utilidades de teléfono
├── types/               # Definiciones TypeScript
│   └── index.ts           # Interfaces y tipos
└── App.tsx             # Componente principal
```

## Base de Datos

### Tablas principales

- **encargos** - Tabla principal con los 11 campos
- **personas** - Catálogo de personas con teléfonos
- **productos** - Catálogo de productos
- **laboratorios** - Catálogo de laboratorios
- **almacenes** - Catálogo de almacenes (predefinidos)

### Funcionalidades SQL

- UUIDs como claves primarias
- Índices para búsquedas rápidas
- Timestamps automáticos
- Búsqueda de texto completo (ILIKE)

## Personalización

### Colores

El color primario se define en `tailwind.config.js`:

```javascript
colors: {
  primary: '#0EA5E9', // Cambiar aquí
},
```

### Catálogo de almacenes

Editar `schema.sql` para modificar los almacenes predeterminados.

## Limitaciones Conocidas

- **Sin backend**: Toda la lógica está en el frontend
- **CORS**: Neon debe permitir conexiones desde el dominio
- **Seguridad**: La URL de DB está expuesta (usar variables de entorno de Netlify)
- **Concurrencia**: Sin control de versiones para edición simultánea

## Comandos Disponibles

### `yarn start`

Ejecuta la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

### `yarn build`

Construye la aplicación para producción en la carpeta `build/`.\
Optimiza el build para el mejor rendimiento.

### `yarn test`

Ejecuta las pruebas en modo interactivo.

## Soporte

Para problemas o sugerencias, revisar el código fuente o crear un issue.

## Licencia

Código abierto para uso comercial y personal.
