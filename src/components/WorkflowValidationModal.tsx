import React, { useState } from 'react';
import { Encargo } from '../types';

interface WorkflowValidationModalProps {
  isVisible: boolean;
  encargo: Encargo;
  field: 'pedido' | 'recibido' | 'entregado';
  newValue: boolean;
  onConfirm: (updatePrevious: boolean) => void;
  onCancel: () => void;
}

export const WorkflowValidationModal: React.FC<WorkflowValidationModalProps> = ({
  isVisible,
  encargo,
  field,
  newValue,
  onConfirm,
  onCancel
}) => {
  const [updatePrevious, setUpdatePrevious] = useState(true);

  if (!isVisible) return null;

  // Determine what validation message to show
  const getValidationMessage = () => {
    if (field === 'recibido' && newValue && !encargo.pedido) {
      return {
        title: 'Producto no está pedido',
        message: 'No puedes marcar como "recibido" un producto que no ha sido pedido aún.',
        suggestion: '¿Quieres marcar también como "pedido"?',
        buttonText: 'Marcar Pedido y Recibido',
        cancelText: 'Cancelar'
      };
    }
    
    if (field === 'entregado' && newValue && !encargo.recibido) {
      return {
        title: 'Producto no está recibido',
        message: 'No puedes marcar como "entregado" un producto que no ha sido recibido aún.',
        suggestion: '¿Quieres marcar también como "recibido"' + (!encargo.pedido ? ' y "pedido"' : '') + '?',
        buttonText: `Marcar ${!encargo.pedido ? 'Pedido, ' : ''}Recibido y Entregado`,
        cancelText: 'Cancelar'
      };
    }

    if (field === 'pedido' && !newValue && (encargo.recibido || encargo.entregado)) {
      return {
        title: 'Producto ya está en proceso',
        message: 'Este producto ya está marcado como recibido/entregado. Desmarcar "pedido" puede crear inconsistencias.',
        suggestion: '¿Quieres desmarcar también los estados posteriores?',
        buttonText: 'Desmarcar Todo',
        cancelText: 'Cancelar'
      };
    }

    if (field === 'recibido' && !newValue && encargo.entregado) {
      return {
        title: 'Producto ya está entregado',
        message: 'Este producto ya está marcado como entregado. Desmarcar "recibido" puede crear inconsistencias.',
        suggestion: '¿Quieres desmarcar también "entregado"?',
        buttonText: 'Desmarcar Recibido y Entregado',
        cancelText: 'Cancelar'
      };
    }

    return null;
  };

  const validation = getValidationMessage();
  if (!validation) return null;

  const handleConfirm = () => {
    onConfirm(updatePrevious);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-modal max-w-md w-full">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{validation.title}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>{validation.message}</p>
              <p className="mt-2 font-medium">{validation.suggestion}</p>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900">{encargo.producto}</div>
            <div className="text-gray-600">{encargo.persona} - {encargo.telefono}</div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${encargo.pedido ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {encargo.pedido ? '✓' : '○'} Pedido
            </span>
            <span className={`px-2 py-1 rounded-full ${encargo.recibido ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {encargo.recibido ? '✓' : '○'} Recibido
            </span>
            <span className={`px-2 py-1 rounded-full ${encargo.entregado ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              {encargo.entregado ? '✓' : '○'} Entregado
            </span>
          </div>
        </div>

        {/* Option to update previous steps */}
        {newValue && (field === 'recibido' || field === 'entregado') && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={updatePrevious}
                onChange={(e) => setUpdatePrevious(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Actualizar automáticamente los pasos anteriores
              </span>
            </label>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {validation.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 glass-button"
          >
            {validation.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};