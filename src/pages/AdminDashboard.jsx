import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import withAuth from "../components/auth/withAuth";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Download,
  Search,
  RefreshCw,
  BarChart3,
  Euro,
  UtensilsCrossed,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Calendar
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalCafeterias: 0,
    reservasHoy: 0,
    ingresosHoy: 0,
    menusActivos: 0,
    cafeteriasPendientes: 0,
    cafeteriasAprobadas: 0,
    cafeteriasRechazadas: 0
  });
  
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    search: '',
    campus: 'all'
  });

  const [cafeteriaFilters, setCafeteriaFilters] = useState({
    estado: 'all',
    campus: 'all',
    search: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Cargando datos del admin dashboard...');
      
      const [allUsers, allMenus, allReservations, allCafeterias] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Menu.list('-created_date'),
        base44.entities.Reserva.list('-created_date'),
        base44.entities.Cafeteria.list('-created_date')
      ]);

      setUsers(allUsers);
      setReservations(allReservations);
      setCafeterias(allCafeterias);

      console.log('📊 Total cafeterías cargadas:', allCafeterias.length);
      
      const pendientes = allCafeterias.filter(c => 
        c.estado_onboarding === 'en_revision' && c.aprobada === false
      );
      
      console.log('⏳ Cafeterías pendientes:', pendientes.length, pendientes);

      const today = new Date().toISOString().split('T')[0];
      const todayReservations = allReservations.filter(r => 
        r.created_date?.startsWith(today) && r.payment_status === 'completed'
      );
      const todayMenus = allMenus.filter(m => m.fecha === today && m.stock_disponible > 0);

      setStats({
        totalUsuarios: allUsers.length,
        totalCafeterias: allUsers.filter(u => u.app_role === 'cafeteria').length,
        reservasHoy: todayReservations.length,
        ingresosHoy: todayReservations.reduce((sum, r) => sum + (r.precio_total || 0), 0),
        menusActivos: todayMenus.length,
        cafeteriasPendientes: pendientes.length,
        cafeteriasAprobadas: allCafeterias.filter(c => c.aprobada === true).length,
        cafeteriasRechazadas: allCafeterias.filter(c => c.estado_onboarding === 'rechazada').length
      });

      console.log('✅ Stats calculadas:', {
        pendientes: pendientes.length,
        aprobadas: allCafeterias.filter(c => c.aprobada === true).length,
        total: allCafeterias.length
      });

    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAprobarCafeteria = async (cafeteriaId) => {
    if (!confirm("¿Aprobar esta cafetería para que aparezca en la plataforma?")) return;
    
    try {
      console.log('✅ Aprobando cafetería:', cafeteriaId);
      
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: true,
        estado_onboarding: 'aprobada',
        activa: true,
        fecha_aprobacion: new Date().toISOString()
      });
      
      alert('✅ Cafetería aprobada correctamente. Ahora será visible en la plataforma.');
      loadData();
    } catch (error) {
      console.error("❌ Error aprobando cafetería:", error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleRechazarCafeteria = async (cafeteriaId) => {
    const motivo = prompt("Motivo del rechazo (será visible para el propietario):");
    if (motivo === null) return;
    
    try {
      console.log('❌ Rechazando cafetería:', cafeteriaId);
      
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: false,
        estado_onboarding: 'rechazada',
        activa: false,
        notas_admin: motivo || 'Rechazada sin motivo especificado'
      });
      
      alert('Cafetería rechazada');
      loadData();
    } catch (error) {
      console.error("❌ Error rechazando cafetería:", error);
      alert('❌ Error: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const roleMatch = userFilters.role === 'all' || u.app_role === userFilters.role;
    const searchMatch = !userFilters.search ||
      u.full_name?.toLowerCase().includes(userFilters.search.toLowerCase()) ||
      u.email?.toLowerCase().includes(userFilters.search.toLowerCase());
    const campusMatch = userFilters.campus === 'all' || u.campus === userFilters.campus;
    return roleMatch && searchMatch && campusMatch;
  });

  const filteredCafeterias = cafeterias.filter(c => {
    const estadoMatch = cafeteriaFilters.estado === 'all' || 
      (cafeteriaFilters.estado === 'pendiente' && c.estado_onboarding === 'en_revision' && !c.aprobada) ||
      (cafeteriaFilters.estado === 'aprobada' && c.aprobada === true) ||
      (cafeteriaFilters.estado === 'rechazada' && c.estado_onboarding === 'rechazada');
    
    const campusMatch = cafeteriaFilters.campus === 'all' || c.campus === cafeteriaFilters.campus;
    
    const searchMatch = !cafeteriaFilters.search ||
      c.nombre?.toLowerCase().includes(cafeteriaFilters.search.toLowerCase());
    
    return estadoMatch && campusMatch && searchMatch;
  });

  const exportUsersCSV = () => {
    const headers = ['Nombre', 'Email', 'Rol', 'Campus', 'Fecha Registro'];
    const rows = filteredUsers.map(u => [
      u.full_name || '',
      u.email || '',
      u.app_role || 'user',
      u.campus || '',
      new Date(u.created_date).toLocaleDateString('es-ES')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Sistema PlatPal</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>

        {/* ALERT PRINCIPAL - CAFETERÍAS PENDIENTES */}
        {stats.cafeteriasPendientes > 0 && (
          <Card className="border-4 border-orange-400 bg-gradient-to-r from-orange-100 to-amber-100 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-orange-900 mb-2">
                    🚨 {stats.cafeteriasPendientes} {stats.cafeteriasPendientes === 1 ? 'CAFETERÍA' : 'CAFETERÍAS'} ESPERANDO APROBACIÓN
                  </h2>
                  <p className="text-orange-800 font-medium">Revisa las solicitudes en la pestaña de Cafeterías</p>
                </div>
                <Button 
                  onClick={() => setActiveTab('cafeterias')}
                  className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6 shadow-lg"
                >
                  Ver Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Usuarios</p>
              <p className="text-4xl font-black text-gray-900">{stats.totalUsuarios}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <UtensilsCrossed className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Cafeterías</p>
              <p className="text-4xl font-black text-orange-600">{stats.totalCafeterias}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-xl transition-all hover:-translate-y-2 ${stats.cafeteriasPendientes > 0 ? 'border-4 border-orange-400 animate-pulse' : ''}`}>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-4xl font-black text-orange-600">{stats.cafeteriasPendientes}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Reservas Hoy</p>
              <p className="text-4xl font-black text-emerald-600">{stats.reservasHoy}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Euro className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Ingresos Hoy</p>
              <p className="text-4xl font-black text-purple-600">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Menús Activos</p>
              <p className="text-4xl font-black text-amber-600">{stats.menusActivos}</p>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white shadow-lg rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="cafeterias" className="rounded-xl data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 font-semibold">
              <Building2 className="w-4 h-4 mr-2" />
              Cafeterías
              {stats.cafeteriasPendientes > 0 && (
                <Badge className="ml-2 bg-orange-600 text-white animate-pulse">{stats.cafeteriasPendientes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 font-semibold">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RESUMEN */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📊 Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-2 font-semibold">Cafeterías Aprobadas</p>
                    <p className="text-5xl font-black text-green-600">{stats.cafeteriasAprobadas}</p>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border-2 border-orange-200">
                    <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-2 font-semibold">En Revisión</p>
                    <p className="text-5xl font-black text-orange-600">{stats.cafeteriasPendientes}</p>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl border-2 border-red-200">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-2 font-semibold">Rechazadas</p>
                    <p className="text-5xl font-black text-red-600">{stats.cafeteriasRechazadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservations.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{r.user_name || 'Usuario'}</p>
                          <p className="text-sm text-gray-600">{r.cafeteria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">€{r.precio_total?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.created_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CAFETERÍAS */}
          <TabsContent value="cafeterias" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-orange-600" />
                  Gestión de Cafeterías
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* FILTROS */}
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-2xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Buscar..."
                      value={cafeteriaFilters.search}
                      onChange={(e) => setCafeteriaFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9 bg-white"
                    />
                  </div>

                  <Select value={cafeteriaFilters.estado} onValueChange={(v) => setCafeteriaFilters(prev => ({ ...prev, estado: v }))}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">⏳ Pendientes</SelectItem>
                      <SelectItem value="aprobada">✅ Aprobadas</SelectItem>
                      <SelectItem value="rechazada">❌ Rechazadas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cafeteriaFilters.campus} onValueChange={(v) => setCafeteriaFilters(prev => ({ ...prev, campus: v }))}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los campus</SelectItem>
                      <SelectItem value="jerez">Jerez</SelectItem>
                      <SelectItem value="puerto_real">Puerto Real</SelectItem>
                      <SelectItem value="cadiz">Cádiz</SelectItem>
                      <SelectItem value="algeciras">Algeciras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LISTA DE CAFETERÍAS */}
                <div className="space-y-4">
                  {filteredCafeterias.length === 0 ? (
                    <div className="text-center py-16">
                      <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-600">No hay cafeterías</p>
                    </div>
                  ) : (
                    filteredCafeterias.map(cafe => (
                      <Card key={cafe.id} className="hover:shadow-2xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            
                            {/* CONTENIDO */}
                            <div className="flex-1 space-y-4">
                              {/* Título y badge */}
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-gray-900">{cafe.nombre}</h3>
                                {cafe.aprobada ? (
                                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    APROBADA
                                  </Badge>
                                ) : cafe.estado_onboarding === 'en_revision' ? (
                                  <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
                                    <Clock className="w-4 h-4 mr-1" />
                                    PENDIENTE
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    RECHAZADA
                                  </Badge>
                                )}
                              </div>

                              {/* Info */}
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span><strong>Campus:</strong> {cafe.campus}</span>
                                </div>
                                {cafe.contacto && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span><strong>Tel:</strong> {cafe.contacto}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span><strong>Solicitado:</strong> {new Date(cafe.fecha_solicitud).toLocaleDateString('es-ES')}</span>
                                </div>
                                {cafe.fecha_aprobacion && (
                                  <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span><strong>Aprobado:</strong> {new Date(cafe.fecha_aprobacion).toLocaleDateString('es-ES')}</span>
                                  </div>
                                )}
                              </div>

                              {cafe.ubicacion_exacta && (
                                <p className="text-gray-600">📍 {cafe.ubicacion_exacta}</p>
                              )}

                              {cafe.descripcion && (
                                <p className="text-gray-700 italic">"{cafe.descripcion}"</p>
                              )}

                              {/* Motivo rechazo */}
                              {cafe.estado_onboarding === 'rechazada' && cafe.notas_admin && (
                                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4">
                                  <p className="font-bold text-red-900 mb-1">Motivo del rechazo:</p>
                                  <p className="text-red-800">{cafe.notas_admin}</p>
                                </div>
                              )}
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            {cafe.estado_onboarding === 'en_revision' && !cafe.aprobada && (
                              <div className="flex flex-col gap-3">
                                <Button
                                  onClick={() => handleAprobarCafeteria(cafe.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-6 text-base font-bold shadow-lg"
                                >
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  APROBAR
                                </Button>
                                <Button
                                  onClick={() => handleRechazarCafeteria(cafe.id)}
                                  variant="outline"
                                  className="border-2 border-red-300 text-red-700 hover:bg-red-50 px-6 py-6 text-base font-bold"
                                >
                                  <XCircle className="w-5 h-5 mr-2" />
                                  RECHAZAR
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Mostrando {filteredCafeterias.length} de {cafeterias.length} cafeterías
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: USUARIOS */}
          <TabsContent value="usuarios" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Gestión de Usuarios
                  </CardTitle>
                  <Button onClick={exportUsersCSV} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* FILTROS */}
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-2xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Buscar usuario..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9 bg-white"
                    />
                  </div>

                  <Select value={userFilters.role} onValueChange={(v) => setUserFilters(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="user">Estudiantes</SelectItem>
                      <SelectItem value="cafeteria">Cafeterías</SelectItem>
                      <SelectItem value="manager">Managers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={userFilters.campus} onValueChange={(v) => setUserFilters(prev => ({ ...prev, campus: v }))}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los campus</SelectItem>
                      <SelectItem value="jerez">Jerez</SelectItem>
                      <SelectItem value="puerto_real">Puerto Real</SelectItem>
                      <SelectItem value="cadiz">Cádiz</SelectItem>
                      <SelectItem value="algeciras">Algeciras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LISTA DE USUARIOS */}
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 hover:shadow-lg transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{u.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          u.app_role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.app_role === 'cafeteria' ? 'bg-orange-100 text-orange-800' :
                          u.app_role === 'manager' ? 'bg-teal-100 text-teal-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {u.app_role === 'user' ? 'Estudiante' :
                           u.app_role === 'cafeteria' ? 'Cafetería' :
                           u.app_role === 'manager' ? 'Manager' :
                           u.app_role === 'admin' ? 'Admin' : u.app_role}
                        </Badge>
                        {u.campus && (
                          <Badge variant="outline" className="capitalize">
                            {u.campus.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(u.created_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-16">
                    <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No se encontraron usuarios</p>
                  </div>
                )}

                <p className="text-center text-sm text-gray-600">
                  Mostrando {filteredUsers.length} de {users.length} usuarios
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, ['admin']);