
export const normalizePhoneNumber = (phone: string): string => {
  try {
    if (!phone) return phone;
    
    // Clean the phone number
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // If it starts with +34, remove it
    if (cleaned.startsWith('+34')) {
      const withoutPrefix = cleaned.substring(3);
      if (withoutPrefix.match(/^[679]\d{8}$/)) {
        return withoutPrefix;
      }
    }
    
    // If it's already a valid Spanish number format, return it
    if (cleaned.match(/^[679]\d{8}$/)) {
      return cleaned;
    }
    
    return phone;
  } catch (error) {
    console.error('Error normalizing phone number:', error);
    return phone;
  }
};

export const formatPhoneNumber = (phone: string): string => {
  try {
    if (!phone) return phone;
    
    // Clean the phone number
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Remove +34 if present
    let cleanNumber = cleaned;
    if (cleaned.startsWith('+34')) {
      cleanNumber = cleaned.substring(3);
    }
    
    // Format Spanish phone number (XXX XXX XXX)
    if (cleanNumber.match(/^[679]\d{8}$/)) {
      return cleanNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return phone;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phone;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  try {
    if (!phone) return false;
    
    // Clean the phone number
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Remove +34 if present
    let cleanNumber = cleaned;
    if (cleaned.startsWith('+34')) {
      cleanNumber = cleaned.substring(3);
    }
    
    // Validate Spanish phone number format (9 digits starting with 6, 7, or 9)
    return cleanNumber.match(/^[679]\d{8}$/) !== null;
  } catch (error) {
    console.error('Error validating phone number:', error);
    return false;
  }
};