import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useDatabase } from '../context/DatabaseContext';
import { Encargo } from '../types';

interface DashboardMetrics {
  totalOrders: number;
  totalOrdersThisMonth: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number; // This would be calculated if you had pricing data
  ordersGrowth: number;
}


interface CustomerStat {
  name: string;
  phone: string | null;
  orderCount: number;
  lastOrder: Date;
}

interface OrderTimeData {
  month: string;
  orders: number;
  completed: number;
}

interface ProductLabStat {
  name: string;
  product: string;
  laboratory: string;
  count: number;
  percentage: number;
}

export const Dashboard: React.FC = () => {
  const { db } = useDatabase();
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');

  const loadEncargos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getEncargos();
      setEncargos(data);
    } catch (error) {
      console.error('Error loading encargos:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadEncargos();
  }, [loadEncargos]);

  const metrics: DashboardMetrics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const totalOrders = encargos.length;
    const thisMonthOrders = encargos.filter(e => {
      const fecha = new Date(e.fecha);
      return !isNaN(fecha.getTime()) && fecha >= thisMonth;
    });
    const lastMonthOrders = encargos.filter(e => {
      const fecha = new Date(e.fecha);
      return !isNaN(fecha.getTime()) && fecha >= lastMonth && fecha < thisMonth;
    });
    
    const totalOrdersThisMonth = thisMonthOrders.length;
    const pendingOrders = encargos.filter(e => !e.entregado).length;
    const completedOrders = encargos.filter(e => e.entregado).length;
    
    const ordersGrowth = lastMonthOrders.length > 0 
      ? ((totalOrdersThisMonth - lastMonthOrders.length) / lastMonthOrders.length) * 100 
      : 0;

    return {
      totalOrders,
      totalOrdersThisMonth,
      pendingOrders,
      completedOrders,
      revenue: 0, // Placeholder for future revenue calculation
      ordersGrowth
    };
  }, [encargos]);

  const ordersOverTime: OrderTimeData[] = useMemo(() => {
    const now = new Date();
    const months = timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24;
    const monthsData: OrderTimeData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthOrders = encargos.filter(e => {
        const fecha = new Date(e.fecha);
        return !isNaN(fecha.getTime()) && fecha >= date && fecha < nextMonth;
      });
      
      const completedCount = monthOrders.filter(e => e.entregado).length;
      
      monthsData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        orders: monthOrders.length,
        completed: completedCount
      });
    }

    return monthsData;
  }, [encargos, timeRange]);


  const topCustomers: CustomerStat[] = useMemo(() => {
    const customerStats = encargos.reduce((acc, encargo) => {
      const key = encargo.persona;
      if (!acc[key]) {
        acc[key] = {
          name: encargo.persona,
          phone: encargo.telefono,
          orderCount: 0,
          lastOrder: encargo.fecha
        };
      }
      acc[key].orderCount++;
      const fecha = new Date(encargo.fecha);
      if (!isNaN(fecha.getTime()) && fecha > acc[key].lastOrder) {
        acc[key].lastOrder = fecha;
      }
      return acc;
    }, {} as Record<string, CustomerStat>);

    return Object.values(customerStats)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  }, [encargos]);

  const productLabStats: ProductLabStat[] = useMemo(() => {
    const productLabCounts = encargos.reduce((acc, encargo) => {
      const product = encargo.producto;
      const lab = encargo.laboratorio || 'Sin laboratorio';
      const key = `${product} - ${lab}`;
      acc[key] = {
        product,
        laboratory: lab,
        count: (acc[key]?.count || 0) + 1
      };
      return acc;
    }, {} as Record<string, { product: string; laboratory: string; count: number }>);

    const totalOrders = encargos.length;
    
    return Object.entries(productLabCounts)
      .map(([key, data]) => ({
        name: key,
        product: data.product,
        laboratory: data.laboratory,
        count: data.count,
        percentage: (data.count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [encargos]);

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-stone-600 font-light">Cargando métricas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div 
        className="p-6 rounded-2xl shadow-sm border animate-slide-down"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 247, 237, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(249, 115, 22, 0.05)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in-delayed">
            <h2 className="text-2xl font-light text-stone-800 flex items-center">
              <svg className="w-6 h-6 mr-3 text-orange-500 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </h2>
            <p className="text-stone-600 font-light">Análisis y métricas de tus encargos</p>
          </div>
          
          <div className="mt-4 sm:mt-0 animate-fade-in-delayed">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '6m' | '1y' | 'all')}
              className="select-field transition-all duration-200 hover:scale-105"
            >
              <option value="6m">Últimos 6 meses</option>
              <option value="1y">Último año</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
        </div>
      </div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-stone-600">Total Encargos</p>
              <p className="text-3xl font-light text-stone-800">{metrics.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-stone-600">Este Mes</p>
              <p className="text-3xl font-light text-stone-800">{metrics.totalOrdersThisMonth}</p>
              {metrics.ordersGrowth !== 0 && (
                <p className={`text-sm font-light ${metrics.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.ordersGrowth > 0 ? '+' : ''}{metrics.ordersGrowth.toFixed(1)}% vs mes anterior
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-stone-600">Pendientes</p>
              <p className="text-3xl font-light text-stone-800">{metrics.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-stone-600">Entregados</p>
              <p className="text-3xl font-light text-stone-800">{metrics.completedOrders}</p>
              <p className="text-sm text-stone-500 font-light">
                {((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)}% del total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="w-full">
        {/* Orders Over Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-light text-stone-800">Encargos en el Tiempo</h3>
              <p className="text-sm text-stone-600 font-light">Evolución mensual de pedidos</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-stone-700 font-light">Total</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-stone-700 font-light">Entregados</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={ordersOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12} 
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#f97316" 
                strokeWidth={3}
                fill="url(#colorOrders)"
                dot={{ fill: '#f97316', r: 4 }}
                activeDot={{ r: 6, fill: '#f97316' }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorCompleted)"
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product/Lab Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="mb-6">
            <h3 className="text-xl font-light text-stone-800">Distribución Producto/Laboratorio</h3>
            <p className="text-sm text-stone-600 font-light">Análisis de productos más solicitados</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={productLabStats.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={30}
                    dataKey="count"
                    paddingAngle={1}
                  >
                    {productLabStats.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-lg font-light text-stone-800 mb-4">Detalles</h4>
              <div className="space-y-3">
                {productLabStats.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-light text-stone-800 break-words block" title={item.name}>
                          {item.product}
                        </span>
                        <span className="text-xs text-stone-600 font-light block">
                          {item.laboratory}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-3">
                      <span className="text-sm text-stone-800">{item.count}</span>
                      <span className="text-xs text-stone-600">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-lg font-light text-stone-800 mb-4">Mejores Clientes</h3>
          <div className="space-y-4">
            {topCustomers.slice(0, 6).map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-4 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-light text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-light text-stone-800">{customer.name}</p>
                    <p className="text-sm text-stone-600 font-light">{customer.phone || 'Sin teléfono'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-light text-stone-800">{customer.orderCount} encargos</p>
                  <p className="text-sm text-stone-600 font-light">
                    Último: {customer.lastOrder.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};