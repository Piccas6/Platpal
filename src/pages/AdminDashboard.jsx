import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import withAuth from "../components/auth/withAuth";
import ReferralDashboard from "../components/admin/ReferralDashboard";
import { Link } from "react-router-dom";
import { 
  Shield, Users, TrendingUp, RefreshCw, BarChart3,
  Euro, UtensilsCrossed, Building2, CheckCircle, XCircle,
  Clock, AlertCircle, Gift, Brain, Rocket, ExternalLink, FileText
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-600">Sistema PlatPal</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Alert Cafeterías Pendientes */}
        {stats.cafeteriasPendientes > 0 && (
          <Card className="border-2 border-orange-400 bg-orange-50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-orange-600 flex-shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-orange-900">
                    {stats.cafeteriasPendientes} pendiente{stats.cafeteriasPendientes > 1 ? 's' : ''}
                  </h2>
                  <p className="text-xs text-orange-800">Requiere{stats.cafeteriasPendientes > 1 ? 'n' : ''} aprobación</p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('cafeterias')}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 flex-shrink-0"
              >
                Ver
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid — 3 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
          {[
            { icon: Users, color: "text-blue-600", label: "Usuarios", value: stats.totalUsuarios },
            { icon: UtensilsCrossed, color: "text-orange-600", label: "Cafeterías", value: stats.totalCafeterias },
            { icon: Clock, color: "text-orange-600", label: "Pendientes", value: stats.cafeteriasPendientes, highlight: stats.cafeteriasPendientes > 0 },
            { icon: BarChart3, color: "text-emerald-600", label: "Reservas", value: stats.reservasHoy },
            { icon: Euro, color: "text-purple-600", label: "Ingresos", value: `€${stats.ingresosHoy.toFixed(0)}` },
            { icon: TrendingUp, color: "text-amber-600", label: "Menús", value: stats.menusActivos },
          ].map(({ icon: Icon, color, label, value, highlight }) => (
            <Card key={label} className={highlight ? 'border-2 border-orange-400' : ''}>
              <CardContent className="p-3 md:p-6 text-center">
                <Icon className={`w-6 h-6 md:w-10 md:h-10 ${color} mx-auto mb-1`} />
                <p className="text-xs text-gray-600 truncate">{label}</p>
                <p className={`text-lg md:text-3xl font-bold ${highlight ? 'text-orange-600' : ''}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="flex flex-col md:flex-row items-center gap-1 py-2 text-xs md:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="cafeterias" className="flex flex-col md:flex-row items-center gap-1 py-2 text-xs md:text-sm">
              <Building2 className="w-4 h-4" />
              <span className="flex items-center gap-1">
                Cafeterías
                {stats.cafeteriasPendientes > 0 && (
                  <Badge className="bg-orange-600 text-white text-xs px-1 py-0">{stats.cafeteriasPendientes}</Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="referidos" className="flex flex-col md:flex-row items-center gap-1 py-2 text-xs md:text-sm">
              <Gift className="w-4 h-4" />
              <span>Referidos</span>
            </TabsTrigger>
            <TabsTrigger value="inversor" className="flex flex-col md:flex-row items-center gap-1 py-2 text-xs md:text-sm">
              <Rocket className="w-4 h-4" />
              <span>Demo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalUsuarios}</p>
                  <p className="text-sm text-gray-600 mt-1">{users.filter(u => u.app_role === 'user').length} estudiantes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cafeterías Activas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalCafeterias}</p>
                  <p className="text-sm text-gray-600 mt-1">{cafeterias.filter(c => c.aprobada).length} aprobadas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cafeterias" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cafeterías Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cafeterias.filter(c => c.estado_onboarding === 'en_revision' && !c.aprobada).map(cafe => (
                    <Card key={cafe.id}>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900">{cafe.nombre}</h3>
                        <p className="text-sm text-gray-600">{cafe.campus} • {cafe.ubicacion_exacta}</p>
                        {cafe.descripcion && (
                          <p className="text-xs text-gray-500 mt-1">{cafe.descripcion}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleAprobarCafeteria(cafe.id)}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleRechazarCafeteria(cafe.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {cafeterias.filter(c => c.estado_onboarding === 'en_revision' && !c.aprobada).length === 0 && (
                    <div className="text-center py-10">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No hay cafeterías pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referidos" className="mt-4">
            <ReferralDashboard />
          </TabsContent>

          <TabsContent value="inversor" className="mt-4">
            <div className="space-y-4">

              {/* Surplus AI */}
              <Card className="border border-gray-200 overflow-hidden">
                <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-semibold text-sm">Surplus AI</p>
                      <p className="text-slate-400 text-xs">Motor de predicción de excedentes</p>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-900 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full">En producción</span>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Cuando una cafetería acaba el servicio con comida sobrante, normalmente la tira. 
                    Este algoritmo detecta esa situación antes de que pase — cruza el ritmo de ventas del día 
                    con el historial de los últimos 90 días y activa automáticamente el "menú sorpresa" 
                    rebajado sin que el cocinero tenga que hacer nada.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                    <span>· 4 señales ponderadas</span>
                    <span>· Sin intervención manual</span>
                    <span>· Se ejecuta cada hora</span>
                  </div>
                  <Link to="/SurplusAI">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Ver demo en vivo
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Investor Form */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Formulario para inversores</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Página pública donde inversores pueden dejar su contacto. 
                        Llega directo a contacto@platpal.com con todos sus datos.
                      </p>
                    </div>
                  </div>
                  <Link to="/InvestorForm">
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      <ExternalLink className="w-4 h-4" />
                      Abrir formulario
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <p className="text-xs text-gray-400 px-1">
                URLs directas: <span className="font-mono">/SurplusAI</span> · <span className="font-mono">/InvestorForm</span>
              </p>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, ['admin']);