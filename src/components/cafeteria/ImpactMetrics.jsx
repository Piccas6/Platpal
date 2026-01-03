import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Droplets, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImpactMetrics({ cafeteriaName, dateRange = 'month' }) {
  const [metrics, setMetrics] = useState({
    mealsRecovered: 0,
    co2Saved: 0,
    waterSaved: 0,
    wasteAvoided: 0
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

      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const allReservations = await base44.entities.Reserva.list('-created_date', 500);
      const cafeteriaReservations = allReservations.filter(r => 
        r.cafeteria === cafeteriaName &&
        r.payment_status === 'completed' &&
        new Date(r.created_date) >= startDate
      );

      const mealsRecovered = cafeteriaReservations.length;
      const co2Saved = mealsRecovered * 2.5; // kg CO2 por menú
      const waterSaved = mealsRecovered * 150; // litros por menú
      const wasteAvoided = mealsRecovered * 0.5; // kg desperdicio por menú

      setMetrics({
        mealsRecovered,
        co2Saved: co2Saved.toFixed(1),
        waterSaved: Math.round(waterSaved),
        wasteAvoided: wasteAvoided.toFixed(1)
      });
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metricCards = [
    {
      icon: UtensilsCrossed,
      label: 'Menús Recuperados',
      value: metrics.mealsRecovered,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Leaf,
      label: 'CO₂ Evitado',
      value: `${metrics.co2Saved} kg`,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Droplets,
      label: 'Agua Ahorrada',
      value: `${metrics.waterSaved} L`,
      color: 'from-cyan-500 to-teal-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      icon: TrendingUp,
      label: 'Desperdicio Evitado',
      value: `${metrics.wasteAvoided} kg`,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Impacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricCards.map((metric, idx) => (
        <Card key={idx} className={`${metric.bgColor} border-2 hover:shadow-lg transition-all`}>
          <CardContent className="p-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
            <p className="text-2xl font-black text-gray-900">{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}