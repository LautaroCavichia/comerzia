import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export const DataConsistencyChecker: React.FC = () => {
  const { db } = useDatabase();
  const [checking, setChecking] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [results, setResults] = useState<{
    orphanedEncargos: number;
    inconsistentPersonas: number;
    duplicatePhones: number;
  } | null>(null);
  const [repairResults, setRepairResults] = useState<{
    fixed: number;
    errors: string[];
  } | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const consistency = await db.checkDataConsistency();
      setResults(consistency);
    } catch (error) {
      console.error('Error checking data consistency:', error);
      alert('Error al verificar consistencia de datos');
    } finally {
      setChecking(false);
    }
  };

  const handleRepair = async () => {
    setRepairing(true);
    try {
      const repair = await db.repairDataInconsistencies();
      setRepairResults(repair);
      // Re-check after repair
      const consistency = await db.checkDataConsistency();
      setResults(consistency);
    } catch (error) {
      console.error('Error repairing data:', error);
      alert('Error al reparar inconsistencias');
    } finally {
      setRepairing(false);
    }
  };

  const hasIssues = results && (
    results.orphanedEncargos > 0 || 
    results.inconsistentPersonas > 0 || 
    results.duplicatePhones > 0
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Verificador de Consistencia de Datos</h3>
          <p className="text-sm text-gray-600">Detecta y repara inconsistencias en la base de datos</p>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="glass-button-sm"
        >
          {checking ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              results.orphanedEncargos > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
            }`}>
              <div className="text-2xl font-bold text-gray-900">{results.orphanedEncargos}</div>
              <div className="text-sm text-gray-600">Pedidos huérfanos</div>
              <div className="text-xs text-gray-500 mt-1">
                Pedidos sin cliente correspondiente
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              results.inconsistentPersonas > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
            }`}>
              <div className="text-2xl font-bold text-gray-900">{results.inconsistentPersonas}</div>
              <div className="text-sm text-gray-600">Nombres inconsistentes</div>
              <div className="text-xs text-gray-500 mt-1">
                Pedidos con nombres que no coinciden
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              results.duplicatePhones > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'
            }`}>
              <div className="text-2xl font-bold text-gray-900">{results.duplicatePhones}</div>
              <div className="text-sm text-gray-600">Teléfonos duplicados</div>
              <div className="text-xs text-gray-500 mt-1">
                Múltiples clientes con el mismo teléfono
              </div>
            </div>
          </div>

          {hasIssues && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div>
                <div className="font-medium text-yellow-800">
                  Se encontraron inconsistencias en los datos
                </div>
                <div className="text-sm text-yellow-600">
                  Se recomienda ejecutar la reparación automática
                </div>
              </div>
              <button
                onClick={handleRepair}
                disabled={repairing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {repairing ? 'Reparando...' : 'Reparar Automáticamente'}
              </button>
            </div>
          )}

          {!hasIssues && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="font-medium text-green-800">
                  ¡Datos consistentes! No se encontraron problemas.
                </div>
              </div>
            </div>
          )}

          {repairResults && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="font-medium text-blue-800 mb-2">Resultados de la Reparación</div>
              <div className="text-sm text-blue-600">
                <div>✅ {repairResults.fixed} inconsistencias corregidas</div>
                {repairResults.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium text-red-700">Errores encontrados:</div>
                    {repairResults.errors.map((error, index) => (
                      <div key={index} className="text-red-600 text-xs">• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <div className="font-medium mb-1">¿Qué verifica esta herramienta?</div>
        <ul className="space-y-1">
          <li>• <strong>Pedidos huérfanos:</strong> Pedidos que no tienen un cliente correspondiente en la tabla de personas</li>
          <li>• <strong>Nombres inconsistentes:</strong> Pedidos donde el nombre no coincide con el cliente que tiene el mismo teléfono</li>
          <li>• <strong>Teléfonos duplicados:</strong> Múltiples clientes registrados con el mismo número de teléfono</li>
        </ul>
      </div>
    </div>
  );
};