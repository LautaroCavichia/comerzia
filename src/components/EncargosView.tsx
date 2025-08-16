import React, { useState, useEffect, useCallback } from 'react';
import { Encargo } from '../types';
import { EncargosTable } from './EncargosTable';
import { SearchBar } from './SearchBar';
import { AddEncargoModal } from './AddEncargoModal';
import { useDatabase } from '../context/DatabaseContext';

export const EncargosView: React.FC = () => {
  const { db } = useDatabase();
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [filteredEncargos, setFilteredEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth'>('all');
  const [showDelivered, setShowDelivered] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEncargos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getEncargos();
      setEncargos(data);
      setFilteredEncargos(data);
    } catch (err) {
      setError('Error al cargar los encargos');
      console.error('Error loading encargos:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadEncargos();
  }, [loadEncargos]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, dateFilter, showDelivered, encargos]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = async () => {
    try {
      let results = encargos;
      
      // Apply search filter
      if (searchQuery.trim()) {
        results = await db.searchEncargos(searchQuery);
      }
      
      // Apply date filter
      if (dateFilter === 'thisMonth') {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        results = results.filter(encargo => {
          const encargoDate = new Date(encargo.fecha);
          return !isNaN(encargoDate.getTime()) && 
                 encargoDate.getMonth() === currentMonth && 
                 encargoDate.getFullYear() === currentYear;
        });
      }

      // Apply delivered orders filter
      if (!showDelivered) {
        results = results.filter(encargo => !encargo.entregado);
      }
      
      setFilteredEncargos(results);
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilteredEncargos(encargos);
    }
  };
  
  const handleSearch = async (query: string) => {
    // This will trigger applyFilters via useEffect
  };

  const handleAddEncargo = () => {
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredEncargos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csvHeaders = [
      'Fecha', 'Producto', 'Laboratorio', 'Almacén', 'Pedido', 'Recibido', 'Entregado',
      'Persona', 'Teléfono', 'Avisado', 'Pagado (€)', 'Observaciones'
    ];

    const csvData = filteredEncargos.map(encargo => [
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
    setIsAddModalOpen(false);
  };

  const handleEncargoUpdated = () => {
    loadEncargos();
  };

  const handleEncargoDeleted = () => {
    loadEncargos();
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-lg">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
          
          <div className="min-w-0 sm:w-48">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'thisMonth')}
              className="select-field w-full"
            >
              <option value="all">Todos los registros</option>
              <option value="thisMonth">Este mes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-light transition-all focus:outline-none focus:ring-2 ${
              showDelivered
                ? 'bg-white/90 backdrop-blur-xl bg-green-50/50 text-green-700 border border-green-200/30 hover:bg-green-100/50 focus:ring-green-500/20 shadow-sm rounded-xl'
                : 'bg-white/90 backdrop-blur-xl text-stone-700 border border-stone-200 hover:bg-white/40 focus:ring-orange-500/20 shadow-sm rounded-xl'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showDelivered ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              )}
            </svg>
            {showDelivered ? 'Ocultar Entregados' : 'Mostrar Entregados'}
          </button>

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

      <EncargosTable
        encargos={filteredEncargos}
        onUpdate={handleEncargoUpdated}
        onDelete={handleEncargoDeleted}
      />

      {isAddModalOpen && (
        <AddEncargoModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleEncargoCreated}
        />
      )}
    </div>
  );
};