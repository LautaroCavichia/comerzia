export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export interface NetworkError extends Error {
  isNetworkError: boolean;
  isRetryable: boolean;
  statusCode?: number;
}

// Check if an error is network-related and retryable
export const isRetryableError = (error: any): boolean => {
  // Network connectivity issues
  if (error?.message?.includes('fetch')) return true;
  if (error?.message?.includes('Network')) return true;
  if (error?.message?.includes('network')) return true;
  if (error?.message?.includes('connection')) return true;
  if (error?.message?.includes('timeout')) return true;
  
  // HTTP status codes that are retryable
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error?.statusCode && retryableStatusCodes.includes(error.statusCode)) {
    return true;
  }
  
  // Database connection issues
  if (error?.message?.includes('ECONNREFUSED')) return true;
  if (error?.message?.includes('ENOTFOUND')) return true;
  if (error?.message?.includes('ETIMEDOUT')) return true;
  
  return false;
};

// Get user-friendly error message
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'Error desconocido';
  
  const message = error.message || String(error);
  
  // Network connectivity issues
  if (message.includes('fetch') || message.includes('Network') || message.includes('network')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  if (message.includes('timeout')) {
    return 'La operación tardó demasiado tiempo. Inténtalo de nuevo.';
  }
  
  // Database-specific errors
  if (message.includes('already exists')) {
    return 'Ya existe un registro con estos datos.';
  }
  
  if (message.includes('not found')) {
    return 'No se encontró el registro solicitado.';
  }
  
  if (message.includes('Cannot delete')) {
    return message; // Custom deletion errors are already user-friendly
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
    return message;
  }
  
  // HTTP status codes
  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        return 'Datos inválidos. Verifica la información e inténtalo de nuevo.';
      case 401:
        return 'No tienes autorización para realizar esta acción.';
      case 403:
        return 'Acceso denegado.';
      case 404:
        return 'Recurso no encontrado.';
      case 429:
        return 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
      case 500:
        return 'Error del servidor. Inténtalo de nuevo más tarde.';
      case 502:
      case 503:
      case 504:
        return 'El servicio no está disponible temporalmente. Inténtalo de nuevo.';
      default:
        return `Error del servidor (${error.statusCode}). Inténtalo de nuevo.`;
    }
  }
  
  // Fallback to original message if it's short and clear
  if (message.length < 100 && !message.includes('undefined') && !message.includes('null')) {
    return message;
  }
  
  return 'Error inesperado. Por favor, inténtalo de nuevo.';
};

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry mechanism with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`, error);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// Enhanced database operation wrapper
export const safeDbOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string = 'Database operation',
  showUserMessage: boolean = true
): Promise<T> => {
  try {
    return await withRetry(operation, {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 5000
    });
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    
    if (showUserMessage) {
      const userMessage = getUserFriendlyErrorMessage(error);
      // Don't show alert here, let the caller handle it
      throw new Error(userMessage);
    }
    
    throw error;
  }
};

// Connection status checker
export const checkConnectionStatus = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to test connectivity
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Offline detection
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Enhanced error boundary for React components
export const handleComponentError = (error: any, componentName: string = 'Component'): string => {
  console.error(`${componentName} error:`, error);
  
  if (!isOnline()) {
    return 'Sin conexión a internet. Verifica tu conexión y recarga la página.';
  }
  
  return getUserFriendlyErrorMessage(error);
};