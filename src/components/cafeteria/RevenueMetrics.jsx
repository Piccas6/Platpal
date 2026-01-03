import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RevenueMetrics({ cafeteriaName, dateRange = 'month' }) {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growthRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [cafeteriaName, dateRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();

      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          previousStartDate.setDate(now.getDate() - 14);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          previousStartDate.setMonth(now.getMonth() - 2);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          previousStartDate.setFullYear(now.getFullYear() - 2);
          break;
      }

      const allReservations = await base44.entities.Reserva.list('-created_date', 1000);
      
      // Periodo actual
      const currentReservations = allReservations.filter(r => 
        r.cafeteria === cafeteriaName &&
        r.payment_status === 'completed' &&
        new Date(r.created_date) >= startDate
      );

      // Periodo anterior
      const previousReservations = allReservations.filter(r => 
        r.cafeteria === cafeteriaName &&
        r.payment_status === 'completed' &&
        new Date(r.created_date) >= previousStartDate &&
        new Date(r.created_date) < startDate
      );

      const totalRevenue = currentReservations.reduce((sum, r) => sum + (r.precio_total || 0), 0);
      const totalOrders = currentReservations.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const previousRevenue = previousReservations.reduce((sum, r) => sum + (r.precio_total || 0), 0);
      const growthRate = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue * 100) 
        : 0;

      setMetrics({
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        averageOrderValue: averageOrderValue.toFixed(2),
        growthRate: growthRate.toFixed(1)
      });
    } catch (error) {
      console.error('Error cargando métricas de revenue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueCards = [
    {
      icon: Euro,
      label: 'Ingresos Totales',
      value: `€${metrics.totalRevenue}`,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: ShoppingCart,
      label: 'Pedidos Completados',
      value: metrics.totalOrders,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Calendar,
      label: 'Ticket Promedio',
      value: `€${metrics.averageOrderValue}`,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      label: 'Crecimiento',
      value: `${metrics.growthRate}%`,
      color: metrics.growthRate >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-orange-600',
      bgColor: metrics.growthRate >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      badge: metrics.growthRate >= 0 ? 'positive' : 'negative'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {revenueCards.map((metric, idx) => (
        <Card key={idx} className={`${metric.bgColor} border-2 hover:shadow-lg transition-all`}>
          <CardContent className="p-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-gray-900">{metric.value}</p>
              {metric.badge && (
                <Badge className={metric.badge === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {metric.badge === 'positive' ? '↑' : '↓'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}