
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client"; // FIXED: Use base44 SDK
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import withAuth from "../components/auth/withAuth";
import {
  UserCheck,
  TrendingUp,
  Euro,
  Package,
  Search,
  Download,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
// Removed useNavigate, useLocation as they were imported but not used

function ManagerDashboard({ user }) {
  // Removed navigate, location declarations as they were not used
  const [stats, setStats] = useState({
    totalReservasHoy: 0,
    ingresosHoy: 0,
    menusPublicados: 0,
    tasaOcupacion: 0
  });
  const [reservations, setReservations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    cafeteria: 'all',
    estado: 'all',
    fecha: new Date().toISOString().split('T')[0],
    search: ''
  });

  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // FIX: Asegurarse de que cafeterias_gestionadas es un array
      const managedCafeterias = Array.isArray(user.cafeterias_gestionadas)
        ? user.cafeterias_gestionadas
        : [];

      if (managedCafeterias.length === 0) {
        setIsLoading(false);
        return;
      }

      console.log(forceRefresh ? '🔄 Forzando recarga...' : '📊 Cargando datos del manager...');
      console.log('🏢 Cafeterías gestionadas:', managedCafeterias);

      // FIXED: Use base44.entities instead of direct imports
      const allReservations = await base44.entities.Reserva.list('-created_date');
      const managedReservations = allReservations.filter(r =>
        managedCafeterias.includes(r.cafeteria)
      );
      setReservations(managedReservations);

      const allMenus = await base44.entities.Menu.list('-created_date');
      const managedMenus = allMenus.filter(m =>
        managedCafeterias.includes(m.cafeteria)
      );
      setMenus(managedMenus);

      const allUsers = await base44.entities.User.list();
      const cafeteriaUsers = allUsers.filter(u =>
        u.app_role === 'cafeteria' &&
        managedCafeterias.includes(u.cafeteria_info?.nombre_cafeteria)
      );
      setCafeterias(cafeteriaUsers);

      // Calcular estadísticas del día
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = managedReservations.filter(r =>
        r.created_date?.startsWith(today) && r.payment_status === 'completed'
      );
      const todayMenus = managedMenus.filter(m => m.fecha === today);

      const totalStock = todayMenus.reduce((acc, m) => acc + m.stock_total, 0);
      const stockVendido = todayMenus.reduce((acc, m) =>
        acc + (m.stock_total - m.stock_disponible), 0
      );
      const tasaOcupacion = totalStock > 0 ? (stockVendido / totalStock) * 100 : 0;

      setStats({
        totalReservasHoy: todayReservations.length,
        ingresosHoy: todayReservations.reduce((acc, r) => acc + (r.precio_total || 0), 0),
        menusPublicados: todayMenus.length,
        tasaOcupacion: tasaOcupacion.toFixed(1)
      });

      console.log('✅ Datos del manager cargados');

    } catch (error) {
      // FIXED: Mejor manejo de errores de rate limit
      if (error.message?.includes('Rate limit')) {
        console.warn('⚠️ Rate limit alcanzado, esperando antes de reintentar...');
      } else {
        console.error("Error loading data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user.cafeterias_gestionadas]);

  useEffect(() => {
    loadData();

    // FIXED: Cambiado de 60s a 120s para evitar rate limit
    const interval = setInterval(() => loadData(), 120000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredReservations = reservations.filter(r => {
    const cafeteriaMatch = filters.cafeteria === 'all' || r.cafeteria === filters.cafeteria;
    const estadoMatch = filters.estado === 'all' || r.estado === filters.estado;
    const fechaMatch = !filters.fecha || r.created_date?.startsWith(filters.fecha);
    const searchMatch = !filters.search ||
      r.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.codigo_recogida?.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.menus_detalle?.toLowerCase().includes(filters.search.toLowerCase());

    return cafeteriaMatch && estadoMatch && fechaMatch && searchMatch;
  });

  const exportToCSV = () => {
    const headers = ['Fecha', 'Estudiante', 'Cafetería', 'Menú', 'Estado', 'Precio', 'Código'];
    const rows = filteredReservations.map(r => [
      new Date(r.created_date).toLocaleDateString('es-ES'),
      r.user_name,
      r.cafeteria,
      r.menus_detalle,
      r.estado,
      `€${r.precio_total?.toFixed(2)}`,
      r.codigo_recogida
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservas_${filters.fecha}.csv`;
    link.click();
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'reservado': <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Reservado</Badge>,
      'pagado': <Badge variant="outline" className="bg-green-50 text-green-700">Pagado</Badge>,
      'recogido': <Badge variant="outline" className="bg-blue-50 text-blue-700">Recogido</Badge>,
      'cancelado': <Badge variant="outline" className="bg-red-50 text-red-700">Cancelado</Badge>
    };
    return badges[estado] || <Badge>{estado}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!user.cafeterias_gestionadas || user.cafeterias_gestionadas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-6 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-600">Sin Cafeterías Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Actualmente no tienes cafeterías asignadas para gestionar. Contacta con un administrador para que te asigne cafeterías.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Manager</h1>
            <p className="text-gray-600 mt-1">
              Supervisando {user.cafeterias_gestionadas.length} {user.cafeterias_gestionadas.length === 1 ? 'cafetería' : 'cafeterías'}
            </p>
          </div>
          <Button onClick={() => loadData(true)} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Estadísticas Clave */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reservas Hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReservasHoy}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Hoy</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">€{stats.ingresosHoy.toFixed(2)}</p>
                </div>
                <Euro className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menús Publicados</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.menusPublicados}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasa Ocupación</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{stats.tasaOcupacion}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Exportación */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Historial de Reservas
              </CardTitle>
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>

              <Select value={filters.cafeteria} onValueChange={(value) => setFilters(prev => ({ ...prev, cafeteria: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las cafeterías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cafeterías</SelectItem>
                  {user.cafeterias_gestionadas.map(caf => (
                    <SelectItem key={caf} value={caf}>{caf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="recogido">Recogido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.fecha}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tabla de Reservas */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredReservations.length > 0 ? (
                filteredReservations.map(reserva => (
                  <div key={reserva.id} className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-md transition-shadow">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Estudiante</p>
                        <p className="font-semibold text-gray-900">{reserva.user_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{reserva.cafeteria}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Menú</p>
                        <p className="text-sm text-gray-700">{reserva.menus_detalle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Código</p>
                        <p className="font-mono font-bold text-teal-600">{reserva.codigo_recogida}</p>
                      </div>
                      <div className="text-right">
                        {getEstadoBadge(reserva.estado)}
                        <p className="text-lg font-bold text-emerald-600 mt-1">€{reserva.precio_total?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(reserva.created_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron reservas con los filtros aplicados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumen por Cafetería */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Cafetería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cafeterias.map(caf => {
                const cafReservations = reservations.filter(r =>
                  r.cafeteria === caf.cafeteria_info?.nombre_cafeteria &&
                  r.created_date?.startsWith(filters.fecha) &&
                  r.payment_status === 'completed'
                );
                const cafMenus = menus.filter(m =>
                  m.cafeteria === caf.cafeteria_info?.nombre_cafeteria &&
                  m.fecha === filters.fecha
                );
                const ingresos = cafReservations.reduce((acc, r) => acc + (r.precio_total || 0), 0);

                return (
                  <div key={caf.id} className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{caf.cafeteria_info?.nombre_cafeteria}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cafMenus.length} menús publicados • {cafReservations.length} ventas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">€{ingresos.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Ingresos del día</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ManagerDashboard, ['manager', 'admin']);
