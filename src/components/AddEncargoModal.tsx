import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import { useDatabase } from '../context/DatabaseContext';
import { Persona, Producto, Laboratorio, Almacen } from '../types';
import { validateEncargoForm, checkPotentialDuplicate, sanitizeInput } from '../lib/validation';
import "react-datepicker/dist/react-datepicker.css";

const encargoSchema = z.object({
  fecha: z.date(),
  producto: z.string().min(1, 'El producto es requerido'),
  laboratorio: z.string().optional(),
  almacen: z.string().optional(),
  pedido: z.boolean(),
  recibido: z.boolean(),
  entregado: z.boolean(),
  persona: z.string().min(1, 'La persona es requerida'),
  telefono: z.string().optional(),
  email: z.string().optional(),
  phone_notifications: z.boolean(),
  email_notifications: z.boolean(),
  avisado: z.boolean(),
  pagado: z.number().min(0, 'El precio debe ser positivo'),
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
  const { db } = useDatabase();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
      entregado: false,
      avisado: false,
      pagado: 0,
      email: '',
      phone_notifications: false,
      email_notifications: false
    }
  });

  const watchedPersona = watch('persona');
  const watchedFecha = watch('fecha');

  const loadCatalogs = useCallback(async () => {
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
  }, [db]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (watchedPersona) {
      const persona = personas.find(p => p.nombre === watchedPersona);
      if (persona) {
        setValue('telefono', persona.telefono || '');
        setValue('email', persona.email || '');
        setValue('phone_notifications', persona.phone_notifications || false);
        setValue('email_notifications', persona.email_notifications || false);
      }
    }
  }, [watchedPersona, personas, setValue]);

  const normalizePhoneNumber = (phone: string): string => {
    try {
      // Simply clean and format Spanish phone numbers without international prefix
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      if (cleaned.match(/^[679]\d{8}$/)) {
        // Valid Spanish mobile/landline format
        return cleaned;
      }
      // If it starts with +34, remove it
      if (cleaned.startsWith('+34')) {
        const withoutPrefix = cleaned.substring(3);
        if (withoutPrefix.match(/^[679]\d{8}$/)) {
          return withoutPrefix;
        }
      }
    } catch (error) {
      console.error('Error parsing phone number:', error);
    }
    return phone;
  };

  const onSubmit = async (data: EncargoFormData) => {
    setLoading(true);
    try {
      // Sanitize all text inputs and convert empty strings to null
      const sanitizedData = {
        ...data,
        producto: sanitizeInput(data.producto),
        laboratorio: data.laboratorio && data.laboratorio.trim() ? sanitizeInput(data.laboratorio) : null,
        almacen: data.almacen && data.almacen.trim() ? sanitizeInput(data.almacen) : null,
        persona: sanitizeInput(data.persona),
        telefono: data.telefono && data.telefono.trim() ? sanitizeInput(data.telefono) : null,
        observaciones: data.observaciones ? sanitizeInput(data.observaciones) : undefined
      };

      // Additional validation using our custom validators
      const validation = validateEncargoForm(sanitizedData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        alert(`Error de validación: ${firstError}`);
        setLoading(false);
        return;
      }

      const normalizedPhone = sanitizedData.telefono ? normalizePhoneNumber(sanitizedData.telefono) : null;
      
      // Check for potential duplicates
      const existingOrders = await db.getEncargos();
      const potentialDuplicate = checkPotentialDuplicate(
        {
          fecha: sanitizedData.fecha,
          producto: sanitizedData.producto,
          persona: sanitizedData.persona,
          telefono: normalizedPhone
        },
        existingOrders
      );

      if (potentialDuplicate) {
        const confirmDuplicate = window.confirm(
          `⚠️ POSIBLE DUPLICADO DETECTADO\n\nYa existe un pedido similar:\n` +
          `• Producto: ${sanitizedData.producto}\n` +
          `• Cliente: ${sanitizedData.persona}\n` +
          `• Fecha: ${sanitizedData.fecha.toLocaleDateString()}\n\n` +
          `¿Estás seguro de que quieres crear este pedido duplicado?`
        );
        
        if (!confirmDuplicate) {
          setLoading(false);
          return;
        }
      }
      
      // Auto-create non-existing items with sanitized data
      const existingPersona = personas.find(p => p.nombre === sanitizedData.persona);
      if (!existingPersona) {
        try {
          await db.createPersonaWithNotifications({
            nombre: sanitizedData.persona,
            telefono: normalizedPhone,
            email: sanitizedData.email || undefined,
            phone_notifications: sanitizedData.phone_notifications,
            email_notifications: sanitizedData.email_notifications && !!sanitizedData.email
          });
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            // Person exists with this phone, continue
          } else {
            throw error;
          }
        }
      } else if (sanitizedData.email || sanitizedData.phone_notifications || sanitizedData.email_notifications) {
        // Update existing persona with email and notification preferences if provided
        try {
          if (sanitizedData.email && sanitizedData.email !== existingPersona.email) {
            await db.updatePersonaEmail(existingPersona.id, sanitizedData.email);
          }
          await db.updatePersonaNotifications(
            existingPersona.id,
            sanitizedData.phone_notifications,
            sanitizedData.email_notifications && !!sanitizedData.email
          );
        } catch (error) {
          console.warn('Error updating persona preferences:', error);
          // Continue with encargo creation even if persona update fails
        }
      }

      const existingProducto = productos.find(p => p.nombre === sanitizedData.producto);
      if (!existingProducto) {
        await db.createProducto(sanitizedData.producto);
      }

      if (sanitizedData.laboratorio) {
        const existingLaboratorio = laboratorios.find(l => l.nombre === sanitizedData.laboratorio);
        if (!existingLaboratorio) {
          await db.createLaboratorio(sanitizedData.laboratorio);
        }
      }

      if (sanitizedData.almacen) {
        const existingAlmacen = almacenes.find(a => a.nombre === sanitizedData.almacen);
        if (!existingAlmacen) {
          await db.createAlmacen(sanitizedData.almacen);
        }
      }
      
      await db.createEncargo({
        ...sanitizedData,
        telefono: normalizedPhone
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating encargo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear el encargo: ${errorMessage}`);
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
        const telefono = prompt('Ingrese el teléfono (opcional):');
        
        const email = prompt('Ingrese el email (opcional):');
        const phoneNotifications = false; // Phone notifications disabled (coming soon)
        const emailNotifications = !!email && window.confirm('¿Activar notificaciones por email?');
        
        const normalizedPhone = telefono ? normalizePhoneNumber(telefono) : null;
        await db.createPersonaWithNotifications({
          nombre: name,
          telefono: normalizedPhone,
          email: email || undefined,
          phone_notifications: phoneNotifications,
          email_notifications: emailNotifications
        });
        const personas = await db.getPersonas();
        setPersonas(personas);
        setValue('persona', name);
        setValue('telefono', normalizedPhone || '');
        setValue('email', email || '');
        setValue('phone_notifications', phoneNotifications);
        setValue('email_notifications', emailNotifications);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="modal-content relative w-full max-w-5xl h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-6 border-b border-gray-200/50 bg-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-stone-800">Nuevo Encargo</h2>
              <p className="text-sm text-stone-600 font-light mt-1">Complete la información del encargo</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-gray-100/80 transition-colors group"
              type="button"
            >
              <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 sm:px-8 py-8">
            
            {/* Required Fields Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-light text-stone-800">Campos Obligatorios</h3>
              </div>
              
              {/* Date and Product Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-red-500 mr-1">*</span>
                    Fecha
                  </label>
                  <DatePicker
                    selected={watchedFecha}
                    onChange={(date: Date | null) => date && setValue('fecha', date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-4 py-3.5 bg-white/70 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-light backdrop-blur-sm"
                    placeholderText="Seleccionar fecha"
                  />
                  {errors.fecha && (
                    <p className="text-xs text-red-500">{errors.fecha.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-red-500 mr-1">*</span>
                    Producto
                  </label>
                  <div className="relative">
                    <input
                      {...register('producto')}
                      list="productos"
                      className="w-full px-4 py-3.5 pr-20 bg-white/70 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-light backdrop-blur-sm"
                      placeholder="Escribir o seleccionar producto"
                    />
                    <datalist id="productos">
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.nombre} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => handleNewItem('producto')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-light text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 rounded-lg transition-colors"
                    >
                      + Nuevo
                    </button>
                  </div>
                  {errors.producto && (
                    <p className="text-xs text-red-500">{errors.producto.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-red-500 mr-1">*</span>
                    Persona
                  </label>
                  <div className="relative">
                    <input
                      {...register('persona')}
                      list="personas"
                      className="w-full px-4 py-3.5 pr-20 bg-white/70 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-sm font-light backdrop-blur-sm"
                      placeholder="Escribir o seleccionar persona"
                    />
                    <datalist id="personas">
                      {personas.map(persona => (
                        <option key={persona.id} value={persona.nombre} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => handleNewItem('persona')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-light text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 rounded-lg transition-colors"
                    >
                      + Nueva
                    </button>
                  </div>
                  {errors.persona && (
                    <p className="text-xs text-red-500">{errors.persona.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-light text-stone-800">Campos Opcionales</h3>
              </div>
              
              {/* Telefono, Lab and Storage Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-blue-500 mr-1">○</span>
                    Teléfono
                  </label>
                  <input
                    {...register('telefono')}
                    type="tel"
                    placeholder="612 345 678"
                    className="w-full px-4 py-3.5 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm"
                  />
                  {errors.telefono && (
                    <p className="text-xs text-red-500">{errors.telefono.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-blue-500 mr-1">○</span>
                    Laboratorio
                  </label>
                  <div className="relative">
                    <input
                      {...register('laboratorio')}
                      list="laboratorios"
                      className="w-full px-4 py-3.5 pr-20 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm"
                      placeholder="Seleccionar laboratorio"
                    />
                    <datalist id="laboratorios">
                      {laboratorios.map(laboratorio => (
                        <option key={laboratorio.id} value={laboratorio.nombre} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => handleNewItem('laboratorio')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-light text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 rounded-lg transition-colors"
                    >
                      + Nuevo
                    </button>
                  </div>
                  {errors.laboratorio && (
                    <p className="text-xs text-red-500">{errors.laboratorio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-blue-500 mr-1">○</span>
                    Almacén
                  </label>
                  <div className="relative">
                    <input
                      {...register('almacen')}
                      list="almacenes"
                      className="w-full px-4 py-3.5 pr-20 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm"
                      placeholder="Seleccionar almacén"
                    />
                    <datalist id="almacenes">
                      {almacenes.map(almacen => (
                        <option key={almacen.id} value={almacen.nombre} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => handleNewItem('almacen')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-light text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 rounded-lg transition-colors"
                    >
                      + Nuevo
                    </button>
                  </div>
                  {errors.almacen && (
                    <p className="text-xs text-red-500">{errors.almacen.message}</p>
                  )}
                </div>
              </div>

              {/* Email and Payment Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-blue-500 mr-1">○</span>
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="ejemplo@email.com"
                    className="w-full px-4 py-3.5 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-light text-stone-700">
                    <span className="text-blue-500 mr-1">○</span>
                    Señal (€)
                  </label>
                  <div className="relative">
                    <input
                      {...register('pagado', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3.5 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-stone-400 text-sm font-light">€</span>
                    </div>
                  </div>
                  {errors.pagado && (
                    <p className="text-xs text-red-500">{errors.pagado.message}</p>
                  )}
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-2 mb-6">
                <label className="flex items-center text-sm font-light text-stone-700">
                  <span className="text-blue-500 mr-1">○</span>
                  Observaciones
                </label>
                <textarea
                  {...register('observaciones')}
                  rows={3}
                  placeholder="Información adicional sobre el encargo..."
                  className="w-full px-4 py-3.5 bg-white/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-sm font-light backdrop-blur-sm resize-none"
                />
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <label className="flex items-center text-sm font-light text-stone-700">
                  <span className="text-blue-500 mr-1">○</span>
                  Preferencias de Notificación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="group cursor-pointer opacity-50">
                    <div className="p-4 bg-white/70 border border-blue-200 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled
                          className="w-4 h-4 rounded border-blue-300 text-blue-500 focus:ring-blue-500/20 transition-colors"
                        />
                        <span className="ml-3 text-sm font-light text-stone-700">Notificaciones por teléfono</span>
                        <span className="ml-2 text-xs text-gray-500">(Próximamente)</span>
                      </div>
                    </div>
                  </label>

                  <label className="group cursor-pointer">
                    <div className="p-4 bg-white/70 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors backdrop-blur-sm">
                      <div className="flex items-center">
                        <input
                          {...register('email_notifications')}
                          type="checkbox"
                          className="w-4 h-4 rounded border-blue-300 text-blue-500 focus:ring-blue-500/20 transition-colors"
                        />
                        <span className="ml-3 text-sm font-light text-stone-700 group-hover:text-stone-900">Notificaciones por email</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-light text-stone-800">Estado del Encargo</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="group cursor-pointer">
                  <div className="p-4 bg-white/70 border border-green-200 rounded-xl hover:bg-green-50 transition-colors backdrop-blur-sm">
                    <div className="flex items-center">
                      <input
                        {...register('pedido')}
                        type="checkbox"
                        className="w-4 h-4 rounded border-green-300 text-green-500 focus:ring-green-500/20 transition-colors"
                      />
                      <span className="ml-3 text-sm font-light text-stone-700 group-hover:text-stone-900">Pedido</span>
                    </div>
                  </div>
                </label>

                <label className="group cursor-pointer">
                  <div className="p-4 bg-white/70 border border-green-200 rounded-xl hover:bg-green-50 transition-colors backdrop-blur-sm">
                    <div className="flex items-center">
                      <input
                        {...register('recibido')}
                        type="checkbox"
                        className="w-4 h-4 rounded border-green-300 text-green-500 focus:ring-green-500/20 transition-colors"
                      />
                      <span className="ml-3 text-sm font-light text-stone-700 group-hover:text-stone-900">Recibido</span>
                    </div>
                  </div>
                </label>

                <label className="group cursor-pointer">
                  <div className="p-4 bg-white/70 border border-green-200 rounded-xl hover:bg-green-50 transition-colors backdrop-blur-sm">
                    <div className="flex items-center">
                      <input
                        {...register('entregado')}
                        type="checkbox"
                        className="w-4 h-4 rounded border-green-300 text-green-500 focus:ring-green-500/20 transition-colors"
                      />
                      <span className="ml-3 text-sm font-light text-stone-700 group-hover:text-stone-900">Entregado</span>
                    </div>
                  </div>
                </label>

                <label className="group cursor-pointer">
                  <div className="p-4 bg-white/70 border border-green-200 rounded-xl hover:bg-green-50 transition-colors backdrop-blur-sm">
                    <div className="flex items-center">
                      <input
                        {...register('avisado')}
                        type="checkbox"
                        className="w-4 h-4 rounded border-green-300 text-green-500 focus:ring-green-500/20 transition-colors"
                      />
                      <span className="ml-3 text-sm font-light text-stone-700 group-hover:text-stone-900">Avisado</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-6 bg-white/50 border-t border-gray-200/50">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-3 space-y-reverse sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-stone-600 hover:text-stone-800 font-light transition-colors rounded-xl hover:bg-stone-100/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-light rounded-xl transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                'Guardar Encargo'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};