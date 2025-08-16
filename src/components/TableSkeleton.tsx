import React from 'react';

interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 8 }) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          {/* Fixed Header */}
          <thead className="glass-badge sticky top-0 backdrop-blur-md z-10 bg-white/80">
            <tr>
              <th className="px-3 py-4 text-center w-12">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-24">
                Fecha
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-32">
                Producto
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Laboratorio
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-24">
                Almacén
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Pedido
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Recibido
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Entregado
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Persona
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-28">
                Teléfono
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-20">
                Avisado
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 tracking-wider w-24">
                Pagado (€)
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 tracking-wider w-36">
                Observaciones
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 tracking-wider w-20">
                Acciones
              </th>
            </tr>
          </thead>
          
          {/* Skeleton Rows */}
          <tbody className="divide-y divide-white/20">
            {Array.from({ length: rows }, (_, index) => (
              <tr key={index} className="table-row">
                {/* Checkbox skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                
                {/* Fecha skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                
                {/* Producto skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                
                {/* Laboratorio skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                
                {/* Almacén skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                
                {/* Pedido skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                
                {/* Recibido skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                
                {/* Entregado skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                
                {/* Persona skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                
                {/* Teléfono skeleton */}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                
                {/* Avisado skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                
                {/* Pagado skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                </td>
                
                {/* Observaciones skeleton */}
                <td className="px-3 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </td>
                
                {/* Acciones skeleton */}
                <td className="px-3 py-4 whitespace-nowrap text-right">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};