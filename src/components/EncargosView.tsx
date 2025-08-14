import React, { useState, useEffect } from 'react';
import { Encargo } from '../types';
import { EncargosTable } from './EncargosTable';
import { SearchBar } from './SearchBar';
import { AddEncargoModal } from './AddEncargoModal';
import { db } from '../lib/database';

export const EncargosView: React.FC = () => {
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [filteredEncargos, setFilteredEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEncargos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, dateFilter, encargos]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEncargos = async () => {
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
  };

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
          return encargoDate.getMonth() === currentMonth && 
                 encargoDate.getFullYear() === currentYear;
        });
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
      'Fecha', 'Producto', 'Laboratorio', 'Almacén', 'Pedido', 'Recibido',
      'Persona', 'Teléfono', 'Avisado', 'Pagado', 'Observaciones'
    ];

    const csvData = filteredEncargos.map(encargo => [
      encargo.fecha.toLocaleDateString('es-ES'),
      encargo.producto,
      encargo.laboratorio,
      encargo.almacen,
      encargo.pedido ? 'Sí' : 'No',
      encargo.recibido ? 'Sí' : 'No',
      encargo.persona,
      encargo.telefono,
      encargo.avisado ? 'Sí' : 'No',
      encargo.pagado ? 'Sí' : 'No',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando encargos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
            onClick={handleExportCSV}
            className="btn-secondary inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>

          <button
            onClick={handleAddEncargo}
            className="btn-primary inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
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