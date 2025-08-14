import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { db } from '../lib/database';
import { Persona, Producto, Laboratorio, Almacen } from '../types';
import "react-datepicker/dist/react-datepicker.css";

const encargoSchema = z.object({
  fecha: z.date(),
  producto: z.string().min(1, 'El producto es requerido'),
  laboratorio: z.string().min(1, 'El laboratorio es requerido'),
  almacen: z.string().min(1, 'El almacén es requerido'),
  pedido: z.boolean(),
  recibido: z.boolean(),
  persona: z.string().min(1, 'La persona es requerida'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  avisado: z.boolean(),
  pagado: z.boolean(),
  observaciones: z.string().optional()
});

type EncargoFormData = z.infer<typeof encargoSchema>;

interface AddEncargoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEncargoModal: React.FC<AddEncargoModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EncargoFormData>({
    resolver: zodResolver(encargoSchema),
    defaultValues: {
      fecha: new Date(),
      pedido: false,
      recibido: false,
      avisado: false,
      pagado: false
    }
  });

  const watchedPersona = watch('persona');
  const watchedFecha = watch('fecha');

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (watchedPersona) {
      const persona = personas.find(p => p.nombre === watchedPersona);
      if (persona) {
        setValue('telefono', persona.telefono);
      }
    }
  }, [watchedPersona, personas, setValue]);

  const loadCatalogs = async () => {
    try {
      const [personasData, productosData, laboratoriosData, almacenesData] = await Promise.all([
        db.getPersonas(),
        db.getProductos(),
        db.getLaboratorios(),
        db.getAlmacenes()
      ]);

      setPersonas(personasData);
      setProductos(productosData);
      setLaboratorios(laboratoriosData);
      setAlmacenes(almacenesData);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const normalizePhoneNumber = (phone: string): string => {
    try {
      if (isValidPhoneNumber(phone, 'ES')) {
        const phoneNumber = parsePhoneNumber(phone, 'ES');
        return phoneNumber.format('E.164');
      }
    } catch (error) {
      console.error('Error parsing phone number:', error);
    }
    return phone;
  };

  const onSubmit = async (data: EncargoFormData) => {
    setLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(data.telefono);
      
      // Auto-create non-existing items
      const existingPersona = personas.find(p => p.nombre === data.persona);
      if (!existingPersona) {
        await db.createPersona(data.persona, normalizedPhone);
      }

      const existingProducto = productos.find(p => p.nombre === data.producto);
      if (!existingProducto) {
        await db.createProducto(data.producto);
      }

      const existingLaboratorio = laboratorios.find(l => l.nombre === data.laboratorio);
      if (!existingLaboratorio) {
        await db.createLaboratorio(data.laboratorio);
      }

      const existingAlmacen = almacenes.find(a => a.nombre === data.almacen);
      if (!existingAlmacen) {
        await db.createAlmacen(data.almacen);
      }
      
      await db.createEncargo({
        ...data,
        telefono: normalizedPhone
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating encargo:', error);
      alert('Error al crear el encargo');
    } finally {
      setLoading(false);
    }
  };

  const handleNewItem = async (type: 'producto' | 'laboratorio' | 'persona' | 'almacen') => {
    const name = prompt(`Ingrese el nombre del nuevo ${type}:`);
    if (!name) return;

    try {
      if (type === 'producto') {
        await db.createProducto(name);
        const productos = await db.getProductos();
        setProductos(productos);
        setValue('producto', name);
      } else if (type === 'laboratorio') {
        await db.createLaboratorio(name);
        const laboratorios = await db.getLaboratorios();
        setLaboratorios(laboratorios);
        setValue('laboratorio', name);
      } else if (type === 'persona') {
        const telefono = prompt('Ingrese el teléfono:');
        if (!telefono) return;
        
        const normalizedPhone = normalizePhoneNumber(telefono);
        await db.createPersona(name, normalizedPhone);
        const personas = await db.getPersonas();
        setPersonas(personas);
        setValue('persona', name);
        setValue('telefono', normalizedPhone);
      } else if (type === 'almacen') {
        await db.createAlmacen(name);
        const almacenes = await db.getAlmacenes();
        setAlmacenes(almacenes);
        setValue('almacen', name);
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      alert(`Error al crear ${type}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transform bg-white shadow-xl rounded-xl border animate-scale-in">
          <div className="bg-white px-6 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Nuevo Encargo</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
            <div className="form-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Fecha *
                </label>
                <DatePicker
                  selected={watchedFecha}
                  onChange={(date: Date | null) => date && setValue('fecha', date)}
                  dateFormat="dd/MM/yyyy"
                  className="input-field w-full"
                />
                {errors.fecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Producto *
                </label>
                <div className="flex">
                  <input
                    {...register('producto')}
                    list="productos"
                    className="flex-1 input-field rounded-l-lg rounded-r-none border-r-0"
                    placeholder="Escribir o seleccionar..."
                  />
                  <datalist id="productos">
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.nombre} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => handleNewItem('producto')}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-primary-50 hover:border-primary-200 text-sm transition-all duration-200 ease-smooth"
                  >
                    Nuevo...
                  </button>
                </div>
                {errors.producto && (
                  <p className="mt-1 text-sm text-red-600">{errors.producto.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Laboratorio *
                </label>
                <div className="flex">
                  <input
                    {...register('laboratorio')}
                    list="laboratorios"
                    className="flex-1 input-field rounded-l-lg rounded-r-none border-r-0"
                    placeholder="Escribir o seleccionar..."
                  />
                  <datalist id="laboratorios">
                    {laboratorios.map(laboratorio => (
                      <option key={laboratorio.id} value={laboratorio.nombre} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => handleNewItem('laboratorio')}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-primary-50 hover:border-primary-200 text-sm transition-all duration-200 ease-smooth"
                  >
                    Nuevo...
                  </button>
                </div>
                {errors.laboratorio && (
                  <p className="mt-1 text-sm text-red-600">{errors.laboratorio.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Almacén *
                </label>
                <div className="flex">
                  <input
                    {...register('almacen')}
                    list="almacenes"
                    className="flex-1 input-field rounded-l-lg rounded-r-none border-r-0"
                    placeholder="Escribir o seleccionar..."
                  />
                  <datalist id="almacenes">
                    {almacenes.map(almacen => (
                      <option key={almacen.id} value={almacen.nombre} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => handleNewItem('almacen')}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-primary-50 hover:border-primary-200 text-sm transition-all duration-200 ease-smooth"
                  >
                    Nuevo...
                  </button>
                </div>
                {errors.almacen && (
                  <p className="mt-1 text-sm text-red-600">{errors.almacen.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Persona *
                </label>
                <div className="flex">
                  <input
                    {...register('persona')}
                    list="personas"
                    className="flex-1 input-field rounded-l-lg rounded-r-none border-r-0"
                    placeholder="Escribir o seleccionar..."
                  />
                  <datalist id="personas">
                    {personas.map(persona => (
                      <option key={persona.id} value={persona.nombre} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={() => handleNewItem('persona')}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-primary-50 hover:border-primary-200 text-sm transition-all duration-200 ease-smooth"
                  >
                    Nueva...
                  </button>
                </div>
                {errors.persona && (
                  <p className="mt-1 text-sm text-red-600">{errors.persona.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Teléfono *
                </label>
                <input
                  {...register('telefono')}
                  type="tel"
                  placeholder="+34612345678"
                  className="input-field w-full"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
                )}
              </div>
              </div>

              <div>
                <label className="form-label">
                Observaciones
              </label>
              <textarea
                {...register('observaciones')}
                rows={3}
                placeholder="Información adicional..."
                className="input-field w-full"
              />
            </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  {...register('pedido')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-colors duration-200"
                />
                <span className="ml-2 text-sm text-gray-700">Pedido</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('recibido')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-colors duration-200"
                />
                <span className="ml-2 text-sm text-gray-700">Recibido</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('avisado')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-colors duration-200"
                />
                <span className="ml-2 text-sm text-gray-700">Avisado</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('pagado')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 transition-colors duration-200"
                />
                <span className="ml-2 text-sm text-gray-700">Pagado</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Encargo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};