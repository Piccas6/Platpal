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
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
  Image as ImageIcon,
  X
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
      const cafeteriaId = selectedCafeteriaData.id;
      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      console.log('🔍 Cargando datos para cafetería:', cafeteriaName, 'ID:', cafeteriaId);

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
    
    if (!plato || publishFormData.es_sorpresa) return;

    const setIsGenerating = platoNum === 1 ? setIsGeneratingImage1 : setIsGeneratingImage2;
    const setImageUrl = platoNum === 1 ? setGeneratedImageUrl1 : setGeneratedImageUrl2;
    
    setIsGenerating(true);
    try {
      const prompt = `Foto profesional de comida: ${plato}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
      
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
      console.log('📝 Publicando menú para:', selectedCafeteriaData.nombre);

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
        imagen_url: generatedImageUrl1 || undefined,
        imagen_url_secundaria: generatedImageUrl2 || undefined
      };

      console.log('✅ Creando menú con datos:', menuData);
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
      setGeneratedImageUrl1('');
      setGeneratedImageUrl2('');

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
    console.log('🔄 Cambiando a cafetería ID:', id);
    const cafe = availableCafeterias.find(c => c.id === id);
    if (!cafe) {
      console.error('❌ Cafetería no encontrada:', id);
      return;
    }

    console.log('✅ Cafetería encontrada:', cafe.nombre);
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
            <p className="text-gray-600 mt-2">No tienes cafeterías asignadas</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">📋 ¿Eres administrador de una cafetería?</h3>
              <p className="text-blue-800 mb-4">Contacta con el equipo de PlatPal para registrar tu establecimiento y empezar a vender menús sostenibles.</p>
              <p className="text-sm text-blue-700">📧 Email: contacto@platpal.com</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="w-full"
            >
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

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-gray-900">
              {selectedCafeteriaData?.nombre || 'Panel de Cafetería'}
            </h1>
            <p className="text-gray-600 mt-1">Gestiona tus menús y pedidos</p>

            {/* Selector de Cafetería */}
            {availableCafeterias.length > 0 && (
              <div className="mt-4">
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
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
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

        {/* BOTONES */}
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
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <Label className="font-semibold">Plato Sorpresa</Label>
                  <Switch
                    checked={publishFormData.es_sorpresa}
                    onCheckedChange={(checked) => setPublishFormData(prev => ({ ...prev, es_sorpresa: checked }))}
                  />
                </div>

                {!publishFormData.es_sorpresa && (
                  <>
                    {/* PRIMER PLATO */}
                    <div className="space-y-3 p-4 border-2 border-emerald-200 rounded-xl bg-emerald-50/30">
                      <Label className="text-base font-bold">🍽️ Primer Plato</Label>
                      <Input
                        value={publishFormData.plato_principal}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_principal: e.target.value }))}
                        placeholder="Ej: Pollo al horno"
                        required
                      />
                      
                      {generatedImageUrl1 ? (
                        <div className="relative">
                          <img src={generatedImageUrl1} alt="Primer plato" className="w-full h-32 object-cover rounded-xl border-2" />
                          <button
                            type="button"
                            onClick={() => setGeneratedImageUrl1('')}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleGenerateImage(1)}
                          disabled={isGeneratingImage1 || !publishFormData.plato_principal}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          {isGeneratingImage1 ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Generar imagen del primer plato
                        </Button>
                      )}
                    </div>

                    {/* SEGUNDO PLATO */}
                    <div className="space-y-3 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/30">
                      <Label className="text-base font-bold">🍽️ Segundo Plato</Label>
                      <Input
                        value={publishFormData.plato_secundario}
                        onChange={(e) => setPublishFormData(prev => ({ ...prev, plato_secundario: e.target.value }))}
                        placeholder="Ej: Patatas fritas"
                        required
                      />
                      
                      {generatedImageUrl2 ? (
                        <div className="relative">
                          <img src={generatedImageUrl2} alt="Segundo plato" className="w-full h-32 object-cover rounded-xl border-2" />
                          <button
                            type="button"
                            onClick={() => setGeneratedImageUrl2('')}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleGenerateImage(2)}
                          disabled={isGeneratingImage2 || !publishFormData.plato_secundario}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          {isGeneratingImage2 ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Generar imagen del segundo plato
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
                      'Publicar'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Link to={createPageUrl("PublishMenu")}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
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
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateMenu(menu)} title="Duplicar">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link to={createPageUrl("EditMenu")} state={{ menu }}>
                        <Button size="sm" variant="outline" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMenu(menu.id)} title="Eliminar">
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
                <p className="text-gray-600 mb-6">Empieza publicando tu primer menú</p>
                <Button onClick={() => setShowPublishModal(true)} className="bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar Menú
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}