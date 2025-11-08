import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import withAuth from "../components/auth/withAuth";
import { 
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  Mail,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

function AdminCafeteriaApproval() {
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: 'pendiente',
    campus: 'all',
    search: ''
  });

  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    total: 0
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Cargando cafeterías...');
      
      const allCafeterias = await base44.entities.Cafeteria.list('-created_date');
      console.log('📊 Total cafeterías:', allCafeterias.length);
      
      setCafeterias(allCafeterias);

      const pendientes = allCafeterias.filter(c => 
        c.estado_onboarding === 'en_revision' && c.aprobada === false
      );
      const aprobadas = allCafeterias.filter(c => c.aprobada === true);
      const rechazadas = allCafeterias.filter(c => c.estado_onboarding === 'rechazada');

      console.log('⏳ Pendientes:', pendientes.length);
      console.log('✅ Aprobadas:', aprobadas.length);
      console.log('❌ Rechazadas:', rechazadas.length);

      setStats({
        pendientes: pendientes.length,
        aprobadas: aprobadas.length,
        rechazadas: rechazadas.length,
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

  const handleAprobar = async (cafeteriaId, cafeteriaName) => {
    if (!confirm(`¿Aprobar "${cafeteriaName}" para que aparezca en la plataforma?`)) return;
    
    try {
      console.log('✅ Aprobando cafetería:', cafeteriaId);
      
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: true,
        estado_onboarding: 'aprobada',
        activa: true,
        fecha_aprobacion: new Date().toISOString()
      });
      
      alert('✅ Cafetería aprobada correctamente');
      loadData();
    } catch (error) {
      console.error("❌ Error aprobando:", error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleRechazar = async (cafeteriaId, cafeteriaName) => {
    const motivo = prompt(`Motivo del rechazo para "${cafeteriaName}":\n(Será visible para el propietario)`);
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
      console.error("❌ Error rechazando:", error);
      alert('❌ Error: ' + error.message);
    }
  };

  const filteredCafeterias = cafeterias.filter(c => {
    const estadoMatch = filters.estado === 'all' || 
      (filters.estado === 'pendiente' && c.estado_onboarding === 'en_revision' && !c.aprobada) ||
      (filters.estado === 'aprobada' && c.aprobada === true) ||
      (filters.estado === 'rechazada' && c.estado_onboarding === 'rechazada');
    
    const campusMatch = filters.campus === 'all' || c.campus === filters.campus;
    
    const searchMatch = !filters.search ||
      c.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.contacto?.toLowerCase().includes(filters.search.toLowerCase());
    
    return estadoMatch && campusMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Cargando cafeterías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Aprobación de Cafeterías</h1>
              <p className="text-gray-600 mt-1">Gestiona solicitudes de nuevos establecimientos</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>

        {/* ALERT SI HAY PENDIENTES */}
        {stats.pendientes > 0 && (
          <Card className="border-4 border-orange-400 bg-gradient-to-r from-orange-100 to-amber-100 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-orange-900 mb-2">
                    🚨 {stats.pendientes} {stats.pendientes === 1 ? 'CAFETERÍA' : 'CAFETERÍAS'} ESPERANDO APROBACIÓN
                  </h2>
                  <p className="text-lg text-orange-800">
                    Revisa las solicitudes y aprueba o rechaza según corresponda
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STATS GRID */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-5xl font-black text-orange-600">{stats.pendientes}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
              <p className="text-5xl font-black text-green-600">{stats.aprobadas}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Rechazadas</p>
              <p className="text-5xl font-black text-red-600">{stats.rechazadas}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-5xl font-black text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* FILTROS */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre o contacto..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9 bg-white border-2"
                />
              </div>

              <Select value={filters.estado} onValueChange={(v) => setFilters(prev => ({ ...prev, estado: v }))}>
                <SelectTrigger className="bg-white border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔍 Todos los estados</SelectItem>
                  <SelectItem value="pendiente">⏳ Pendientes ({stats.pendientes})</SelectItem>
                  <SelectItem value="aprobada">✅ Aprobadas ({stats.aprobadas})</SelectItem>
                  <SelectItem value="rechazada">❌ Rechazadas ({stats.rechazadas})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.campus} onValueChange={(v) => setFilters(prev => ({ ...prev, campus: v }))}>
                <SelectTrigger className="bg-white border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📍 Todos los campus</SelectItem>
                  <SelectItem value="jerez">Jerez</SelectItem>
                  <SelectItem value="puerto_real">Puerto Real</SelectItem>
                  <SelectItem value="cadiz">Cádiz</SelectItem>
                  <SelectItem value="algeciras">Algeciras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE CAFETERÍAS */}
        <div className="space-y-4">
          {filteredCafeterias.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay cafeterías</h3>
                <p className="text-gray-600">
                  {filters.estado === 'pendiente' ? 
                    'No hay solicitudes pendientes de aprobación' : 
                    'No se encontraron cafeterías con estos filtros'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCafeterias.map(cafe => (
              <Card key={cafe.id} className="hover:shadow-2xl transition-all duration-300 border-2">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    
                    {/* CONTENIDO */}
                    <div className="flex-1 space-y-5">
                      
                      {/* Título y Badge */}
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-gray-900">{cafe.nombre}</h3>
                        {cafe.aprobada ? (
                          <Badge className="bg-green-500 text-white px-4 py-2 text-base">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            APROBADA
                          </Badge>
                        ) : cafe.estado_onboarding === 'en_revision' ? (
                          <Badge className="bg-orange-500 text-white px-4 py-2 text-base animate-pulse">
                            <Clock className="w-5 h-5 mr-2" />
                            PENDIENTE
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white px-4 py-2 text-base">
                            <XCircle className="w-5 h-5 mr-2" />
                            RECHAZADA
                          </Badge>
                        )}
                      </div>

                      {/* Información */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Campus</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{cafe.campus.replace('_', ' ')}</p>
                          </div>
                        </div>

                        {cafe.contacto && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Contacto</p>
                              <p className="text-sm font-bold text-gray-900">{cafe.contacto}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Fecha Solicitud</p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(cafe.fecha_solicitud).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {cafe.fecha_aprobacion && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-green-600 font-medium">Fecha Aprobación</p>
                              <p className="text-sm font-bold text-green-900">
                                {new Date(cafe.fecha_aprobacion).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ubicación */}
                      {cafe.ubicacion_exacta && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">
                            📍 Ubicación: {cafe.ubicacion_exacta}
                          </p>
                        </div>
                      )}

                      {/* Descripción */}
                      {cafe.descripcion && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-700 italic">"{cafe.descripcion}"</p>
                        </div>
                      )}

                      {/* Motivo Rechazo */}
                      {cafe.estado_onboarding === 'rechazada' && cafe.notas_admin && (
                        <div className="bg-red-100 border-3 border-red-400 rounded-xl p-4">
                          <p className="font-bold text-red-900 mb-2 text-lg">❌ Motivo del rechazo:</p>
                          <p className="text-red-800 font-medium">{cafe.notas_admin}</p>
                        </div>
                      )}
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    {cafe.estado_onboarding === 'en_revision' && !cafe.aprobada && (
                      <div className="flex flex-col gap-4">
                        <Button
                          onClick={() => handleAprobar(cafe.id, cafe.nombre)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-8 text-lg font-black shadow-xl hover:shadow-2xl"
                        >
                          <CheckCircle className="w-6 h-6 mr-3" />
                          APROBAR
                        </Button>
                        <Button
                          onClick={() => handleRechazar(cafe.id, cafe.nombre)}
                          variant="outline"
                          className="border-3 border-red-400 text-red-700 hover:bg-red-50 px-8 py-8 text-lg font-black"
                        >
                          <XCircle className="w-6 h-6 mr-3" />
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

        {/* FOOTER CON CONTADOR */}
        {filteredCafeterias.length > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">
                Mostrando <strong>{filteredCafeterias.length}</strong> de <strong>{cafeterias.length}</strong> cafeterías
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withAuth(AdminCafeteriaApproval, ['admin']);