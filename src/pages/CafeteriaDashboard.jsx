import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ChefHat, Package, TrendingUp, Euro, QrCode, Building2 } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { DropdownMenuCustom } from "@/components/ui/dropdown-menu-custom";
import SurpriseRequestsPanel from "@/components/cafeteria/SurpriseRequestsPanel";

export default function CafeteriaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    totalMenusHoy: 0,
    menusVendidos: 0,
    ingresosHoy: 0,
    pedidosPendientes: 0
  });
  const [availableCafeterias, setAvailableCafeterias] = useState([]);
  const [selectedCafeteriaId, setSelectedCafeteriaId] = useState(null);
  const [selectedCafeteriaData, setSelectedCafeteriaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allCafeterias = await base44.entities.Cafeteria.list();
        let userCafeterias = [];

        if (currentUser?.app_role === 'admin') {
          userCafeterias = allCafeterias.filter(c => c.activa);
        } else if (currentUser?.cafeterias_asignadas?.length > 0) {
          userCafeterias = allCafeterias.filter(c =>
            currentUser.cafeterias_asignadas.includes(c.id) && c.activa
          );
        }

        setAvailableCafeterias(userCafeterias);

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          setSelectedCafeteriaId(firstCafe.id);
          setSelectedCafeteriaData(firstCafe);
        }
      } catch (error) {
        console.error("Error cargando usuario:", error);
        navigate(createPageUrl("Home"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const loadData = useCallback(async () => {
    if (!selectedCafeteriaData) return;

    try {
      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      const [allMenus, allReservations] = await Promise.all([
        base44.entities.Menu.list('-created_date', 50),
        base44.entities.Reserva.list('-created_date', 100)
      ]);

      console.log('📋 Total menús cargados:', allMenus.length);
      console.log('🏪 Filtrando por cafetería:', cafeteriaName);
      console.log('📅 Fecha hoy:', today);

      const todayMenus = allMenus.filter(m => {
        const matchCafe = m.cafeteria === cafeteriaName;
        const matchDate = m.fecha === today;
        if (matchCafe) {
          console.log('  ✅ Menú encontrado:', m.plato_principal, '| Fecha:', m.fecha, '| Hoy:', matchDate);
        }
        return matchCafe && matchDate;
      });

      console.log('🍽️ Menús de hoy para esta cafetería:', todayMenus.length);
      setMenus(todayMenus);

      const cafeteriaReservations = allReservations.filter(r => r.cafeteria === cafeteriaName);
      setReservations(cafeteriaReservations);

      const totalMenusHoy = todayMenus.reduce((sum, m) => sum + m.stock_total, 0);
      const menusVendidos = cafeteriaReservations.filter(r =>
        r.payment_status === 'completed' && r.created_date?.startsWith(today)
      ).length;
      const ingresosHoy = cafeteriaReservations
        .filter(r => r.payment_status === 'completed' && r.created_date?.startsWith(today))
        .reduce((sum, r) => sum + (r.precio_total || 0), 0);
      const pedidosPendientes = cafeteriaReservations.filter(r =>
        r.estado === 'pagado' && r.created_date?.startsWith(today)
      ).length;

      setStats({ totalMenusHoy, menusVendidos, ingresosHoy, pedidosPendientes });
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [selectedCafeteriaData]);

  useEffect(() => {
    if (selectedCafeteriaData) loadData();
  }, [loadData, selectedCafeteriaData]);

  const handleCafeteriaChange = (id) => {
    const cafe = availableCafeterias.find(c => c.id === id);
    if (cafe) {
      setSelectedCafeteriaId(id);
      setSelectedCafeteriaData(cafe);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <OrbitalLoader message="Cargando panel..." />
      </div>
    );
  }

  if (availableCafeterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">¡Bienvenido a PlatPal!</CardTitle>
            <p className="text-gray-600 mt-2">No tienes cafeterías asignadas</p>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-700 mb-4">Contacta con el equipo de PlatPal para registrar tu cafetería.</p>
            <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCafeteriaData?.nombre || 'Panel Cafetería'}
            </h1>
            <p className="text-gray-600">Gestiona menús y pedidos</p>

            {availableCafeterias.length > 1 && (
              <div className="mt-4">
                <DropdownMenuCustom
                  options={availableCafeterias.map(cafe => ({
                    value: cafe.id,
                    label: cafe.nombre,
                    onClick: () => handleCafeteriaChange(cafe.id),
                    Icon: <Building2 className="w-5 h-5 text-emerald-600" />,
                    content: (
                      <div>
                        <p className="font-semibold">{cafe.nombre}</p>
                        <p className="text-xs text-gray-500">Campus {cafe.campus}</p>
                      </div>
                    )
                  }))}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">{selectedCafeteriaData?.nombre}</p>
                      <p className="text-xs text-gray-500">Campus {selectedCafeteriaData?.campus}</p>
                    </div>
                  </div>
                </DropdownMenuCustom>
              </div>
            )}
          </div>
          
          <Link to={createPageUrl("PublishMenu")} state={{ selectedCafeteria: selectedCafeteriaData }}>
            <Button className="bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Publicar Menú
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Hoy</p>
              <p className="text-3xl font-bold">{stats.totalMenusHoy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Vendidos</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.menusVendidos}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-amber-600">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <QrCode className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pedidosPendientes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link to={createPageUrl("PickupPanel")}>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Panel Recogida
            </Button>
          </Link>
        </div>

        {/* Solicitudes de Menú Sorpresa */}
        <SurpriseRequestsPanel cafeteriaName={selectedCafeteriaData?.nombre} />

        {/* Pedidos Pendientes */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              Pendientes de Recogida
              {stats.pedidosPendientes > 0 && (
                <Badge className="bg-orange-500">{stats.pedidosPendientes}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0])).length > 0 ? (
              <div className="space-y-3">
                {reservations
                  .filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0]))
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border-2 border-orange-100">
                      <div>
                        <div className="font-mono font-bold text-xl text-orange-700 mb-1">{r.codigo_recogida}</div>
                        <p className="font-semibold text-gray-900">{r.student_name || r.student_email}</p>
                        <p className="text-sm text-gray-600">{r.menus_detalle}</p>
                        {r.pagado_con_bono && <Badge className="mt-1 bg-purple-100 text-purple-800">Bono</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {r.pagado_con_bono ? 'Gratis' : `€${r.precio_total?.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay pedidos pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menús de Hoy */}
        <Card>
          <CardHeader>
            <CardTitle>Menús de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length > 0 ? (
              <div className="space-y-3">
                {menus.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{menu.plato_principal}</h3>
                      <p className="text-sm text-gray-600">+ {menu.plato_secundario}</p>
                      <Badge variant="outline" className="mt-2">
                        Stock: {menu.stock_disponible}/{menu.stock_total}
                      </Badge>
                    </div>
                    <Link to={createPageUrl("EditMenu")} state={{ menu }}>
                      <Button size="sm">Editar</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay menús publicados hoy</p>
                <Link to={createPageUrl("PublishMenu")}>
                  <Button className="mt-4 bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Menú
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}