import React, { useState, useEffect, useCallback } from 'react';
import { Encargo } from '../types';
import { EncargosTable } from './EncargosTable';
import { SearchBar } from './SearchBar';
import { AddEncargoModal } from './AddEncargoModal';
import { Pagination } from './Pagination';
import { QuickFilters, QuickFilter } from './QuickFilters';
import { useDatabase } from '../context/DatabaseContext';

export const EncargosView: React.FC = () => {
  const { db } = useDatabase();
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
          id: 'received',
          label: 'Recibidos',
          count: countsData.received,
          active: activeQuickFilter === 'received',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        },
        {
          id: 'delivered',
          label: 'Entregados',
          count: countsData.delivered,
          active: activeQuickFilter === 'delivered',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
        },
        {
          id: 'paid',
          label: 'Pagados',
          count: countsData.paid,
          active: activeQuickFilter === 'paid',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
        },
        {
          id: 'unpaid',
          label: 'Sin pagar',
          count: countsData.unpaid,
          active: activeQuickFilter === 'unpaid',
          icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
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
      
      if (searchQuery.trim()) {
        // Use search when there's a query
        const searchResults = await db.searchEncargos(searchQuery);
        setEncargos(applyQuickFilter(searchResults));
        setTotalCount(searchResults.length);
        setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
      } else {
        // Use paginated query for better performance
        const result = await db.getEncargosPaginated(currentPage, itemsPerPage);
        setEncargos(applyQuickFilter(result.encargos));
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      setError('Error al cargar los encargos');
      console.error('Error loading encargos:', err);
    } finally {
      setLoading(false);
    }
  }, [db, currentPage, itemsPerPage, searchQuery, activeQuickFilter]);

  const applyQuickFilter = (data: Encargo[]): Encargo[] => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    switch (activeQuickFilter) {
      case 'today':
        return data.filter(e => {
          const orderDate = new Date(e.fecha);
          return orderDate >= startOfDay;
        });
      case 'thisWeek':
        return data.filter(e => {
          const orderDate = new Date(e.fecha);
          return orderDate >= startOfWeek;
        });
      case 'pending':
        return data.filter(e => !e.entregado);
      case 'received':
        return data.filter(e => e.recibido);
      case 'delivered':
        return data.filter(e => e.entregado);
      case 'paid':
        return data.filter(e => e.pagado > 0);
      case 'unpaid':
        return data.filter(e => e.pagado === 0);
      default:
        return data;
    }
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

  const handleQuickFilterChange = (filterId: string) => {
    setActiveQuickFilter(filterId);
    setCurrentPage(1); // Reset to first page when filtering
    
    // Update filter states
    setQuickFilters(prev => 
      prev.map(f => ({ ...f, active: f.id === filterId }))
    );
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
      'Persona', 'Teléfono', 'Avisado', 'Pagado (€)', 'Observaciones'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-stone-600 font-light">Cargando encargos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass-card border border-red-200/30 p-4 bg-red-50/50">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-lg">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light text-stone-700 bg-white/90 backdrop-blur-xl border border-stone-200 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all duration-200 shadow-sm"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>

          <button
            onClick={handleAddEncargo}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Encargo
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <EncargosTable
          encargos={encargos}
          onUpdate={handleEncargoUpdated}
          onDelete={handleEncargoDeleted}
        />

        {/* Pagination */}
        {totalCount > 0 && (
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