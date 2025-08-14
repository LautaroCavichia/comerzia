import React, { useState } from 'react';
import { Encargo } from '../types';
import { EditableCell } from './EditableCell';
import { ToggleCell } from './ToggleCell';
import { useDatabase } from '../context/DatabaseContext';

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

  const handleCellEdit = async (id: string, field: string, value: any) => {
    try {
      await db.updateEncargo({ id, [field]: value });
      onUpdate();
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating encargo:', error);
      alert('Error al actualizar el encargo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este encargo?')) {
      try {
        await db.deleteEncargo(id);
        onDelete();
      } catch (error) {
        console.error('Error deleting encargo:', error);
        alert('Error al eliminar el encargo');
      }
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
    <div className="card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary-50 sticky top-0">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Laboratorio
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Almacén
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recibido
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entregado
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Persona
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avisado
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagado (€)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                Observaciones
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {encargos.map((encargo, index) => (
              <tr
                key={encargo.id}
                className={`table-row animate-slide-up ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.fecha instanceof Date && !isNaN(encargo.fecha.getTime()) 
                      ? encargo.fecha.toISOString().split('T')[0] 
                      : new Date().toISOString().split('T')[0]
                    }
                    onSave={(value) => {
                      const date = new Date(value);
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
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.laboratorio}
                    onSave={(value) => handleCellEdit(encargo.id, 'laboratorio', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'laboratorio'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'laboratorio' })}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.almacen}
                    onSave={(value) => handleCellEdit(encargo.id, 'almacen', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'almacen'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'almacen' })}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.pedido}
                    onChange={(value) => handleCellEdit(encargo.id, 'pedido', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.recibido}
                    onChange={(value) => handleCellEdit(encargo.id, 'recibido', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <ToggleCell
                    value={encargo.entregado}
                    onChange={(value) => handleCellEdit(encargo.id, 'entregado', value)}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.persona}
                    onSave={(value) => handleCellEdit(encargo.id, 'persona', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'persona'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'persona' })}
                  />
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={encargo.telefono}
                    onSave={(value) => handleCellEdit(encargo.id, 'telefono', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'telefono'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'telefono' })}
                    type="tel"
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
                  />
                </td>
                
                <td className="px-3 py-4 text-sm max-w-xs">
                  <EditableCell
                    value={encargo.observaciones || ''}
                    onSave={(value) => handleCellEdit(encargo.id, 'observaciones', value)}
                    isEditing={editingCell?.id === encargo.id && editingCell?.field === 'observaciones'}
                    onEdit={() => setEditingCell({ id: encargo.id, field: 'observaciones' })}
                    multiline
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
  );
};