import React, { useState } from 'react';
import { Encargo, Persona } from '../types';
import { emailService } from '../services/emailService';
import { whatsappService } from '../services/whatsappService';

interface NotificationModalProps {
  order: Encargo;
  client: Persona;
  isVisible: boolean;
  onClose: () => void;
  onSendNotification: (shouldSend: boolean) => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  order,
  client,
  isVisible,
  onClose,
  onSendNotification
}) => {
  const [loading, setLoading] = useState(false);

  if (!isVisible) return null;

  const handleSendNotification = async (shouldSend: boolean) => {
    setLoading(true);
    try {
      if (shouldSend && client.email_notifications && client.email) {
        await emailService.sendOrderArrivalNotification(order, client);
      }
      await onSendNotification(shouldSend);
      onClose();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error al enviar la notificación. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppNotification = () => {
    const success = whatsappService.openWhatsApp(order, client);
    if (success) {
      // Mark as notified (WhatsApp notification sent)
      onSendNotification(true);
      onClose();
    } else {
      alert('Error al abrir WhatsApp. Verifica el número de teléfono.');
    }
  };

  const hasEmailNotifications = client.email_notifications && client.email;
  const hasWhatsAppNotifications = whatsappService.canSendWhatsApp(client);
  const hasNotificationPreferences = hasEmailNotifications || hasWhatsAppNotifications;

  return (
    <div className="modal-backdrop z-[9999]" style={{ isolation: 'isolate' }}>
      <div className="glass-modal z-[10000]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Producto Llegado</h3>
              <p className="text-sm text-gray-600">Notificar al cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Detalles del Pedido</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Cliente:</span> <strong>{order.persona}</strong></p>
              <p><span className="text-gray-600">Producto:</span> <strong>{order.producto}</strong></p>
              <p><span className="text-gray-600">Laboratorio:</span> <strong>{order.laboratorio}</strong></p>
              <p><span className="text-gray-600">Fecha:</span> <strong>{order.fecha.toLocaleDateString('es-AR')}</strong></p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Información de Contacto</h4>
            <div className="space-y-1 text-sm">
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <strong>{client.telefono}</strong>
                {hasWhatsAppNotifications && (
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    WhatsApp disponible
                  </span>
                )}
                {client.telefono && !hasWhatsAppNotifications && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    WhatsApp desactivado
                  </span>
                )}
              </p>
              {client.email && (
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <strong>{client.email}</strong>
                  {client.email_notifications && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      Notificaciones activas
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {!hasNotificationPreferences && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Sin preferencias de notificación</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Este cliente no tiene configuradas notificaciones automáticas. 
                    Deberás contactarlo manualmente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          {hasNotificationPreferences ? (
            <>
              {hasWhatsAppNotifications && (
                <button
                  onClick={handleWhatsAppNotification}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.403"/>
                  </svg>
                  <span>Avisar por WhatsApp</span>
                </button>
              )}
              {hasEmailNotifications && (
                <button
                  onClick={() => handleSendNotification(true)}
                  disabled={loading}
                  className="glass-button w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Avisar por Email</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => handleSendNotification(false)}
                disabled={loading}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                No Avisar Cliente
              </button>
            </>
          ) : (
            <button
              onClick={() => handleSendNotification(false)}
              disabled={loading}
              className="glass-button w-full"
            >
              Entendido, Contactaré Manualmente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};