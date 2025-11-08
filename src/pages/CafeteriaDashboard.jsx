
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";
import {
  Plus,
  ChefHat,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Euro,
  Copy,
  Edit,
  Trash2,
  QrCode,
  Sparkles,
  Loader2,
  Check,
  Building2,
  MapPin,
  Phone,
  XCircle,
  RefreshCw,
  Lock // Added Lock icon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

function CafeteriaDashboard({ user }) {
  const navigate = useNavigate();
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

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishFormData, setPublishFormData] = useState({
    plato_principal: "",
    plato_secundario: "",
    precio_original: 8.50,
    stock_total: "",
    fecha: new Date().toISOString().split('T')[0],
    hora_limite_reserva: "16:00",
    hora_limite: "18:00",
    es_sorpresa: false
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Cargar cafeterías del usuario
  useEffect(() => {
    const loadCafeterias = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 [DASHBOARD] Cargando cafeterías del usuario...'); // Updated log message
        console.log('👤 Usuario:', user?.email);
        console.log('🏪 Cafeterías asignadas:', user?.cafeterias_asignadas);

        const allCafeterias = await base44.entities.Cafeteria.list('-created_date');
        console.log('📊 Total cafeterías en sistema:', allCafeterias.length);

        let userCafeterias = [];

        if (user?.cafeterias_asignadas && user.cafeterias_asignadas.length > 0) {
          userCafeterias = allCafeterias.filter(c =>
            user.cafeterias_asignadas.includes(c.id)
          );
          console.log('✅ Cafeterías encontradas:', userCafeterias.length);
          console.log('📋 Lista:', userCafeterias.map(c => ({
            id: c.id,
            nombre: c.nombre,
            id_temporal: c.cafeteria_id_temporal, // Added id_temporal
            aprobada: c.aprobada,
            puede_publicar: c.puede_publicar_menus, // Added puede_publicar
            estado: c.estado_onboarding
          })));
        } else if (user?.app_role === 'admin') {
          userCafeterias = allCafeterias.filter(c => c.activa);
          console.log('👑 Admin - Cafeterías activas:', userCafeterias.length);
        }

        setAvailableCafeterias(userCafeterias);

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          console.log('🎯 Seleccionando cafetería:', firstCafe.nombre);
          console.log('🆔 ID Temporal:', firstCafe.cafeteria_id_temporal); // Added ID Temporal log
          console.log('🔒 Puede publicar:', firstCafe.puede_publicar_menus); // Added Puede publicar log
          
          setSelectedCafeteriaId(firstCafe.id);
          setSelectedCafeteriaData(firstCafe);
          setPublishFormData(prev => ({
            ...prev,
            precio_original: firstCafe.precio_original_default || 8.50,
            hora_limite_reserva: firstCafe.hora_fin_reserva || "16:00",
            hora_limite: firstCafe.hora_fin_recogida || "18:00"
          }));
        } else {
          console.log('⚠️ Usuario sin cafeterías asignadas');
          setSelectedCafeteriaId(null);
          setSelectedCafeteriaData(null);
        }
      } catch (error) {
        console.error("❌ Error cargando cafeterías:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadCafeterias();
    }
  }, [user]);

  // Cargar datos de la cafetería seleccionada
  const loadData = useCallback(async () => {
    if (!selectedCafeteriaData) {
      console.log('⏭️ No hay cafetería seleccionada, skipping load');
      return;
    }

    try {
      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      console.log('📊 Cargando datos para:', cafeteriaName);

      const [allMenus, allReservations] = await Promise.all([
        base44.entities.Menu.list('-created_date', 50),
        base44.entities.Reserva.list('-created_date', 100)
      ]);

      // Filtrar menús de esta cafetería para hoy
      const todayMenus = allMenus.filter(m =>
        m.cafeteria === cafeteriaName && m.fecha === today
      );
      setMenus(todayMenus);
      console.log('🍽️ Menús de hoy:', todayMenus.length);

      // Filtrar reservas de esta cafetería
      const cafeteriaReservations = allReservations.filter(r =>
        r.cafeteria === cafeteriaName
      );
      setReservations(cafeteriaReservations);
      console.log('📋 Reservas totales:', cafeteriaReservations.length);

      // Calcular stats
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

      setStats({
        totalMenusHoy,
        menusVendidos,
        ingresosHoy,
        pedidosPendientes
      });

      console.log('✅ Stats actualizadas:', {
        totalMenusHoy,
        menusVendidos,
        ingresosHoy: `€${ingresosHoy.toFixed(2)}`,
        pedidosPendientes
      });

    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
  }, [selectedCafeteriaData]);

  useEffect(() => {
    if (selectedCafeteriaData) {
      loadData();
    }
  }, [loadData, selectedCafeteriaData]);

  const handleDuplicateMenu = (menu) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    navigate(createPageUrl("PublishMenu"), {
      state: {
        duplicateFrom: {
          ...menu,
          fecha: tomorrow.toISOString().split('T')[0],
          stock_disponible: menu.stock_total
        }
      }
    });
  };

  const handleDeleteMenu = async (menuId) => {
    if (!confirm("¿Eliminar este menú?")) return;
    try {
      console.log('🗑️ Eliminando menú:', menuId);
      await base44.entities.Menu.delete(menuId);
      console.log('✅ Menú eliminado');
      loadData();
    } catch (error) {
      console.error("❌ Error eliminando:", error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleQuickPublish = async (e) => {
    e.preventDefault();

    // Changed condition to check for `puede_publicar_menus`
    if (!selectedCafeteriaData?.puede_publicar_menus) {
      alert("⚠️ Tu cafetería debe estar aprobada para publicar menús.\n\nEstado actual: En Revisión");
      return;
    }

    if (!publishFormData.es_sorpresa && (!publishFormData.plato_principal || !publishFormData.plato_secundario)) {
      alert("⚠️ Completa los platos o activa 'Plato Sorpresa'");
      return;
    }

    if (!publishFormData.stock_total || parseInt(publishFormData.stock_total) <= 0) {
      alert("⚠️ Indica cuántos menús quieres publicar");
      return;
    }

    setIsPublishing(true);

    try {
      const menuData = {
        plato_principal: publishFormData.es_sorpresa ? "Plato Sorpresa" : publishFormData.plato_principal,
        plato_secundario: publishFormData.es_sorpresa ? "2º Plato Sorpresa" : publishFormData.plato_secundario,
        precio_original: parseFloat(publishFormData.precio_original),
        precio_descuento: 2.99,
        stock_total: parseInt(publishFormData.stock_total),
        stock_disponible: parseInt(publishFormData.stock_total),
        campus: selectedCafeteriaData.campus,
        cafeteria: selectedCafeteriaData.nombre,
        fecha: publishFormData.fecha,
        hora_limite_reserva: publishFormData.hora_limite_reserva,
        hora_limite: publishFormData.hora_limite,
        es_recurrente: false,
        es_sorpresa: publishFormData.es_sorpresa,
        permite_envase_propio: true,
        descuento_envase_propio: 0.15,
        tipo_cocina: '',
        es_vegetariano: false,
        es_vegano: false,
        sin_gluten: false,
        alergenos: ['ninguno']
      };

      console.log('📤 Publicando menú:', menuData);
      await base44.entities.Menu.create(menuData);
      console.log('✅ Menú publicado correctamente');

      // Reset form
      setPublishFormData({
        plato_principal: "",
        plato_secundario: "",
        precio_original: selectedCafeteriaData.precio_original_default || 8.50,
        stock_total: "",
        fecha: new Date().toISOString().split('T')[0],
        hora_limite_reserva: selectedCafeteriaData.hora_fin_reserva || "16:00",
        hora_limite: selectedCafeteriaData.hora_fin_recogida || "18:00",
        es_sorpresa: false
      });

      setShowPublishModal(false);
      loadData();
      alert('✅ Menú publicado correctamente');
    } catch (error) {
      console.error('❌ Error publicando:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCafeteriaChange = (id) => {
    const cafe = availableCafeterias.find(c => c.id === id);
    console.log('🔄 Cambiando a cafetería:', cafe?.nombre);
    console.log('🆔 ID Temporal:', cafe?.cafeteria_id_temporal); // Added ID Temporal log
    setSelectedCafeteriaId(id);
    setSelectedCafeteriaData(cafe);
    setPublishFormData(prev => ({
      ...prev,
      precio_original: cafe.precio_original_default || 8.50,
      hora_limite_reserva: cafe.hora_fin_reserva || "16:00",
      hora_limite: cafe.hora_fin_recogida || "18:00"
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Cargando panel...</p>
        </div>
      </div>
    );
  }

  // Sin cafeterías asignadas
  if (availableCafeterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">¡Bienvenido a PlatPal!</CardTitle>
            <p className="text-gray-600 mt-2">Registra tu primer establecimiento</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Registra tu cafetería</h3>
                  <p className="text-sm text-gray-600">Completa el formulario</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Espera la aprobación</h3>
                  <p className="text-sm text-gray-600">24-48 horas</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">¡Empieza a vender!</h3>
                  <p className="text-sm text-gray-600">Publica menús</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CafeteriaOnboarding"))}
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 py-6 text-lg font-bold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar mi cafetería
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Variable para controlar si puede publicar, based on the new field `puede_publicar_menus`
  const canPublish = selectedCafeteriaData?.puede_publicar_menus === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900">
              {selectedCafeteriaData?.nombre || 'Panel de Cafetería'}
            </h1>
            <p className="text-gray-600 mt-1">Gestiona tus menús y pedidos</p>

            {/* Selector de Cafetería + ID Temporal */}
            {availableCafeterias.length > 0 && (
              <div className="mt-4 space-y-2"> {/* Added space-y-2 for spacing */}
                {availableCafeterias.length > 1 ? (
                  <Select value={selectedCafeteriaId} onValueChange={handleCafeteriaChange}>
                    <SelectTrigger className="w-full md:w-96 bg-white border-2 border-emerald-200 hover:border-emerald-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCafeterias.map(cafe => (
                        <SelectItem key={cafe.id} value={cafe.id}>
                          <div className="flex items-center gap-3 py-1">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="font-semibold">{cafe.nombre}</p>
                              <p className="text-xs text-gray-500">Campus {cafe.campus}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">{availableCafeterias[0].nombre}</p>
                      <p className="text-sm text-emerald-700">Campus {availableCafeterias[0].campus}</p>
                    </div>
                  </div>
                )}
                
                {/* Display Temporary ID */}
                {selectedCafeteriaData?.cafeteria_id_temporal && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs">
                    <span className="font-mono text-gray-700">
                      🆔 ID Temporal: {selectedCafeteriaData.cafeteria_id_temporal}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("CafeteriaOnboarding"))}
              className="gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4" />
              Añadir Establecimiento
            </Button>
            <Button onClick={loadData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* ALERT - NO APROBADA */}
        {selectedCafeteriaData && !canPublish && ( // Changed condition to !canPublish
          <Card className="border-4 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-lg animate-pulse flex-shrink-0">
                  <Lock className="w-10 h-10 text-white" /> {/* Changed icon to Lock */}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-black text-orange-900 mb-2">
                      🔒 Panel Temporal - En Revisión {/* Updated title */}
                    </h2>
                    <p className="text-lg text-orange-800">
                      <strong>{selectedCafeteriaData.nombre}</strong> está siendo revisada
                    </p>
                    <p className="text-orange-700 mt-1">
                      Puedes explorar el panel pero NO podrás publicar menús hasta la aprobación {/* Updated description */}
                    </p>
                  </div>

                  <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-orange-200">
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-orange-900">
                        <MapPin className="w-4 h-4" />
                        <span>Campus {selectedCafeteriaData.campus}</span>
                      </div>
                      {selectedCafeteriaData.contacto && (
                        <div className="flex items-center gap-2 text-orange-900">
                          <Phone className="w-4 h-4" />
                          <span>{selectedCafeteriaData.contacto}</span>
                        </div>
                      )}
                      <div className="text-orange-900">
                        📅 {new Date(selectedCafeteriaData.fecha_solicitud).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-100 border border-amber-300 rounded-xl p-3">
                    <p className="text-sm text-amber-900">
                      💡 <strong>Te notificaremos por email</strong> (24-48h) {/* Updated text */}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BADGE ESTADO */}
        {selectedCafeteriaData && (
          <div className="flex items-center gap-3">
            {canPublish ? ( // Changed condition to canPublish
              <Badge className="bg-green-600 text-white px-4 py-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                ✅ Aprobada - Puedes publicar
              </Badge>
            ) : selectedCafeteriaData.estado_onboarding === 'rechazada' ? (
              <Badge className="bg-red-600 text-white px-4 py-2 shadow-md">
                <XCircle className="w-4 h-4 mr-2" />
                ❌ Rechazada
              </Badge>
            ) : (
              <Badge className="bg-orange-600 text-white px-4 py-2 shadow-md">
                <Lock className="w-4 h-4 mr-2" /> {/* Changed icon to Lock */}
                🔒 Panel Temporal - En Revisión {/* Updated text */}
              </Badge>
            )}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={`hover:shadow-lg transition-all ${!canPublish && 'opacity-60'}`}> {/* Added opacity based on canPublish */}
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Hoy</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalMenusHoy}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-all ${!canPublish && 'opacity-60'}`}> {/* Added opacity based on canPublish */}
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Vendidos</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{stats.menusVendidos}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-all ${!canPublish && 'opacity-60'}`}> {/* Added opacity based on canPublish */}
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-black text-amber-600 mt-1">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-all ${!canPublish && 'opacity-60'}`}> {/* Added opacity based on canPublish */}
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-black text-orange-600 mt-1">{stats.pedidosPendientes}</p>
            </CardContent>
          </Card>
        </div>

        {/* BOTONES */}
        <div className="flex flex-wrap gap-3">
          <Link to={createPageUrl("PickupPanel")}>
            <Button variant="outline" disabled={!canPublish}> {/* Disabled based on canPublish */}
              <QrCode className="w-4 h-4 mr-2" />
              Panel Recogida
            </Button>
          </Link>

          <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-amber-500 shadow-lg"
                disabled={!canPublish} // Disabled based on canPublish
              >
                {canPublish ? ( // Conditional button content
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Menú
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Bloqueado hasta aprobación
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>⚡ Publicar Menú Rápido</DialogTitle>
                <DialogDescription>Publica en segundos</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuickPublish} className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <Label className="font-semibold">Plato Sorpresa</Label>
                  <Switch
                    checked={publishFormData.es_sorpresa}
                    onCheckedChange={(checked) => setPublishFormData(prev => ({ ...prev, es_sorpresa: checked }))}
                  />
                </div>

                {!publishFormData.es_sorpresa && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Plato Principal *</Label>
                      <Input
                        value={publishFormData.plato_principal}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_principal: e.target.value }))}
                        placeholder="Ej: Pollo"
                        required
                      />
                    </div>
                    <div>
                      <Label>2º Plato *</Label>
                      <Input
                        value={publishFormData.plato_secundario}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_secundario: e.target.value }))}
                        placeholder="Ej: Patatas"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      value={publishFormData.stock_total}
                      onChange={(e) => setPublishFormData(prev => ({ ...prev, stock_total: e.target.value }))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Precio PlatPal</Label>
                    <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-lg border-2 border-emerald-200">
                      <span className="text-lg font-bold text-emerald-600">€2.99</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowPublishModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPublishing} className="flex-1 bg-emerald-600">
                    {isPublishing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Link to={createPageUrl("PublishMenu")}>
            <Button variant="outline" disabled={!canPublish}> {/* Disabled based on canPublish */}
              <Sparkles className="w-4 h-4 mr-2" />
              Formulario Completo
            </Button>
          </Link>
        </div>

        {/* MENÚS */}
        <Card>
          <CardHeader>
            <CardTitle>Menús de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length > 0 ? (
              <div className="space-y-3">
                {menus.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 hover:shadow-md transition-all">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{menu.plato_principal}</h3>
                      <p className="text-sm text-gray-600">+ {menu.plato_secundario}</p>
                      <Badge variant="outline" className="mt-2">
                        Stock: {menu.stock_disponible}/{menu.stock_total}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateMenu(menu)} disabled={!canPublish} title="Duplicar"> {/* Disabled based on canPublish */}
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link to={createPageUrl("EditMenu")} state={{ menu }}>
                        <Button size="sm" variant="outline" disabled={!canPublish} title="Editar"> {/* Disabled based on canPublish */}
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMenu(menu.id)} disabled={!canPublish} title="Eliminar"> {/* Disabled based on canPublish */}
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">No hay menús hoy</p>
                <p className="text-gray-600 mb-6">
                  {canPublish ? 'Empieza publicando tu primer menú' : 'Podrás publicar cuando tu cafetería sea aprobada'} {/* Conditional text */}
                </p>
                {canPublish && ( // Show button only if canPublish
                  <Button onClick={() => setShowPublishModal(true)} className="bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Menú
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CafeteriaDashboard, ['cafeteria', 'admin']);
