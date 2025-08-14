import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export const normalizePhoneNumber = (phone: string, country: CountryCode = 'ES'): string => {
  try {
    if (!phone) return phone;
    
    if (isValidPhoneNumber(phone, country)) {
      const phoneNumber = parsePhoneNumber(phone, country);
      return phoneNumber.format('E.164');
    }
    
    if (phone.startsWith('+')) {
      const phoneNumber = parsePhoneNumber(phone);
      if (phoneNumber) {
        return phoneNumber.format('E.164');
      }
    }
    
    return phone;
  } catch (error) {
    console.error('Error normalizing phone number:', error);
    return phone;
  }
};

export const formatPhoneNumber = (phone: string, format: 'national' | 'international' = 'national'): string => {
  try {
    if (!phone) return phone;
    
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return format === 'national' 
        ? phoneNumber.formatNational() 
        : phoneNumber.formatInternational();
    }
    
    return phone;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phone;
  }
};

export const validatePhoneNumber = (phone: string, country: CountryCode = 'ES'): boolean => {
  try {
    if (!phone) return false;
    return isValidPhoneNumber(phone, country) || isValidPhoneNumber(phone);
  } catch (error) {
    console.error('Error validating phone number:', error);
    return false;
  }
};