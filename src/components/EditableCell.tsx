import React, { useState, useRef, useEffect } from 'react';

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  type?: 'text' | 'date' | 'tel';
  multiline?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  isEditing,
  onEdit,
  type = 'text',
  multiline = false
}) => {
  const [editValue, setEditValue] = useState(value);
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

  const handleSave = () => {
    if (editValue.trim() !== value.trim()) {
      onSave(editValue.trim());
    }
  };

  const handleCancel = () => {
    setEditValue(value);
  };

  const formatValue = (val: string) => {
    if (type === 'date' && val) {
      try {
        const date = new Date(val);
        return date.toLocaleDateString('es-ES');
      } catch {
        return val;
      }
    }
    return val;
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleSave,
      className: "w-full border border-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          rows={2}
          placeholder="Observaciones..."
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={type}
        placeholder={type === 'tel' ? '+34...' : ''}
      />
    );
  }

  return (
    <div
      onClick={onEdit}
      className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
      title="Clic para editar"
    >
      <span className={`${!value && 'text-gray-400 italic'}`}>
        {value ? formatValue(value) : 'Clic para editar'}
      </span>
      {multiline && value && (
        <div className="text-xs text-gray-500 mt-1">
          {multiline ? '(Ctrl+Enter para guardar)' : '(Enter para guardar, Esc para cancelar)'}
        </div>
      )}
    </div>
  );
};