import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

interface ProductStat {
  name: string;
  count: number;
  percentage: number;
}

interface CustomerStat {
  name: string;
  phone: string;
  orderCount: number;
  lastOrder: Date;
}

interface OrderTimeData {
  month: string;
  orders: number;
  completed: number;
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

  const topProducts: ProductStat[] = useMemo(() => {
    const productCounts = encargos.reduce((acc, encargo) => {
      acc[encargo.producto] = (acc[encargo.producto] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalOrders = encargos.length;
    
    return Object.entries(productCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [encargos]);

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
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-light text-stone-800">Dashboard</h2>
            <p className="text-stone-600 font-light">Análisis y métricas de tus encargos</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '6m' | '1y' | 'all')}
              className="select-field"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-lg font-light text-stone-800 mb-4">Encargos en el Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-lg font-light text-stone-800 mb-4">Productos Más Solicitados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 6)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Distribution */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 className="text-lg font-light text-stone-800 mb-4">Distribución de Productos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topProducts.slice(0, 6)}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                labelLine={false}
                fontSize={10}
              >
                {topProducts.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-stone-200">
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
                    <p className="text-sm text-stone-600 font-light">{customer.phone}</p>
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