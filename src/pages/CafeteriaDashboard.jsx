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
  Star,
  Calendar,
  Loader2,
  Check,
  Building2,
  MapPin,
  Phone,
  XCircle
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
import { Textarea } from "@/components/ui/textarea";
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
  const [reviews, setReviews] = useState([]);
  const [dailyMenuInfo, setDailyMenuInfo] = useState(null);
  const [showDailyMenuForm, setShowDailyMenuForm] = useState(false);
  const [dailyMenuForm, setDailyMenuForm] = useState({
    titulo: 'Menú del día',
    contenido: '',
    imagen_url: ''
  });
  const [stats, setStats] = useState({
    totalMenusHoy: 0,
    menusVendidos: 0,
    ingresosHoy: 0,
    pedidosPendientes: 0,
    ratingPromedio: 0,
    totalReviews: 0
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

  // Cargar cafeterías disponibles
  useEffect(() => {
    const loadCafeterias = async () => {
      setIsLoading(true);
      try {
        console.log('👤 Usuario actual:', user);
        console.log('🏪 Cafeterías asignadas:', user?.cafeterias_asignadas);

        const allCafeterias = await base44.entities.Cafeteria.list();
        console.log('📊 Total cafeterías en DB:', allCafeterias.length);

        let userCafeterias = [];

        if (user?.cafeterias_asignadas && user.cafeterias_asignadas.length > 0) {
          // MOSTRAR TODAS las cafeterías asignadas (aprobadas o no)
          userCafeterias = allCafeterias.filter(c =>
            user.cafeterias_asignadas.includes(c.id)
          );
          console.log('✅ Cafeterías del usuario encontradas:', userCafeterias.length);
        } else if (user?.app_role === 'admin') {
          userCafeterias = allCafeterias.filter(c => c.activa);
          console.log('👑 Admin - Mostrando cafeterías activas:', userCafeterias.length);
        }

        setAvailableCafeterias(userCafeterias);

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          console.log('🎯 Cafetería seleccionada:', firstCafe);
          setSelectedCafeteriaId(firstCafe.id);
          setSelectedCafeteriaData(firstCafe);
        } else {
          console.log('⚠️ No hay cafeterías disponibles');
          setSelectedCafeteriaId(null);
          setSelectedCafeteriaData(null);
        }
      } catch (error) {
        console.error("❌ Error loading cafeterias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadCafeterias();
    }
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      if (!selectedCafeteriaData) {
        console.log('⚠️ No hay cafetería seleccionada');
        return;
      }

      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      console.log('📊 Cargando datos para:', cafeteriaName);

      const [allMenus, allReservations, allReviews, dailyMenus] = await Promise.all([
        base44.entities.Menu.list('-created_date'),
        base44.entities.Reserva.list('-created_date'),
        base44.entities.MenuReview.filter({ cafeteria: cafeteriaName }),
        base44.entities.DailyMenuInfo.filter({ cafeteria: cafeteriaName, fecha: today })
      ]);

      const todayMenus = allMenus.filter(m =>
        m.cafeteria === cafeteriaName && m.fecha === today
      );
      setMenus(todayMenus);

      const cafeteriaReservations = allReservations.filter(r =>
        r.cafeteria === cafeteriaName
      );
      setReservations(cafeteriaReservations);
      setReviews(allReviews);

      // Stats
      const totalMenusHoy = todayMenus.reduce((acc, m) => acc + m.stock_total, 0);
      const menusVendidos = cafeteriaReservations.filter(r => 
        r.payment_status === 'completed' && r.created_date?.startsWith(today)
      ).length;
      const ingresosHoy = cafeteriaReservations
        .filter(r => r.payment_status === 'completed' && r.created_date?.startsWith(today))
        .reduce((acc, r) => acc + (r.precio_total || 0), 0);
      const pedidosPendientes = cafeteriaReservations.filter(r =>
        r.estado === 'pagado' && r.created_date?.startsWith(today)
      ).length;
      const ratingPromedio = allReviews.length > 0
        ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
        : 0;

      setStats({
        totalMenusHoy,
        menusVendidos,
        ingresosHoy,
        pedidosPendientes,
        ratingPromedio: ratingPromedio.toFixed(1),
        totalReviews: allReviews.length
      });

      // Daily menu
      if (dailyMenus.length > 0) {
        setDailyMenuInfo(dailyMenus[0]);
        setDailyMenuForm({
          titulo: dailyMenus[0].titulo,
          contenido: dailyMenus[0].contenido,
          imagen_url: dailyMenus[0].imagen_url || ''
        });
      } else {
        setDailyMenuInfo(null);
      }

      console.log('✅ Datos cargados correctamente');
    } catch (error) {
      console.error("❌ Error loading data:", error);
    }
  }, [selectedCafeteriaData]);

  useEffect(() => {
    if (selectedCafeteriaData) {
      loadData();
    }
  }, [loadData, selectedCafeteriaData]);

  const handleDuplicateMenu = async (menu) => {
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
      await base44.entities.Menu.delete(menuId);
      loadData();
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleSaveDailyMenu = async () => {
    try {
      if (!selectedCafeteriaData?.nombre) {
        alert("Selecciona una cafetería");
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      if (dailyMenuInfo) {
        await base44.entities.DailyMenuInfo.update(dailyMenuInfo.id, dailyMenuForm);
      } else {
        await base44.entities.DailyMenuInfo.create({
          ...dailyMenuForm,
          cafeteria: selectedCafeteriaData.nombre,
          fecha: today
        });
      }
      setShowDailyMenuForm(false);
      loadData();
    } catch (error) {
      console.error("Error saving daily menu:", error);
      alert("Error: " + error.message);
    }
  };

  const handleQuickPublish = async (e) => {
    e.preventDefault();

    if (!selectedCafeteriaData?.aprobada) {
      alert("Tu cafetería debe estar aprobada para publicar menús");
      return;
    }

    if (!publishFormData.es_sorpresa && (!publishFormData.plato_principal || !publishFormData.plato_secundario)) {
      alert("Completa los platos o activa 'Plato Sorpresa'");
      return;
    }

    if (!publishFormData.stock_total || parseInt(publishFormData.stock_total) <= 0) {
      alert("Indica cuántos menús quieres publicar");
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

      await base44.entities.Menu.create(menuData);

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
      alert('✅ Menú publicado');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
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

  // Si no tiene cafeterías asignadas
  if (availableCafeterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">¡Bienvenido a PlatPal! 🎉</CardTitle>
            <p className="text-gray-600 mt-2">Registra tu primer establecimiento para empezar</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Registra tu cafetería</h3>
                  <p className="text-sm text-gray-600">Completa el formulario con los datos</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Espera la aprobación</h3>
                  <p className="text-sm text-gray-600">Nuestro equipo revisará en 24-48h</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">¡Empieza a vender!</h3>
                  <p className="text-sm text-gray-600">Publica menús y recibe pedidos</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CafeteriaOnboarding"))}
              className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar mi cafetería
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900">
              Panel de {selectedCafeteriaData?.nombre || 'Establecimientos'}
            </h1>
            <p className="text-gray-600 mt-1">Gestiona tus menús y pedidos</p>

            {/* Selector de Cafetería */}
            {availableCafeterias.length > 0 && (
              <div className="mt-4">
                {availableCafeterias.length > 1 ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      🏪 Selecciona tu establecimiento
                    </label>
                    <Select
                      value={selectedCafeteriaId}
                      onValueChange={(id) => {
                        const cafe = availableCafeterias.find(c => c.id === id);
                        setSelectedCafeteriaId(id);
                        setSelectedCafeteriaData(cafe);
                      }}
                    >
                      <SelectTrigger className="w-full md:w-96 bg-white border-2 border-emerald-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCafeterias.map(cafe => (
                          <SelectItem key={cafe.id} value={cafe.id}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-700 font-semibold text-sm">
                                  {cafe.nombre.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{cafe.nombre}</p>
                                <p className="text-xs text-gray-500">Campus {cafe.campus}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900">
                        {availableCafeterias[0].nombre}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Campus {availableCafeterias[0].campus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("CafeteriaOnboarding"))}
              className="gap-2 border-2 border-emerald-600 text-emerald-600"
            >
              <Plus className="w-4 h-4" />
              Añadir Establecimiento
            </Button>
            <Button onClick={loadData} variant="outline" className="gap-2">
              🔄 Actualizar
            </Button>
          </div>
        </div>

        {/* ALERT - CAFETERÍA NO APROBADA */}
        {selectedCafeteriaData && !selectedCafeteriaData.aprobada && (
          <Card className="border-4 border-orange-400 bg-gradient-to-r from-orange-100 to-amber-100 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-lg animate-pulse flex-shrink-0">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-black text-orange-900 mb-2">
                      ⏳ Tu cafetería está en revisión
                    </h2>
                    <p className="text-lg text-orange-800">
                      <strong>{selectedCafeteriaData.nombre}</strong> está siendo revisada por nuestro equipo.
                    </p>
                    <p className="text-orange-700 mt-2">
                      Te notificaremos por email cuando sea aprobada (normalmente 24-48 horas).
                    </p>
                  </div>

                  <div className="bg-white/50 backdrop-blur rounded-xl p-4 border-2 border-orange-200">
                    <p className="text-sm text-orange-900 mb-3">
                      <strong>📋 Detalles de tu solicitud:</strong>
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-orange-800">
                        <MapPin className="w-4 h-4" />
                        <span><strong>Campus:</strong> {selectedCafeteriaData.campus}</span>
                      </div>
                      {selectedCafeteriaData.contacto && (
                        <div className="flex items-center gap-2 text-orange-800">
                          <Phone className="w-4 h-4" />
                          <span><strong>Contacto:</strong> {selectedCafeteriaData.contacto}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-orange-800">
                        <Calendar className="w-4 h-4" />
                        <span><strong>Solicitado:</strong> {new Date(selectedCafeteriaData.fecha_solicitud).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4">
                    <p className="text-sm text-amber-900">
                      <strong>💡 Mientras tanto:</strong> Puedes explorar el panel y familiarizarte con las funciones,
                      pero no podrás publicar menús hasta que tu cafetería sea aprobada.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BADGE DE ESTADO */}
        {selectedCafeteriaData && (
          <div className="flex items-center gap-3">
            {selectedCafeteriaData.aprobada ? (
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Cafetería Aprobada - Puedes publicar menús
              </Badge>
            ) : selectedCafeteriaData.estado_onboarding === 'rechazada' ? (
              <Badge className="bg-red-500 text-white px-4 py-2 text-sm">
                <XCircle className="w-4 h-4 mr-2" />
                Rechazada - Contacta con soporte
              </Badge>
            ) : (
              <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                En Revisión - Funcionalidad limitada
              </Badge>
            )}
          </div>
        )}

        {/* STATS GRID */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card className={selectedCafeteriaData?.aprobada ? '' : 'opacity-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menús Hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMenusHoy}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={selectedCafeteriaData?.aprobada ? '' : 'opacity-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendidos</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.menusVendidos}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={selectedCafeteriaData?.aprobada ? '' : 'opacity-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Hoy</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">€{stats.ingresosHoy.toFixed(2)}</p>
                </div>
                <Euro className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={selectedCafeteriaData?.aprobada ? '' : 'opacity-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pedidosPendientes}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={selectedCafeteriaData?.aprobada ? '' : 'opacity-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.ratingPromedio}⭐</p>
                  <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
                </div>
                <Star className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-wrap gap-3">
          <Link to={createPageUrl("MenuTemplates")}>
            <Button variant="outline" disabled={!selectedCafeteriaData?.aprobada}>
              <Sparkles className="w-4 h-4 mr-2" />
              Plantillas
            </Button>
          </Link>
          <Link to={createPageUrl("PickupPanel")}>
            <Button variant="outline" disabled={!selectedCafeteriaData?.aprobada}>
              <QrCode className="w-4 h-4 mr-2" />
              Panel Recogida
            </Button>
          </Link>

          <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-amber-500"
                disabled={!selectedCafeteriaData?.aprobada}
              >
                <Plus className="w-4 h-4 mr-2" />
                Publicar Menú Rápido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>⚡ Publicación Rápida</DialogTitle>
                <DialogDescription>
                  Publica un menú en segundos
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuickPublish} className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <Label className="font-medium text-purple-900">Plato Sorpresa</Label>
                  </div>
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
                        placeholder="Ej: Pollo asado"
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
                    <div className="h-10 flex items-center justify-center bg-emerald-50 rounded-xl border-2 border-emerald-200">
                      <span className="text-lg font-bold text-emerald-600">€2.99</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowPublishModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPublishing} className="flex-1 bg-emerald-600">
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    Publicar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* MENÚS DE HOY */}
        <Card>
          <CardHeader>
            <CardTitle>Menús de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length > 0 ? (
              <div className="space-y-3">
                {menus.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{menu.plato_principal}</h3>
                      <p className="text-sm text-gray-600">+ {menu.plato_secundario}</p>
                      <Badge variant="outline" className="mt-2">
                        Stock: {menu.stock_disponible}/{menu.stock_total}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateMenu(menu)} disabled={!selectedCafeteriaData?.aprobada}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link to={createPageUrl("EditMenu")} state={{ menu }}>
                        <Button size="sm" variant="outline" disabled={!selectedCafeteriaData?.aprobada}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMenu(menu.id)} disabled={!selectedCafeteriaData?.aprobada}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay menús para hoy</p>
                {selectedCafeteriaData?.aprobada && (
                  <Button onClick={() => setShowPublishModal(true)}>
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