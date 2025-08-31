import { Encargo, Persona } from '../types';

export class WhatsAppService {
  private static instance: WhatsAppService;
  private messageTemplate: string;

  private constructor() {
    this.messageTemplate = process.env.REACT_APP_WHATSAPP_TEMPLATE_MESSAGE || 
      'Hola {{client_name}}, tu pedido de {{order_item}} realizado el {{order_date}} ha llegado y está listo para ser retirado. ¡Gracias por tu compra!';
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Formats Spanish phone number for WhatsApp URL
   * Spanish mobile numbers: 9 digits starting with 6 or 7
   * Country code: +34
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If already has Spanish country code (34), add +
    if (cleaned.startsWith('34') && cleaned.length === 11) {
      return '+' + cleaned;
    }
    
    // If it's a 9-digit Spanish mobile number, add +34
    if (cleaned.length === 9 && (cleaned.startsWith('6') || cleaned.startsWith('7'))) {
      return '+34' + cleaned;
    }
    
    // If it's already formatted with +34
    if (phone.startsWith('+34')) {
      return phone.replace(/\D/g, '').replace(/^/, '+');
    }
    
    // Default: assume it's a Spanish mobile number
    return '+34' + cleaned;
  }

  /**
   * Builds the WhatsApp message from template
   */
  private buildWhatsAppMessage(order: Encargo, client: Persona): string {
    return this.messageTemplate
      .replace(/\{\{client_name\}\}/g, client.nombre)
      .replace(/\{\{order_item\}\}/g, `${order.producto} - ${order.laboratorio || 'N/A'}`)
      .replace(/\{\{order_date\}\}/g, order.fecha.toLocaleDateString('es-ES'));
  }

  /**
   * Generates WhatsApp web URL that opens with pre-filled message
   */
  public generateWhatsAppURL(order: Encargo, client: Persona): string | null {
    if (!client.telefono) {
      return null;
    }

    const phone = this.formatPhoneNumber(client.telefono);
    const message = this.buildWhatsAppMessage(order, client);
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp Web URL format
    return `https://wa.me/${phone.replace('+', '')}?text=${encodedMessage}`;
  }

  /**
   * Opens WhatsApp with the message
   */
  public openWhatsApp(order: Encargo, client: Persona): boolean {
    const webURL = this.generateWhatsAppURL(order, client);
    
    if (!webURL) {
      console.error('Cannot generate WhatsApp URL: missing phone number');
      return false;
    }

    // Open WhatsApp Web
    window.open(webURL, '_blank');
    return true;
  }

  /**
   * Validates if client can receive WhatsApp notifications
   */
  public canSendWhatsApp(client: Persona): boolean {
    return !!(client.telefono && client.phone_notifications);
  }

  /**
   * Gets the formatted phone number for display
   */
  public getFormattedPhone(client: Persona): string | null {
    if (!client.telefono) return null;
    return this.formatPhoneNumber(client.telefono);
  }
}

export const whatsappService = WhatsAppService.getInstance();