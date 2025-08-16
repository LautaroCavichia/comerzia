import React from 'react';

export interface QuickFilter {
  id: string;
  label: string;
  count?: number;
  active: boolean;
  icon?: React.ReactNode;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  onFilterChange: (filterId: string) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white/90 backdrop-blur-xl border border-stone-200 rounded-xl">
      <div className="flex items-center text-sm font-medium text-stone-700 mr-3">
        Filtros rápidos:
      </div>
      
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-light rounded-lg transition-all duration-200 border ${
            filter.active
              ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          {filter.icon && (
            <span className="mr-1.5 flex-shrink-0">
              {filter.icon}
            </span>
          )}
          <span>{filter.label}</span>
          {typeof filter.count === 'number' && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              filter.active
                ? 'bg-orange-100 text-orange-600'
                : 'bg-stone-100 text-stone-500'
            }`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};