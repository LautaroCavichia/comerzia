export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'El teléfono es obligatorio' };
  }

  const trimmedPhone = phone.trim();
  
  // Basic format validation - allow various international formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  
  if (trimmedPhone.length < 6) {
    return { isValid: false, error: 'El teléfono debe tener al menos 6 dígitos' };
  }

  if (trimmedPhone.length > 20) {
    return { isValid: false, error: 'El teléfono es demasiado largo' };
  }

  // Allow common formats: +34123456789, 123456789, etc.
  const cleanPhone = trimmedPhone.replace(/[\s\-\(\)]/g, '');
  if (!/^[\+]?[\d]+$/.test(cleanPhone)) {
    return { isValid: false, error: 'El teléfono solo puede contener números, espacios, guiones y paréntesis' };
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'El nombre es obligatorio' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'El nombre es demasiado largo (máximo 100 caracteres)' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and common accented characters
  if (!/^[a-zA-ZÀ-ÿñÑ\s\-'\.]+$/.test(trimmedName)) {
    return { isValid: false, error: 'El nombre contiene caracteres no válidos' };
  }

  return { isValid: true };
};

// Amount validation
export const validateAmount = (amount: string | number): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }

  if (numAmount < 0) {
    return { isValid: false, error: 'El monto no puede ser negativo' };
  }

  if (numAmount > 999999.99) {
    return { isValid: false, error: 'El monto es demasiado alto' };
  }

  return { isValid: true };
};

// Date validation
export const validateDate = (date: string | Date): ValidationResult => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Fecha inválida' };
  }

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  if (dateObj < oneYearAgo) {
    return { isValid: false, error: 'La fecha no puede ser anterior al año pasado' };
  }

  if (dateObj > oneYearFromNow) {
    return { isValid: false, error: 'La fecha no puede ser posterior al próximo año' };
  }

  return { isValid: true };
};

// Generic text validation
export const validateText = (text: string, fieldName: string, required: boolean = false, maxLength: number = 500): ValidationResult => {
  if (required && (!text || text.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} es obligatorio` };
  }

  if (text && text.length > maxLength) {
    return { isValid: false, error: `${fieldName} es demasiado largo (máximo ${maxLength} caracteres)` };
  }

  return { isValid: true };
};

// Persona form validation
export const validatePersonaForm = (data: {
  nombre: string;
  telefono: string;
  email?: string;
}): FormValidationResult => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(data.nombre);
  if (!nameValidation.isValid) {
    errors.nombre = nameValidation.error!;
  }

  const phoneValidation = validatePhone(data.telefono);
  if (!phoneValidation.isValid) {
    errors.telefono = phoneValidation.error!;
  }

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Encargo form validation
export const validateEncargoForm = (data: {
  fecha: string | Date;
  producto: string;
  laboratorio: string;
  almacen: string;
  persona: string;
  telefono: string;
  pagado: string | number;
  observaciones?: string;
}): FormValidationResult => {
  const errors: Record<string, string> = {};

  const dateValidation = validateDate(data.fecha);
  if (!dateValidation.isValid) {
    errors.fecha = dateValidation.error!;
  }

  const productoValidation = validateText(data.producto, 'Producto', true, 255);
  if (!productoValidation.isValid) {
    errors.producto = productoValidation.error!;
  }

  const laboratorioValidation = validateText(data.laboratorio, 'Laboratorio', true, 255);
  if (!laboratorioValidation.isValid) {
    errors.laboratorio = laboratorioValidation.error!;
  }

  const almacenValidation = validateText(data.almacen, 'Almacén', true, 255);
  if (!almacenValidation.isValid) {
    errors.almacen = almacenValidation.error!;
  }

  const personaValidation = validateName(data.persona);
  if (!personaValidation.isValid) {
    errors.persona = personaValidation.error!;
  }

  const phoneValidation = validatePhone(data.telefono);
  if (!phoneValidation.isValid) {
    errors.telefono = phoneValidation.error!;
  }

  const amountValidation = validateAmount(data.pagado);
  if (!amountValidation.isValid) {
    errors.pagado = amountValidation.error!;
  }

  if (data.observaciones) {
    const observacionesValidation = validateText(data.observaciones, 'Observaciones', false, 1000);
    if (!observacionesValidation.isValid) {
      errors.observaciones = observacionesValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .trim();
};

// Check for potential duplicate orders
export const checkPotentialDuplicate = (
  newOrder: { fecha: Date; producto: string; persona: string; telefono: string },
  existingOrders: Array<{ fecha: Date; producto: string; persona: string; telefono: string }>
): boolean => {
  return existingOrders.some(order => {
    const samePerson = order.persona === newOrder.persona || order.telefono === newOrder.telefono;
    const sameProduct = order.producto === newOrder.producto;
    const sameDate = order.fecha.toDateString() === newOrder.fecha.toDateString();
    
    return samePerson && sameProduct && sameDate;
  });
};