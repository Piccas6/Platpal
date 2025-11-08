
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import withAuth from '../components/auth/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, UtensilsCrossed, Clock, Star, TrendingUp, Building, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function AnalyticsDashboard({ user }) {
  const [events, setEvents] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticEvents, allUsers] = await Promise.all([
          base44.entities.AnalyticsEvent.list('-created_date'),
          base44.entities.User.list()
        ]);
        
        setEvents(analyticEvents);

        const cafeteriaUsers = allUsers.filter(u => u.app_role === 'cafeteria' && u.cafeteria_info?.nombre_cafeteria);
        
        if (user.app_role === 'manager') {
            const managedCafeterias = user.cafeterias_gestionadas || [];
            const filteredCafeterias = cafeteriaUsers.filter(c => managedCafeterias.includes(c.cafeteria_info.nombre_cafeteria));
            setCafeterias(filteredCafeterias);
            // Default to first managed cafeteria if available
            if (filteredCafeterias.length > 0) {
              setSelectedCafeteria(filteredCafeterias[0].cafeteria_info.nombre_cafeteria);
            } else {
              setSelectedCafeteria('none');
            }
        } else { // Admin
            setCafeterias(cafeteriaUsers);
        }

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredEvents = useMemo(() => {
    if (selectedCafeteria === 'all') return events;
    if (selectedCafeteria === 'none') return [];
    return events.filter(event => event.cafeteria_name === selectedCafeteria);
  }, [events, selectedCafeteria]);

  const stats = useMemo(() => {
    const totalSales = filteredEvents.length;
    const totalRevenue = filteredEvents.reduce((sum, event) => sum + event.precio, 0);

    const peakHoursData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    filteredEvents.forEach(event => {
      const hour = new Date(event.created_date).getHours();
      peakHoursData[hour].count++;
    });

    const dishCounts = filteredEvents
        .filter(event => !event.is_surprise && event.plato_principal)
        .reduce((acc, event) => {
            acc[event.plato_principal] = (acc[event.plato_principal] || 0) + 1;
            return acc;
        }, {});
    
    const topDishes = Object.entries(dishCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return { totalSales, totalRevenue, peakHoursData: peakHoursData.filter(h => h.count > 0), topDishes };
  }, [filteredEvents]);

  if (isLoading) {
    return <div className="p-8">Cargando analíticas...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Panel de Analíticas</h1>
                    <p className="text-gray-600 mt-1">Rendimiento y patrones de consumo.</p>
                </div>
            </div>
            {cafeterias.length > 0 && (
                 <div className="w-full md:w-64">
                    <Select value={selectedCafeteria} onValueChange={setSelectedCafeteria}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una cafetería" />
                        </SelectTrigger>
                        <SelectContent>
                            {user.app_role === 'admin' && <SelectItem value="all">Todas las Cafeterías</SelectItem>}
                            {cafeterias.map(c => (
                                <SelectItem key={c.id} value={c.cafeteria_info.nombre_cafeteria}>{c.cafeteria_info.nombre_cafeteria}</SelectItem>
                            ))}
                             {user.app_role === 'manager' && cafeterias.length === 0 && <SelectItem value="none" disabled>No tienes cafeterías asignadas</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Menús Vendidos</CardTitle><UtensilsCrossed className="h-4 w-4 text-emerald-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalSales}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle><DollarSign className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div></CardContent></Card>
             <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ticket Medio</CardTitle><TrendingUp className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">€{stats.totalSales > 0 ? (stats.totalRevenue / stats.totalSales).toFixed(2) : '0.00'}</div></CardContent></Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5"/>Horas Punta de Recogida</CardTitle></CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.peakHoursData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tick={{ fontSize: 12 }}/>
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e5e7eb', borderRadius: '8px' }}/>
                            <Bar dataKey="count" name="Menús" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5"/>Platos Más Populares</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.topDishes.length > 0 ? stats.topDishes.map((dish, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <p className="font-medium truncate pr-4">{dish.name}</p>
                                <Badge variant="secondary">{dish.count} ventas</Badge>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-10">No hay datos de platos (los menús sorpresa no cuentan).</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AnalyticsDashboard, ['admin', 'manager']);
