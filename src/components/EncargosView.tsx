import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Encargo } from '../types';
import { EncargosTable } from './EncargosTable';
import { SearchBar } from './SearchBar';
import { AddEncargoModal } from './AddEncargoModal';
import { Pagination } from './Pagination';
import { QuickFilters, QuickFilter } from './QuickFilters';
import { useDatabase } from '../context/DatabaseContext';
import { TableSkeleton } from './TableSkeleton';

export const EncargosView: React.FC = () => {
  const { db } = useDatabase();
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Quick filters state
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [showDeliveredToggle, setShowDeliveredToggle] = useState<boolean>(false);

  // Debounce search query to prevent searching on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCounts = useCallback(async () => {
    try {
      const countsData = await db.getEncargosCounts();
      setCounts(countsData);
      
      // Update quick filters with counts
      const filters: QuickFilter[] = [
        {
          id: 'all',
          label: 'Todos',
          count: countsData.total,
          active: activeQuickFilter === 'all',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
        },
        {
          id: 'today',
          label: 'Hoy',
          count: countsData.today,
          active: activeQuickFilter === 'today',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
        },
        {
          id: 'thisWeek',
          label: 'Esta semana',
          count: countsData.thisWeek,
          active: activeQuickFilter === 'thisWeek',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
        },
        {
          id: 'pending',
          label: 'Pendientes',
          count: countsData.pending,
          active: activeQuickFilter === 'pending',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
        },
        {
          id: 'delivered',
          label: 'Entregados',
          count: countsData.delivered,
          active: activeQuickFilter === 'delivered',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
        }
      ];
      
      setQuickFilters(filters);
    } catch (err) {
      console.error('Error loading counts:', err);
    }
  }, [db, activeQuickFilter]);

  const loadEncargos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (debouncedSearchQuery.trim()) {
        // Use search when there's a query
        const searchResults = await db.searchEncargos(debouncedSearchQuery);
        const filteredResults = applyQuickFilter(searchResults);
        setEncargos(filteredResults);
        setTotalCount(filteredResults.length);
        setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
      } else {
        // Use paginated query for better performance
        const result = await db.getEncargosPaginated(currentPage, itemsPerPage);
        const filteredResults = applyQuickFilter(result.encargos);
        setEncargos(filteredResults);
        
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      setError('Error al cargar los encargos');
      console.error('Error loading encargos:', err);
    } finally {
      setLoading(false);
    }
  }, [db, currentPage, itemsPerPage, debouncedSearchQuery, activeQuickFilter, showDeliveredToggle]);

  const applyQuickFilter = (data: Encargo[]): Encargo[] => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    // Calculate start of week (Monday) - getDay() returns 0 for Sunday, 1 for Monday, etc.
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 6 days back, others = dayOfWeek - 1
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    // First apply the selected filter
    let filteredData: Encargo[];
    switch (activeQuickFilter) {
      case 'today':
        filteredData = data.filter(e => {
          const orderDate = new Date(e.fecha);
          orderDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
          return orderDate >= startOfDay;
        });
        break;
      case 'thisWeek':
        filteredData = data.filter(e => {
          const orderDate = new Date(e.fecha);
          orderDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
          return orderDate >= startOfWeek;
        });
        break;
      case 'pending':
        filteredData = data.filter(e => !e.entregado);
        break;
      case 'delivered':
        filteredData = data.filter(e => e.entregado);
        break;
      default:
        filteredData = data;
        break;
    }

    // Then hide delivered orders unless toggle is active
    if (!showDeliveredToggle) {
      filteredData = filteredData.filter(e => !e.entregado);
    }

    return filteredData;
  };

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadEncargos();
  }, [loadEncargos]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Reset to first page when debounced search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleQuickFilterChange = (filterId: string) => {
    setActiveQuickFilter(filterId);
    setCurrentPage(1); // Reset to first page when filtering
    
    // If selecting "delivered" filter, automatically turn on the toggle
    if (filterId === 'delivered') {
      setShowDeliveredToggle(true);
    }
    
    // Update filter states
    setQuickFilters(prev => 
      prev.map(f => ({ ...f, active: f.id === filterId }))
    );
  };

  const handleToggleDelivered = () => {
    setShowDeliveredToggle(prev => !prev);
    setCurrentPage(1); // Reset to first page when toggling
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleAddEncargo = () => {
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    if (encargos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csvHeaders = [
      'Fecha', 'Producto', 'Laboratorio', 'Almacén', 'Pedido', 'Recibido', 'Entregado',
      'Persona', 'Teléfono', 'Avisado', 'Señal (€)', 'Observaciones'
    ];

    const csvData = encargos.map(encargo => [
      encargo.fecha instanceof Date && !isNaN(encargo.fecha.getTime()) 
        ? encargo.fecha.toLocaleDateString('es-ES') 
        : 'Fecha inválida',
      encargo.producto,
      encargo.laboratorio,
      encargo.almacen,
      encargo.pedido ? 'Sí' : 'No',
      encargo.recibido ? 'Sí' : 'No',
      encargo.entregado ? 'Sí' : 'No',
      encargo.persona,
      encargo.telefono,
      encargo.avisado ? 'Sí' : 'No',
      (typeof encargo.pagado === 'number' && !isNaN(encargo.pagado)) 
        ? encargo.pagado.toFixed(2) 
        : '0.00',
      encargo.observaciones || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `encargos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEncargoCreated = () => {
    loadEncargos();
    loadCounts();
    setIsAddModalOpen(false);
  };

  const handleEncargoUpdated = () => {
    loadEncargos();
    loadCounts();
  };

  const handleEncargoDeleted = () => {
    loadEncargos();
    loadCounts();
  };


  return (
    <div 
      className="space-y-6 animate-fade-in"
      style={{
        background: 'radial-gradient(ellipse at top, rgba(249, 115, 22, 0.02) 0%, transparent 50%)',
        minHeight: '100vh',
        paddingBottom: '2rem'
      }}
    >

      {error && (
        <div className="glass-card border border-red-200/30 p-4 bg-red-50/50 transition-all duration-500 ease-in-out">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-light text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1 font-light">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <QuickFilters
        filters={quickFilters}
        onFilterChange={handleQuickFilterChange}
      />


      <div 
        className="p-6 rounded-2xl animate-slide-down"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 247, 237, 0.75) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(249, 115, 22, 0.05)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-lg transform transition-all duration-300 hover:scale-[1.02]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleToggleDelivered}
              className={`inline-flex items-center px-3 py-2.5 text-sm font-light rounded-xl transition-all duration-300 border transform hover:scale-105 hover:shadow-sm ${
                showDeliveredToggle
                  ? 'bg-gradient-to-r from-orange-50 to-orange-100/70 border-orange-300/60 text-orange-700 shadow-sm'
                  : 'bg-gradient-to-r from-white/80 to-gray-50/70 border-gray-300/60 text-gray-600 hover:from-gray-50 hover:to-gray-100/70 hover:border-gray-400/60'
              }`}
              style={{
                backdropFilter: 'blur(8px)'
              }}
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Ver entregados</span>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                showDeliveredToggle
                  ? 'bg-orange-200/60 text-orange-700'
                  : 'bg-gray-200/60 text-gray-600'
              }`}>
                {counts.delivered || 0}
              </span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light text-stone-700 border transition-all duration-300 shadow-sm transform hover:scale-105 hover:shadow-md group"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 247, 237, 0.8) 100%)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="transition-colors duration-200 group-hover:text-stone-800">Exportar CSV</span>
            </button>

            <button
              onClick={handleAddEncargo}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light text-white transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg group"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
              }}
            >
              <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nuevo Encargo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <TableSkeleton rows={10} />
        ) : (
          <EncargosTable
            encargos={encargos}
            onUpdate={handleEncargoUpdated}
            onDelete={handleEncargoDeleted}
          />
        )}

        {/* Pagination */}
        {totalCount >= 24 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {isAddModalOpen && (
        <AddEncargoModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleEncargoCreated}
        />
      )}
    </div>
  );
};