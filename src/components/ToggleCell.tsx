import React from 'react';

interface ToggleCellProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleCell: React.FC<ToggleCellProps> = ({ value, onChange }) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        value
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      }`}
      title={`Clic para cambiar a ${value ? 'No' : 'Sí'}`}
    >
      {value ? (
        <>
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Sí
        </>
      ) : (
        <>
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          No
        </>
      )}
    </button>
  );
};