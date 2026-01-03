import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import withAuth from "../components/auth/withAuth";
import { UserCheck, TrendingUp, Euro, Package, BarChart3, RefreshCw } from "lucide-react";

function ManagerDashboard({ user }) {
  const [stats, setStats] = useState({
    totalReservasHoy: 0,
    ingresosHoy: 0,
    menusPublicados: 0,
    tasaOcupacion: 0
  });
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const managedCafeterias = Array.isArray(user.cafeterias_gestionadas) ? user.cafeterias_gestionadas : [];
      if (managedCafeterias.length === 0) {
        setIsLoading(false);
        return;
      }

      const [allReservations, allMenus] = await Promise.all([
        base44.entities.Reserva.list('-created_date'),
        base44.entities.Menu.list('-created_date')
      ]);

      const managedReservations = allReservations.filter(r => managedCafeterias.includes(r.cafeteria));
      const managedMenus = allMenus.filter(m => managedCafeterias.includes(m.cafeteria));

      setReservations(managedReservations.slice(0, 10));

      const today = new Date().toISOString().split('T')[0];
      const todayReservations = managedReservations.filter(r => 
        r.created_date?.startsWith(today) && r.payment_status === 'completed'
      );
      const todayMenus = managedMenus.filter(m => m.fecha === today);
      
      const totalStock = todayMenus.reduce((acc, m) => acc + m.stock_total, 0);
      const stockVendido = todayMenus.reduce((acc, m) => acc + (m.stock_total - m.stock_disponible), 0);
      const tasaOcupacion = totalStock > 0 ? (stockVendido / totalStock) * 100 : 0;

      setStats({
        totalReservasHoy: todayReservations.length,
        ingresosHoy: todayReservations.reduce((acc, r) => acc + (r.precio_total || 0), 0),
        menusPublicados: todayMenus.length,
        tasaOcupacion: tasaOcupacion.toFixed(1)
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user.cafeterias_gestionadas || user.cafeterias_gestionadas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-6 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-600">Sin Cafeterías Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Contacta con un administrador para que te asigne cafeterías.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
              <p className="text-gray-600">{user.cafeterias_gestionadas.length} cafetería{user.cafeterias_gestionadas.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Reservas Hoy</p>
              <p className="text-3xl font-bold">{stats.totalReservasHoy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-emerald-600">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-10 h-10 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Publicados</p>
              <p className="text-3xl font-bold">{stats.menusPublicados}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ocupación</p>
              <p className="text-3xl font-bold">{stats.tasaOcupacion}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">{r.user_name}</p>
                      <p className="text-sm text-gray-600">{r.cafeteria}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={r.estado === 'recogido' ? 'default' : 'outline'}>
                        {r.estado}
                      </Badge>
                      <p className="text-lg font-bold text-emerald-600 mt-1">€{r.precio_total?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay reservas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ManagerDashboard, ['manager', 'admin']);