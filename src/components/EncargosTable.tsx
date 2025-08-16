import React, { useState } from 'react';
import { Encargo, Persona } from '../types';
import { EditableCell } from './EditableCell';
import { ToggleCell } from './ToggleCell';
import { useDatabase } from '../context/DatabaseContext';
import { NotificationModal } from './NotificationModal';
import { WorkflowValidationModal } from './WorkflowValidationModal';
import { ConfirmationDialog } from './ConfirmationDialog';

interface EncargosTableProps {
  encargos: Encargo[];
  onUpdate: () => void;
  onDelete: () => void;
}

export const EncargosTable: React.FC<EncargosTableProps> = ({
  encargos,
  onUpdate,
  onDelete
}) => {
  const { db } = useDatabase();
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [notificationModal, setNotificationModal] = useState<{
    order: Encargo;
    client: Persona;
  } | null>(null);
  const [workflowModal, setWorkflowModal] = useState<{
    encargo: Encargo;
    field: 'pedido' | 'recibido' | 'entregado';
    newValue: boolean;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    encargoId: string;
    encargoDetails: string;
  } | null>(null);

  // Check if workflow change is valid
  const checkWorkflowValidity = (encargo: Encargo, field: 'pedido' | 'recibido' | 'entregado', newValue: boolean): boolean => {
    if (field === 'recibido' && newValue && !encargo.pedido) {
      return false; // Can't receive if not ordered
    }
    if (field === 'entregado' && newValue && !encargo.recibido) {
      return false; // Can't deliver if not received
    }
    if (field === 'pedido' && !newValue && (encargo.recibido || encargo.entregado)) {
      return false; // Can't unorder if already received/delivered
    }
    if (field === 'recibido' && !newValue && encargo.entregado) {
      return false; // Can't unreceive if already delivered
    }
    return true;
  };

  const handleCellEdit = async (id: string, field: string, value: any) => {
    try {
      // Use cascade update for persona and telefono fields to maintain data consistency
      if (field === 'persona' || field === 'telefono') {
        await db.updateEncargoWithPersonaCascade({ id, [field]: value });
      } else {
        await db.updateEncargo({ id, [field]: value });
      }
      onUpdate();
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating encargo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar el encargo: ${errorMessage}`);
    }
  };

  const handleWorkflowToggle = async (encargo: Encargo, field: 'pedido' | 'recibido' | 'entregado', newValue: boolean) => {
    // Check if the change violates workflow rules
    if (!checkWorkflowValidity(encargo, field, newValue)) {
      setWorkflowModal({ encargo, field, newValue });
      return;
    }

    // If valid, proceed with the change
    if (field === 'recibido' && newValue) {
      handleRecibidoChange(encargo, newValue);
    } else {
      handleCellEdit(encargo.id, field, newValue);
    }
  };

  const handleWorkflowConfirm = async (updatePrevious: boolean) => {
    if (!workflowModal) return;

    const { encargo, field, newValue } = workflowModal;

    try {
      if (newValue) {
        // Setting to true - need to update previous steps if requested
        if (field === 'recibido' && updatePrevious && !encargo.pedido) {
          await db.updateEncargo({ id: encargo.id, pedido: true, recibido: true });
        } else if (field === 'entregado') {
          const updates: any = { entregado: true };
          if (updatePrevious) {
            if (!encargo.pedido) updates.pedido = true;
            if (!encargo.recibido) updates.recibido = true;
          }
          await db.updateEncargo({ id: encargo.id, ...updates });
        } else {
          await db.updateEncargo({ id: encargo.id, [field]: newValue });
        }
      } else {
        // Setting to false - need to update subsequent steps
        if (field === 'pedido') {
          await db.updateEncargo({ 
            id: encargo.id, 
            pedido: false, 
            recibido: false, 
            entregado: false 
          });
        } else if (field === 'recibido') {
          await db.updateEncargo({ 
            id: encargo.id, 
            recibido: false, 
            entregado: false 
          });
        }
      }

      onUpdate();
      setWorkflowModal(null);
    } catch (error) {
      console.error('Error updating workflow:', error);
      alert('Error al actualizar el estado del encargo');
    }
  };

  const handleRecibidoChange = async (encargo: Encargo, value: boolean) => {
    if (value) {
      try {
        const client = await db.findPersonaByContact(encargo.telefono, encargo.persona);
        
        // Only show modal if client exists and has at least one notification preference enabled
        if (client && (client.phone_notifications || client.email_notifications)) {
          setNotificationModal({ order: encargo, client });
          return;
        }
      } catch (error) {
        console.error('Error checking client notifications:', error);
      }
    }
    
    // If no modal shown, just update the field directly
    handleCellEdit(encargo.id, 'recibido', value);
  };

  const handleSendNotification = async (shouldSend: boolean) => {
    if (notificationModal) {
      if (shouldSend) {
        console.log('Sending notification to:', notificationModal.client.nombre);
        // Update both recibido and avisado when notification is sent
        await handleCellEdit(notificationModal.order.id, 'recibido', true);
        await handleCellEdit(notificationModal.order.id, 'avisado', true);
      } else {
        // Only update recibido if not sending notification
        await handleCellEdit(notificationModal.order.id, 'recibido', true);
      }
      
      setNotificationModal(null);
    }
  };

  const handleDelete = (id: string) => {
    const encargo = encargos.find(e => e.id === id);
    if (!encargo) return;

    const details = `${encargo.producto} - ${encargo.persona} (${encargo.fecha.toLocaleDateString('es-ES')})`;
    setDeleteConfirmation({
      encargoId: id,
      encargoDetails: details
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await db.deleteEncargo(deleteConfirmation.encargoId);
      onDelete();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting encargo:', error);
      alert('Error al eliminar el encargo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  if (encargos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin encargos aún</h3>
        <p className="mt-1 text-sm text-gray-500">Comience agregando un nuevo encargo.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="glass-badge sticky top-0 backdrop-blur-md">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-24">
                Fecha
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-32">
                Producto
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Laboratorio
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-24">
                Almacén
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Pedido
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Recibido
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Entregado
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Persona
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Teléfono
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Avisado
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-24">
                Pagado (€)
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-36">
                Observaciones
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 tracking-wider w-20">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {encargos.map((encargo) => (
              <tr
                key={encargo.id}
                className="table-row"
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.fecha instanceof Date && !isNaN(encargo.fecha.getTime()) 
                      ? `${encargo.fecha.getFullYear()}-${String(encargo.fecha.getMonth() + 1).padStart(2, '0')}-${String(encargo.fecha.getDate()).padStart(2, '0')}`
                      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                    }
                    onSave={(value) => {
                      // Parse date as local date, not UTC
                      const [year, month, day] = value.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      if (!isNaN(date.getTime())) {
                        handleCellEdit(encargo.id, 'fecha', date);
                      }
                    }}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'fecha'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'fecha' })}
                    type="date"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.producto}
                    onSave={(value) => handleCellEdit(encargo.id, 'producto', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'producto'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'producto' })}
                    field="producto"
                    maxWidth="8rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.laboratorio}
                    onSave={(value) => handleCellEdit(encargo.id, 'laboratorio', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'laboratorio'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'laboratorio' })}
                    field="laboratorio"
                    maxWidth="7rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.almacen}
                    onSave={(value) => handleCellEdit(encargo.id, 'almacen', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'almacen'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'almacen' })}
                    field="almacen"
                    maxWidth="6rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.pedido}
                    onChange={(value) => handleWorkflowToggle(encargo, 'pedido', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.recibido}
                    onChange={(value) => handleWorkflowToggle(encargo, 'recibido', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.entregado}
                    onChange={(value) => handleWorkflowToggle(encargo, 'entregado', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.persona}
                    onSave={(value) => handleCellEdit(encargo.id, 'persona', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'persona'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'persona' })}
                    field="persona"
                    maxWidth="7rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.telefono}
                    onSave={(value) => handleCellEdit(encargo.id, 'telefono', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'telefono'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'telefono' })}
                    type="tel"
                    field="telefono"
                    maxWidth="7rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.avisado}
                    onChange={(value) => handleCellEdit(encargo.id, 'avisado', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <EditableCell
                    value={encargo.pagado.toString()}
                    onSave={(value) => {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        handleCellEdit(encargo.id, 'pagado', numValue);
                      }
                    }}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'pagado'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'pagado' })}
                    type="number"
                    field="pagado"
                  />
                </td>
                
                <td className="px-3 py-4 text-sm max-w-xs">
                  <EditableCell
                    value={encargo.observaciones || ''}
                    onSave={(value) => handleCellEdit(encargo.id, 'observaciones', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'observaciones'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'observaciones' })}
                    multiline
                    field="observaciones"
                    maxWidth="9rem"
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(encargo.id)}
                    className="text-red-600 hover:text-red-700 transition-all duration-200 ease-smooth hover:scale-110"
                    title="Eliminar encargo"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {notificationModal && (
        <NotificationModal
          order={notificationModal.order}
          client={notificationModal.client}
          isVisible={true}
          onClose={() => setNotificationModal(null)}
          onSendNotification={handleSendNotification}
        />
      )}

      {workflowModal && (
        <WorkflowValidationModal
          isVisible={true}
          encargo={workflowModal.encargo}
          field={workflowModal.field}
          newValue={workflowModal.newValue}
          onConfirm={handleWorkflowConfirm}
          onCancel={() => setWorkflowModal(null)}
        />
      )}

      {deleteConfirmation && (
        <ConfirmationDialog
          isVisible={true}
          type="danger"
          title="Eliminar Pedido"
          message="¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer."
          details={[`Pedido: ${deleteConfirmation.encargoDetails}`]}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </>
  );
};