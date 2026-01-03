import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import withAuth from "../components/auth/withAuth";
import ReferralDashboard from "../components/admin/ReferralDashboard";
import { 
  Shield, Users, TrendingUp, RefreshCw, BarChart3,
  Euro, UtensilsCrossed, Building2, CheckCircle, XCircle,
  Clock, AlertCircle, Gift
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalCafeterias: 0,
    reservasHoy: 0,
    ingresosHoy: 0,
    menusActivos: 0,
    cafeteriasPendientes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [cafeterias, setCafeterias] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allMenus, allReservations, allCafeterias] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Menu.list('-created_date'),
        base44.entities.Reserva.list('-created_date'),
        base44.entities.Cafeteria.list('-created_date')
      ]);

      setUsers(allUsers);
      setCafeterias(allCafeterias);

      const today = new Date().toISOString().split('T')[0];
      const todayReservations = allReservations.filter(r => 
        r.created_date?.startsWith(today) && r.payment_status === 'completed'
      );
      const todayMenus = allMenus.filter(m => m.fecha === today && m.stock_disponible > 0);
      const pendientes = allCafeterias.filter(c => 
        c.estado_onboarding === 'en_revision' && !c.aprobada
      );

      setStats({
        totalUsuarios: allUsers.length,
        totalCafeterias: allUsers.filter(u => u.app_role === 'cafeteria').length,
        reservasHoy: todayReservations.length,
        ingresosHoy: todayReservations.reduce((sum, r) => sum + (r.precio_total || 0), 0),
        menusActivos: todayMenus.length,
        cafeteriasPendientes: pendientes.length
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprobarCafeteria = async (cafeteriaId) => {
    if (!confirm("¿Aprobar esta cafetería?")) return;
    try {
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: true,
        estado_onboarding: 'aprobada',
        activa: true,
        fecha_aprobacion: new Date().toISOString()
      });
      alert('✅ Cafetería aprobada');
      loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRechazarCafeteria = async (cafeteriaId) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    try {
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: false,
        estado_onboarding: 'rechazada',
        activa: false,
        notas_admin: motivo
      });
      alert('Cafetería rechazada');
      loadData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Sistema PlatPal</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Alert Cafeterías Pendientes */}
        {stats.cafeteriasPendientes > 0 && (
          <Card className="border-4 border-orange-400 bg-orange-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
                <div>
                  <h2 className="text-xl font-bold text-orange-900">
                    {stats.cafeteriasPendientes} cafetería{stats.cafeteriasPendientes > 1 ? 's' : ''} pendiente{stats.cafeteriasPendientes > 1 ? 's' : ''}
                  </h2>
                  <p className="text-orange-800">Requiere{stats.cafeteriasPendientes > 1 ? 'n' : ''} aprobación</p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('cafeterias')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Ver Ahora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Usuarios</p>
              <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <UtensilsCrossed className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cafeterías</p>
              <p className="text-3xl font-bold">{stats.totalCafeterias}</p>
            </CardContent>
          </Card>

          <Card className={stats.cafeteriasPendientes > 0 ? 'border-2 border-orange-400' : ''}>
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{stats.cafeteriasPendientes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Reservas Hoy</p>
              <p className="text-3xl font-bold">{stats.reservasHoy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-bold">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Activos</p>
              <p className="text-3xl font-bold">{stats.menusActivos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="cafeterias">
              <Building2 className="w-4 h-4 mr-2" />
              Cafeterías {stats.cafeteriasPendientes > 0 && (
                <Badge className="ml-2 bg-orange-600 text-white">{stats.cafeteriasPendientes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="referidos">
              <Gift className="w-4 h-4 mr-2" />
              Referidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalUsuarios}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {users.filter(u => u.app_role === 'user').length} estudiantes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cafeterías Activas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalCafeterias}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {cafeterias.filter(c => c.aprobada).length} aprobadas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cafeterias" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cafeterías Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cafeterias.filter(c => c.estado_onboarding === 'en_revision' && !c.aprobada).map(cafe => (
                    <Card key={cafe.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{cafe.nombre}</h3>
                            <p className="text-gray-600">{cafe.campus} • {cafe.ubicacion_exacta}</p>
                            {cafe.descripcion && (
                              <p className="text-sm text-gray-500 mt-2">{cafe.descripcion}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAprobarCafeteria(cafe.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleRechazarCafeteria(cafe.id)}
                              variant="outline"
                              className="border-red-300 text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {cafeterias.filter(c => c.estado_onboarding === 'en_revision' && !c.aprobada).length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">No hay cafeterías pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referidos" className="mt-6">
            <ReferralDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, ['admin']);