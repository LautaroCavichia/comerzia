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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<boolean>(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(encargos.map(e => e.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected = encargos.length > 0 && selectedItems.size === encargos.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < encargos.length;

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

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    setBulkDeleteConfirmation(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of Array.from(selectedItems)) {
        await db.deleteEncargo(id);
      }
      setSelectedItems(new Set());
      setBulkDeleteConfirmation(false);
      onDelete();
    } catch (error) {
      console.error('Error deleting encargos:', error);
      alert('Error al eliminar los encargos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  if (encargos.length === 0) {
    return (
      <div 
        className="text-center py-16 rounded-2xl animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 247, 237, 0.75) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="animate-float">
          <svg
            className="mx-auto h-16 w-16 text-orange-300 animate-pulse-soft"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-800 animate-fade-in-delayed">Sin encargos aún</h3>
        <div className="mt-6 animate-scale-in-delayed">
          <div className="inline-flex items-center px-4 py-2 text-sm text-orange-600 bg-orange-50/50 rounded-xl border border-orange-100">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Utilice el botón "Nuevo Encargo" para comenzar
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedItems.size > 0 && (
        <div 
          className="mb-4 p-4 bg-gradient-to-r from-orange-50/90 to-orange-100/70 border border-orange-200/60 rounded-2xl flex items-center justify-between backdrop-blur-sm shadow-sm transition-all duration-300 animate-slide-down"
          style={{
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08), 0 2px 8px rgba(249, 115, 22, 0.04)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse-soft"></div>
            <span className="text-sm font-medium text-orange-800">
              {selectedItems.size} elemento{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="text-xs text-orange-600 hover:text-orange-800 underline transition-colors duration-200 hover:scale-105 transform"
            >
              Desseleccionar todo
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-100/80 hover:bg-red-200/90 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-sm backdrop-blur-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      )}
      <div 
        className="card overflow-hidden transition-all duration-500 hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 247, 237, 0.75) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(249, 115, 22, 0.05)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/30">
            <thead 
              className="sticky top-0 backdrop-blur-xl z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.9) 100%)',
                borderBottom: '1px solid rgba(249, 115, 22, 0.1)'
              }}
            >
            <tr className="animate-fade-in">
              <th className="px-3 py-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition-all duration-200 transform hover:scale-110"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Fecha</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Producto</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Laboratorio</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Almacén</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Pedido</span>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Recibido</span>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Entregado</span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Persona</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Teléfono</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Avisado</span>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Pagado (€)</span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider group">
                <div className="flex items-center space-x-1">
                  <span className="transition-colors duration-200 group-hover:text-orange-600">Observaciones</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider">
                <span className="transition-colors duration-200 hover:text-orange-600">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/25">
            {encargos.map((encargo, index) => (
              <tr
                key={encargo.id}
                className="table-row group transition-all duration-300 hover:bg-gradient-to-r hover:from-white/70 hover:to-orange-50/30 hover:shadow-sm animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(encargo.id)}
                    onChange={(e) => handleSelectItem(encargo.id, e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition-all duration-200 transform hover:scale-110"
                  />
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.fecha instanceof Date && !isNaN(encargo.fecha.getTime()) 
                      ? `${encargo.fecha.getFullYear()}-${String(encargo.fecha.getMonth() + 1).padStart(2, '0')}-${String(encargo.fecha.getDate()).padStart(2, '0')}`
                      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                    }
                    onSave={(value) => {
                      if (value) {
                        // Parse date as local date, not UTC
                        const [year, month, day] = value.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        if (!isNaN(date.getTime())) {
                          handleCellEdit(encargo.id, 'fecha', date);
                        }
                      }
                    }}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'fecha'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'fecha' })}
                    type="date"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.producto}
                    onSave={(value) => handleCellEdit(encargo.id, 'producto', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'producto'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'producto' })}
                    field="producto"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.laboratorio}
                    onSave={(value) => handleCellEdit(encargo.id, 'laboratorio', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'laboratorio'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'laboratorio' })}
                    field="laboratorio"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.almacen}
                    onSave={(value) => handleCellEdit(encargo.id, 'almacen', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'almacen'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'almacen' })}
                    field="almacen"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center transform transition-transform duration-200 group-hover:scale-105">
                    <ToggleCell
                      value={encargo.pedido}
                      onChange={(value) => handleWorkflowToggle(encargo, 'pedido', value)}
                    />
                  </div>
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center transform transition-transform duration-200 group-hover:scale-105">
                    <ToggleCell
                      value={encargo.recibido}
                      onChange={(value) => handleWorkflowToggle(encargo, 'recibido', value)}
                    />
                  </div>
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center transform transition-transform duration-200 group-hover:scale-105">
                    <ToggleCell
                      value={encargo.entregado}
                      onChange={(value) => handleWorkflowToggle(encargo, 'entregado', value)}
                    />
                  </div>
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.persona}
                    onSave={(value) => handleCellEdit(encargo.id, 'persona', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'persona'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'persona' })}
                    field="persona"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.telefono}
                    onSave={(value) => handleCellEdit(encargo.id, 'telefono', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'telefono'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'telefono' })}
                    type="tel"
                    field="telefono"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center transform transition-transform duration-200 group-hover:scale-105">
                    <ToggleCell
                      value={encargo.avisado}
                      onChange={(value) => handleCellEdit(encargo.id, 'avisado', value)}
                    />
                  </div>
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-center group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.pagado.toString()}
                    onSave={(value) => {
                      if (value) {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue >= 0) {
                          handleCellEdit(encargo.id, 'pagado', numValue);
                        }
                      } else {
                        handleCellEdit(encargo.id, 'pagado', 0);
                      }
                    }}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'pagado'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'pagado' })}
                    type="number"
                    field="pagado"
                  />
                </td>
                
                <td className="px-3 py-3 text-sm group-hover:scale-[1.01] transition-transform duration-200">
                  <EditableCell
                    value={encargo.observaciones || ''}
                    onSave={(value) => handleCellEdit(encargo.id, 'observaciones', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'observaciones'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'observaciones' })}
                    multiline
                    field="observaciones"
                  />
                </td>
                
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(encargo.id)}
                    className="text-red-500 hover:text-red-600 transition-all duration-300 transform hover:scale-125 hover:rotate-6 p-1 rounded-lg hover:bg-red-50/50 group/delete"
                    title="Eliminar encargo"
                  >
                    <svg className="h-4 w-4 transition-all duration-200 group-hover/delete:drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {bulkDeleteConfirmation && (
        <ConfirmationDialog
          isVisible={true}
          type="danger"
          title="Eliminar Pedidos Seleccionados"
          message={`¿Estás seguro de que quieres eliminar ${selectedItems.size} pedido${selectedItems.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`}
          details={[`Se eliminarán ${selectedItems.size} pedido${selectedItems.size !== 1 ? 's' : ''} seleccionado${selectedItems.size !== 1 ? 's' : ''}`]}
          confirmText="Eliminar Todo"
          cancelText="Cancelar"
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteConfirmation(false)}
        />
      )}
    </>
  );
};