import emailjs from '@emailjs/browser';
import { Encargo, Persona } from '../types';

interface EmailTemplateParams {
  client_name: string;
  order_item: string;
  order_date: string;
  to_email: string;
}

export class EmailService {
  private static instance: EmailService;
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private emailTemplate: string;

  private constructor() {
    this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
    this.templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
    this.emailTemplate = process.env.REACT_APP_EMAIL_TEMPLATE_MESSAGE || 
      'Hola {{client_name}}, tu pedido de {{order_item}} realizado el {{order_date}} ha llegado y está listo para ser retirado. ¡Gracias por tu compra!';
    
    // Initialize EmailJS
    emailjs.init(this.publicKey);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private buildEmailMessage(params: EmailTemplateParams): string {
    return this.emailTemplate
      .replace(/\{\{client_name\}\}/g, params.client_name)
      .replace(/\{\{order_item\}\}/g, params.order_item)
      .replace(/\{\{order_date\}\}/g, params.order_date);
  }

  public async sendOrderArrivalNotification(order: Encargo, client: Persona): Promise<boolean> {
    try {
      if (!client.email) {
        throw new Error('Client email is required');
      }

      if (!this.serviceId || !this.templateId || !this.publicKey) {
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }

      const templateParams: EmailTemplateParams = {
        client_name: order.persona,
        order_item: `${order.producto} - ${order.laboratorio}`,
        order_date: order.fecha.toLocaleDateString('es-AR'),
        to_email: client.email
      };

      const emailMessage = this.buildEmailMessage(templateParams);

      const emailParams = {
        email: client.email, // EmailJS recipient field
        message: emailMessage, // Fallback text message
        client_name: templateParams.client_name,
        order_item: templateParams.order_item,
        order_date: templateParams.order_date,
        to_email: templateParams.to_email
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        emailParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  public isConfigured(): boolean {
    return !!(this.serviceId && this.templateId && this.publicKey);
  }
}

export const emailService = EmailService.getInstance();