import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  ChefHat,
  Package,
  TrendingUp,
  Euro,
  Copy,
  Edit,
  Trash2,
  QrCode,
  Building2,
  Sparkles,
  X
} from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenuCustom } from "@/components/ui/dropdown-menu-custom";
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
  const [isGeneratingImage1, setIsGeneratingImage1] = useState(false);
  const [isGeneratingImage2, setIsGeneratingImage2] = useState(false);
  const [generatedImageUrl1, setGeneratedImageUrl1] = useState('');
  const [generatedImageUrl2, setGeneratedImageUrl2] = useState('');
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false);

  // Cargar usuario y cafeterías
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
        } else if (currentUser?.cafeterias_asignadas && currentUser.cafeterias_asignadas.length > 0) {
          userCafeterias = allCafeterias.filter(c =>
            currentUser.cafeterias_asignadas.includes(c.id) && c.activa
          );
        }

        setAvailableCafeterias(userCafeterias);

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          setSelectedCafeteriaId(firstCafe.id);
          setSelectedCafeteriaData(firstCafe);
          setPublishFormData(prev => ({
            ...prev,
            precio_original: firstCafe.precio_original_default || 8.50,
            hora_limite_reserva: firstCafe.hora_fin_reserva || "16:00",
            hora_limite: firstCafe.hora_fin_recogida || "18:00"
          }));
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

  // Cargar datos de la cafetería seleccionada
  const loadData = useCallback(async () => {
    if (!selectedCafeteriaData) return;

    try {
      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      const [allMenus, allReservations] = await Promise.all([
        base44.entities.Menu.list('-created_date', 50),
        base44.entities.Reserva.list('-created_date', 100)
      ]);

      const todayMenus = allMenus.filter(m =>
        m.cafeteria === cafeteriaName && m.fecha === today
      );
      setMenus(todayMenus);

      const cafeteriaReservations = allReservations.filter(r =>
        r.cafeteria === cafeteriaName
      );
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

      setStats({
        totalMenusHoy,
        menusVendidos,
        ingresosHoy,
        pedidosPendientes
      });

    } catch (error) {
      console.error("Error cargando datos:", error);
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
      await base44.entities.Menu.delete(menuId);
      loadData();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleGenerateImage = async (platoNum) => {
    const plato = platoNum === 1 ? publishFormData.plato_principal : publishFormData.plato_secundario;
    
    if (!plato && !publishFormData.es_sorpresa) return;

    const setIsGenerating = platoNum === 1 ? setIsGeneratingImage1 : setIsGeneratingImage2;
    const setImageUrl = platoNum === 1 ? setGeneratedImageUrl1 : setGeneratedImageUrl2;
    
    setIsGenerating(true);
    try {
      let prompt;
      if (publishFormData.es_sorpresa) {
        prompt = `Comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de menú del día universitario, plato equilibrado y nutritivo, estilo cafetería universitaria moderna, iluminación natural, fondo neutro profesional`;
      } else {
        prompt = `${plato} - comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de cafetería universitaria, plato equilibrado, iluminación natural, fondo neutro profesional, comida recién preparada`;
      }
      
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      
      if (result.url) {
        setImageUrl(result.url);
      }
    } catch (error) {
      console.error('Error al generar imagen:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generación desactivada para evitar problemas de renderizado
  // Las imágenes se generan solo manualmente

  const handleQuickPublish = async (e) => {
    e.preventDefault();

    if (!publishFormData.es_sorpresa && (!publishFormData.plato_principal || !publishFormData.plato_secundario)) {
      alert("⚠️ Completa los platos o activa 'Plato Sorpresa'");
      return;
    }

    if (!publishFormData.stock_total || parseInt(publishFormData.stock_total) <= 0) {
      alert("⚠️ Indica cuántos menús quieres publicar");
      return;
    }

    if (!selectedCafeteriaData) {
      alert("⚠️ No hay cafetería seleccionada");
      return;
    }

    setIsPublishing(true);

    try {
      let finalImageUrl1 = generatedImageUrl1 || '';
      let finalImageUrl2 = generatedImageUrl2 || '';

      // Generar imágenes si no existen (sin actualizar estado visual)
      if (!finalImageUrl1) {
        try {
          const prompt = publishFormData.es_sorpresa 
            ? `Comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de menú del día universitario, plato equilibrado y nutritivo, estilo cafetería universitaria moderna, iluminación natural, fondo neutro profesional`
            : `${publishFormData.plato_principal} - comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de cafetería universitaria, plato equilibrado, iluminación natural, fondo neutro profesional, comida recién preparada`;
          
          const result = await base44.integrations.Core.GenerateImage({ prompt });
          if (result?.url) finalImageUrl1 = result.url;
        } catch (err) {
          console.error('Error generando imagen 1:', err);
        }
      }

      if (!finalImageUrl2) {
        try {
          const prompt = publishFormData.es_sorpresa 
            ? `Comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de menú del día universitario, plato equilibrado y nutritivo, estilo cafetería universitaria moderna, iluminación natural, fondo neutro profesional`
            : `${publishFormData.plato_secundario} - comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de cafetería universitaria, plato equilibrado, iluminación natural, fondo neutro profesional, comida recién preparada`;
          
          const result = await base44.integrations.Core.GenerateImage({ prompt });
          if (result?.url) finalImageUrl2 = result.url;
        } catch (err) {
          console.error('Error generando imagen 2:', err);
        }
      }

      const menuData = {
        plato_principal: publishFormData.es_sorpresa ? "Plato Sorpresa" : publishFormData.plato_principal,
        plato_secundario: publishFormData.es_sorpresa ? "Plato Sorpresa" : publishFormData.plato_secundario,
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
        alergenos: ['ninguno'],
        imagen_url: finalImageUrl1 || undefined,
        imagen_url_secundaria: finalImageUrl2 || undefined
      };

      await base44.entities.Menu.create(menuData);

      // Enviar notificación por email
      try {
        await base44.integrations.Core.SendEmail({
          to: 'piccas.entrepreneurship@gmail.com',
          subject: `🍽️ Nuevo Menú Publicado - ${selectedCafeteriaData.nombre}`,
          body: `
✅ Se ha publicado un nuevo menú:

📍 Cafetería: ${selectedCafeteriaData.nombre}
🏫 Campus: ${selectedCafeteriaData.campus}
📅 Fecha: ${menuData.fecha}
🍽️ Primer Plato: ${menuData.plato_principal}
🍽️ Segundo Plato: ${menuData.plato_secundario}
📦 Stock: ${menuData.stock_total} unidades
💰 Precio: €${menuData.precio_descuento}
${menuData.es_sorpresa ? '🎁 Menú Sorpresa' : ''}

⏰ Reservas: ${menuData.hora_inicio_reserva} - ${menuData.hora_limite_reserva}
⏰ Recogida: ${menuData.hora_inicio_recogida} - ${menuData.hora_limite}

---
PlatPal - Menús Sostenibles
          `.trim()
        });
      } catch (emailError) {
        console.error('Error enviando email de notificación:', emailError);
      }

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
      setGeneratedImageUrl1('');
      setGeneratedImageUrl2('');
      setAutoGenerateTriggered(false);

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
    if (!cafe) return;

    setSelectedCafeteriaId(id);
    setSelectedCafeteriaData(cafe);
    setPublishFormData(prev => ({
      ...prev,
      precio_original: cafe.precio_original_default || 8.50,
      hora_limite_reserva: cafe.hora_fin_reserva || "16:00",
      hora_limite: cafe.hora_fin_recogida || "18:00"
    }));
    setGeneratedImageUrl1('');
    setGeneratedImageUrl2('');
    setAutoGenerateTriggered(false);
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
          <CardContent className="p-8 space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">📋 ¿Eres administrador de una cafetería?</h3>
              <p className="text-blue-800 mb-4">Contacta con el equipo de PlatPal para registrar tu establecimiento y empezar a vender menús sostenibles.</p>
              <p className="text-sm text-blue-700">📧 Email: contacto@platpal.com</p>
            </div>
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900">
              {selectedCafeteriaData?.nombre || 'Panel de Cafetería'}
            </h1>
            <p className="text-gray-600 mt-1">Gestiona tus menús y pedidos</p>

            {availableCafeterias.length > 0 && (
              <div className="mt-4">
                {availableCafeterias.length > 1 ? (
                  <DropdownMenuCustom
                    className="w-full md:w-96"
                    options={availableCafeterias.map(cafe => ({
                      value: cafe.id,
                      label: cafe.nombre,
                      onClick: () => handleCafeteriaChange(cafe.id),
                      Icon: <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
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
                ) : (
                  <div className="inline-flex items-center gap-3 px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">{availableCafeterias[0].nombre}</p>
                      <p className="text-sm text-emerald-700">Campus {availableCafeterias[0].campus}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Hoy</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalMenusHoy}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Vendidos</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{stats.menusVendidos}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-black text-amber-600 mt-1">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <QrCode className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-black text-orange-600 mt-1">{stats.pedidosPendientes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={createPageUrl("PickupPanel")}>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Panel Recogida
            </Button>
          </Link>

          <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-amber-500 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Publicar Menú Rápido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>⚡ Publicar Menú Rápido</DialogTitle>
                <DialogDescription>Publica en segundos con imágenes IA automáticas</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuickPublish} className="space-y-4 mt-4">
                {availableCafeterias.length > 1 && (
                  <div className="space-y-2">
                    <Label>Cafetería</Label>
                    <Select value={selectedCafeteriaId} onValueChange={handleCafeteriaChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCafeterias.map(cafe => (
                          <SelectItem key={cafe.id} value={cafe.id}>
                            {cafe.nombre} - {cafe.campus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <Label className="font-semibold">Plato Sorpresa</Label>
                  <Switch
                    checked={publishFormData.es_sorpresa}
                    onCheckedChange={(checked) => setPublishFormData(prev => ({ ...prev, es_sorpresa: checked }))}
                  />
                </div>

                {publishFormData.es_sorpresa ? (
                  <div className="space-y-3">
                    <p className="text-sm text-purple-700 bg-purple-50 p-3 rounded-xl">
                      🎁 Generando imágenes de menú sorpresa universitario
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Primer Plato Sorpresa</Label>
                        {isGeneratingImage1 ? (
                          <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                            <div className="w-8 h-8 relative">
                              <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
                            </div>
                          </div>
                        ) : generatedImageUrl1 ? (
                          <div className="relative">
                            <img src={generatedImageUrl1} alt="Sorpresa 1" className="w-full h-32 object-cover rounded-xl" />
                            <button type="button" onClick={() => setGeneratedImageUrl1('')} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button type="button" onClick={() => handleGenerateImage(1)} variant="outline" size="sm" className="w-full">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar imagen
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Segundo Plato Sorpresa</Label>
                        {isGeneratingImage2 ? (
                          <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                            <div className="w-8 h-8 relative">
                              <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
                            </div>
                          </div>
                        ) : generatedImageUrl2 ? (
                          <div className="relative">
                            <img src={generatedImageUrl2} alt="Sorpresa 2" className="w-full h-32 object-cover rounded-xl" />
                            <button type="button" onClick={() => setGeneratedImageUrl2('')} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button type="button" onClick={() => handleGenerateImage(2)} variant="outline" size="sm" className="w-full">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar imagen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 p-4 border-2 border-emerald-200 rounded-xl bg-emerald-50/30">
                      <Label className="text-base font-bold">🍽️ Primer Plato</Label>
                      <Input
                        value={publishFormData.plato_principal}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_principal: e.target.value }))}
                        placeholder="Ej: Pollo al horno"
                        required
                      />
                      
                      {isGeneratingImage1 ? (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                          <div className="w-8 h-8 relative">
                            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
                          </div>
                        </div>
                      ) : generatedImageUrl1 ? (
                        <div className="relative">
                          <img src={generatedImageUrl1} alt="Primer plato" className="w-full h-32 object-cover rounded-xl border-2" />
                          <button type="button" onClick={() => setGeneratedImageUrl1('')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Button type="button" onClick={() => handleGenerateImage(1)} disabled={!publishFormData.plato_principal} variant="outline" size="sm" className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generar imagen
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/30">
                      <Label className="text-base font-bold">🍽️ Segundo Plato</Label>
                      <Input
                        value={publishFormData.plato_secundario}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_secundario: e.target.value }))}
                        placeholder="Ej: Patatas fritas"
                        required
                      />
                      
                      {isGeneratingImage2 ? (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                          <div className="w-8 h-8 relative">
                            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
                          </div>
                        </div>
                      ) : generatedImageUrl2 ? (
                        <div className="relative">
                          <img src={generatedImageUrl2} alt="Segundo plato" className="w-full h-32 object-cover rounded-xl border-2" />
                          <button type="button" onClick={() => setGeneratedImageUrl2('')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Button type="button" onClick={() => handleGenerateImage(2)} disabled={!publishFormData.plato_secundario} variant="outline" size="sm" className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generar imagen
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cantidad *</Label>
                    <Input 
                      type="number" 
                      value={publishFormData.stock_total} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setPublishFormData(prev => ({ ...prev, stock_total: value }));
                      }} 
                      min="1" 
                      required 
                      placeholder="Ej: 20"
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
                  <Button type="button" variant="outline" onClick={() => setShowPublishModal(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" disabled={isPublishing} className="flex-1 bg-emerald-600">
                    {isPublishing ? (
                      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Publicar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Link to={createPageUrl("PublishMenu")} state={{ selectedCafeteria: selectedCafeteriaData }}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Formulario Completo
            </Button>
          </Link>
        </div>

        {/* Pedidos Pendientes de Recogida */}
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              Pedidos Pendientes de Recogida
              {stats.pedidosPendientes > 0 && (
                <Badge className="bg-orange-500 text-white ml-2">{stats.pedidosPendientes}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0])).length > 0 ? (
              <div className="space-y-3">
                {reservations
                  .filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0]))
                  .map((reserva) => (
                    <div key={reserva.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-orange-100 px-3 py-2 rounded-lg">
                            <span className="text-xl font-mono font-bold text-orange-700">{reserva.codigo_recogida}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                          {reserva.pagado_con_bono && <Badge className="bg-purple-100 text-purple-800">🎁 Bono</Badge>}
                        </div>
                        <p className="font-semibold text-gray-900">{reserva.student_name || reserva.student_email}</p>
                        <p className="text-sm text-gray-600">📧 {reserva.student_email}</p>
                        <p className="text-sm text-gray-600 mt-1">🍽️ {reserva.menus_detalle}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          💰 {reserva.pagado_con_bono ? 'Gratis (Bono)' : `€${reserva.precio_total?.toFixed(2)}`}
                          {reserva.envase_propio && <span className="ml-2">♻️ Envase propio</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(reserva.created_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay pedidos pendientes de recogida</p>
              </div>
            )}
          </CardContent>
        </Card>

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
                      <Badge variant="outline" className="mt-2">Stock: {menu.stock_disponible}/{menu.stock_total}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateMenu(menu)} title="Duplicar"><Copy className="w-4 h-4" /></Button>
                      <Link to={createPageUrl("EditMenu")} state={{ menu }}><Button size="sm" variant="outline" title="Editar"><Edit className="w-4 h-4" /></Button></Link>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMenu(menu.id)} title="Eliminar"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">No hay menús hoy</p>
                <p className="text-gray-600 mb-6">Empieza publicando tu primer menú</p>
                <Button onClick={() => setShowPublishModal(true)} className="bg-emerald-600"><Plus className="w-4 h-4 mr-2" />Publicar Menú</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}