import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Persona } from '../types';
import { validatePersonaForm, sanitizeInput } from '../lib/validation';

interface ClientProfile extends Persona {
  ordersHistory: Array<{
    id: string;
    fecha: Date;
    producto: string;
    laboratorio: string;
    entregado: boolean;
    pagado: number;
  }>;
}

export const ClientsView: React.FC = () => {
  const { db } = useDatabase();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const personas = await db.getPersonas();
      
      const clientsWithOrders = await Promise.all(
        personas.map(async (persona) => {
          const orders = await db.getEncargosForPersona(persona.id);
          return {
            ...persona,
            ordersHistory: orders.map(order => ({
              id: order.id,
              fecha: order.fecha,
              producto: order.producto,
              laboratorio: order.laboratorio,
              entregado: order.entregado,
              pagado: order.pagado
            }))
          };
        })
      );
      
      setClients(clientsWithOrders);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (client: ClientProfile) => {
    setSelectedClient(client);
  };

  const handleDeleteClient = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const hasOrders = client.ordersHistory.length > 0;
    
    let confirmMessage = `¿Estás seguro de que quieres eliminar a ${client.nombre}?`;
    if (hasOrders) {
      confirmMessage = `⚠️ ATENCIÓN: ${client.nombre} tiene ${client.ordersHistory.length} pedido(s) asociado(s).\n\nNo se puede eliminar un cliente con pedidos existentes. Primero debes:\n1. Eliminar todos sus pedidos, O\n2. Reasignar los pedidos a otro cliente\n\n¿Quieres ver la lista de pedidos?`;
    }

    if (window.confirm(confirmMessage)) {
      if (hasOrders) {
        // Show orders instead of deleting
        alert(`Pedidos de ${client.nombre}:\n\n${client.ordersHistory.map((order, i) => 
          `${i + 1}. ${order.producto} - ${order.fecha.toLocaleDateString()} (${order.entregado ? 'Entregado' : 'Pendiente'})`
        ).join('\n')}\n\nElimina estos pedidos primero desde la tabla de Encargos.`);
        return;
      }

      try {
        await db.deletePersona(clientId);
        await loadClients();
        if (selectedClient && selectedClient.id === clientId) {
          setSelectedClient(null);
        }
        alert(`Cliente ${client.nombre} eliminado correctamente.`);
      } catch (error) {
        console.error('Error deleting client:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        alert(`Error al eliminar cliente: ${errorMessage}`);
      }
    }
  };

  const handleUpdateNotifications = async (clientId: string, phoneNotifications: boolean, emailNotifications: boolean) => {
    try {
      await db.updatePersonaNotifications(clientId, phoneNotifications, emailNotifications);
      await loadClients();
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({
          ...selectedClient,
          phone_notifications: phoneNotifications,
          email_notifications: emailNotifications
        });
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-stone-800">Clientes</h2>
            <p className="text-stone-600 font-light">Gestiona los perfiles de tus clientes</p>
          </div>
          <button
            onClick={() => setShowAddClient(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 transform hover:scale-105 shadow-sm space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
            <h3 className="text-lg font-light text-stone-800 mb-4">Lista de Clientes</h3>
            
            {clients.length === 0 ? (
              <p className="text-stone-500 text-center py-8 font-light">No hay clientes registrados</p>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleClientClick(client)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedClient?.id === client.id
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-stone-200 hover:border-orange-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-light text-stone-800">{client.nombre}</h4>
                        <p className="text-sm text-stone-600 font-light">{client.telefono}</p>
                        {client.email && (
                          <p className="text-sm text-stone-600 font-light">{client.email}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full font-light">
                            {client.ordersHistory.length} pedidos
                          </span>
                          {client.phone_notifications && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">📱</span>
                          )}
                          {client.email_notifications && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">📧</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <ClientDetailPanel
              client={selectedClient}
              onDelete={handleDeleteClient}
              onUpdateNotifications={handleUpdateNotifications}
            />
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 shadow-sm border border-stone-200 text-center">
              <svg className="mx-auto h-12 w-12 text-stone-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-light text-stone-800 mb-2">Selecciona un Cliente</h3>
              <p className="text-stone-600 font-light">Elige un cliente de la lista para ver sus detalles e historial</p>
            </div>
          )}
        </div>
      </div>

      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onClientAdded={() => {
            loadClients();
            setShowAddClient(false);
          }}
        />
      )}
    </div>
  );
};

interface ClientDetailPanelProps {
  client: ClientProfile;
  onDelete: (clientId: string) => void;
  onUpdateNotifications: (clientId: string, phoneNotifications: boolean, emailNotifications: boolean) => void;
}

const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({
  client,
  onDelete,
  onUpdateNotifications
}) => {
  const [phoneNotifications, setPhoneNotifications] = useState(client.phone_notifications);
  const [emailNotifications, setEmailNotifications] = useState(client.email_notifications);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(client.email || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(client.nombre);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(client.telefono);

  const { db } = useDatabase();
  
  const handleNotificationUpdate = async () => {
    await onUpdateNotifications(client.id, phoneNotifications, emailNotifications);
  };

  const handleEmailUpdate = async () => {
    try {
      await db.updatePersonaEmail(client.id, emailValue);
      setIsEditingEmail(false);
      // Trigger a reload of the client data
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Error al actualizar el email');
    }
  };

  const handleCancelEmailEdit = () => {
    setEmailValue(client.email || '');
    setIsEditingEmail(false);
  };

  const handleNameUpdate = async () => {
    if (!nameValue.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    
    try {
      await db.updatePersonaName(client.id, nameValue.trim());
      setIsEditingName(false);
      window.location.reload(); // Reload to show cascade updates
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error al actualizar el nombre: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCancelNameEdit = () => {
    setNameValue(client.nombre);
    setIsEditingName(false);
  };

  const handlePhoneUpdate = async () => {
    if (!phoneValue.trim()) {
      alert('El teléfono no puede estar vacío');
      return;
    }
    
    try {
      await db.updatePersonaPhone(client.id, phoneValue.trim());
      setIsEditingPhone(false);
      window.location.reload(); // Reload to show cascade updates
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('Error al actualizar el teléfono: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCancelPhoneEdit = () => {
    setPhoneValue(client.telefono);
    setIsEditingPhone(false);
  };

  const totalSpent = client.ordersHistory.reduce((sum, order) => sum + order.pagado, 0);
  const completedOrders = client.ordersHistory.filter(order => order.entregado).length;

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Editable Name */}
            <div className="flex items-center mb-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="glass-input flex-1 text-xl font-bold"
                    placeholder="Nombre del cliente"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="Guardar nombre"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelNameEdit}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Cancelar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{client.nombre}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-primary-600 p-1"
                    title="Editar nombre"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 space-y-1">
              {/* Editable Phone */}
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {isEditingPhone ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="tel"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className="glass-input flex-1 text-sm py-1 px-2"
                      placeholder="Número de teléfono"
                    />
                    <button
                      onClick={handlePhoneUpdate}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Guardar teléfono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelPhoneEdit}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancelar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-gray-600">{client.telefono}</span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Editar teléfono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="glass-input flex-1 text-sm py-1 px-2"
                      placeholder="ejemplo@email.com"
                    />
                    <button
                      onClick={handleEmailUpdate}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Guardar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEmailEdit}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancelar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-gray-600">
                      {client.email || 'Sin email'}
                    </span>
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Editar email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(client.id)}
            className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">{client.ordersHistory.length}</div>
            <div className="text-sm text-gray-600">Total Pedidos</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Gastado</div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificación</h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={phoneNotifications}
                onChange={(e) => setPhoneNotifications(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-gray-700">Notificaciones por teléfono</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                disabled={!client.email}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
              />
              <span className="ml-3 text-gray-700">Notificaciones por email</span>
              {!client.email && <span className="ml-2 text-sm text-gray-500">(Sin email)</span>}
            </label>
            <button
              onClick={handleNotificationUpdate}
              className="glass-button-sm"
            >
              Guardar Preferencias
            </button>
          </div>
        </div>
      </div>

      {/* Orders History */}
      <div className="glass-card p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pedidos</h4>
        
        {client.ordersHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay pedidos registrados</p>
        ) : (
          <div className="space-y-3">
            {client.ordersHistory.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h5 className="font-medium text-gray-900">{order.producto}</h5>
                    <span className="text-sm text-gray-500">• {order.laboratorio}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.entregado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.entregado ? 'Entregado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.fecha.toLocaleDateString('es-AR')} • ${order.pagado.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AddClientModalProps {
  onClose: () => void;
  onClientAdded: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onClientAdded }) => {
  const { db } = useDatabase();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    phone_notifications: false,
    email_notifications: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      telefono: sanitizeInput(formData.telefono),
      email: formData.email ? sanitizeInput(formData.email) : undefined
    };

    // Validate form data
    const validation = validatePersonaForm({
      nombre: sanitizedData.nombre,
      telefono: sanitizedData.telefono,
      email: sanitizedData.email
    });

    if (!validation.isValid) {
      const errorMessage = Object.entries(validation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join('\n');
      alert(`Errores de validación:\n${errorMessage}`);
      return;
    }

    setLoading(true);
    try {
      await db.createPersonaWithNotifications({
        nombre: sanitizedData.nombre,
        telefono: sanitizedData.telefono,
        email: sanitizedData.email,
        phone_notifications: formData.phone_notifications,
        email_notifications: formData.email_notifications && !!sanitizedData.email
      });
      onClientAdded();
    } catch (error) {
      console.error('Error creating client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('already exists')) {
        alert('Ya existe un cliente con este número de teléfono. Por favor, usa un número diferente.');
      } else {
        alert(`Error al crear cliente: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-modal max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Agregar Cliente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="glass-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              className="glass-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="glass-input w-full"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Preferencias de Notificación</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.phone_notifications}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_notifications: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">Notificaciones por teléfono</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                disabled={!formData.email}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
              />
              <span className="ml-3 text-sm text-gray-700">Notificaciones por email</span>
              {!formData.email && <span className="ml-2 text-xs text-gray-500">(Requiere email)</span>}
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 glass-button disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};