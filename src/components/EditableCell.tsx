import React, { useState, useRef, useEffect } from 'react';
import { validateName, validatePhone, validateAmount, validateText, sanitizeInput } from '../lib/validation';

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  type?: 'text' | 'date' | 'tel' | 'number';
  multiline?: boolean;
  field?: string; // Field name for specific validation
  maxWidth?: string; // CSS max-width for truncation
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  isEditing,
  onEdit,
  type = 'text',
  multiline = false,
  field,
  maxWidth
}) => {
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'date') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const formatDateForInput = (val: string) => {
    if (type === 'date' && val) {
      // If the value is already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return val;
      }
      try {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          // Format as local date to avoid timezone issues
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      } catch {}
    }
    return val;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const validateValue = (val: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput(val);
    
    if (!field) {
      return { isValid: true };
    }

    switch (field) {
      case 'persona':
      case 'nombre':
        return validateName(sanitized);
      case 'telefono':
        return validatePhone(sanitized);
      case 'pagado':
        return validateAmount(sanitized);
      case 'producto':
      case 'laboratorio':
      case 'almacen':
        return validateText(sanitized, field, true, 255);
      case 'observaciones':
        return validateText(sanitized, field, false, 1000);
      default:
        return validateText(sanitized, field, false, 500);
    }
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    
    if (trimmedValue === value.trim()) {
      setError(null);
      return; // No change
    }

    const validation = validateValue(trimmedValue);
    
    if (!validation.isValid) {
      setError(validation.error || 'Valor inválido');
      return;
    }

    setError(null);
    onSave(sanitizeInput(trimmedValue));
  };

  const handleCancel = () => {
    setEditValue(value);
  };

  const formatValue = (val: string) => {
    if (type === 'date' && val) {
      try {
        // If val is in YYYY-MM-DD format, parse it as local date
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [year, month, day] = val.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        }
        
        // Fallback for other date formats
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          return 'Fecha inválida';
        }
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return 'Fecha inválida';
      }
    }
    return val;
  };

  if (isEditing) {
    const hasError = !!error;
    const baseClassName = "w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2";
    const className = hasError 
      ? `${baseClassName} border-red-500 focus:ring-red-500 focus:ring-opacity-50`
      : `${baseClassName} border-primary focus:ring-primary focus:ring-opacity-50`;

    const commonProps = {
      ref: inputRef as any,
      value: type === 'date' ? formatDateForInput(editValue) : editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditValue(e.target.value);
        if (error) setError(null); // Clear error on new input
      },
      onKeyDown: handleKeyDown,
      onBlur: handleSave,
      className
    };

    const inputElement = multiline ? (
      <textarea
        {...commonProps}
        rows={2}
        placeholder="Observaciones..."
      />
    ) : (
      <input
        {...commonProps}
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        min={type === 'number' ? '0' : undefined}
        placeholder={type === 'tel' ? '+34...' : type === 'number' ? '0.00' : ''}
      />
    );

    return (
      <div className="relative">
        {inputElement}
        {error && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 z-10 whitespace-nowrap shadow-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  const formattedValue = value ? formatValue(value) : 'Clic para editar';
  const shouldTruncate = maxWidth && value && formattedValue.length > 20; // Truncate if longer than 20 chars

  return (
    <div
      onClick={onEdit}
      className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors group relative"
      title={shouldTruncate ? formattedValue : "Clic para editar"}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <span 
        className={`${!value && 'text-gray-400 italic'} ${shouldTruncate ? 'block truncate' : ''}`}
      >
        {formattedValue}
      </span>
      
      {/* Tooltip for full content */}
      {shouldTruncate && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs whitespace-normal shadow-lg">
          {formattedValue}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {multiline && value && (
        <div className="text-xs text-gray-500 mt-1">
          {multiline ? '(Ctrl+Enter para guardar)' : '(Enter para guardar, Esc para cancelar)'}
        </div>
      )}
    </div>
  );
};