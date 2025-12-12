import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Calendar, Clock, Euro, Image as ImageIcon, Sparkles, Plus, Check, ArrowLeft, X, RefreshCw, Loader2 } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";

function PublishMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cafeterias, setCafeterias] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatedImageUrl2, setGeneratedImageUrl2] = useState('');

  const [formData, setFormData] = useState({
    cafeteria_id: '',
    plato_principal: '',
    plato_secundario: '',
    precio_original: 8.5,
    stock_total: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio_reserva: '15:30',
    hora_limite_reserva: '16:30',
    hora_inicio_recogida: '16:30',
    hora_limite: '18:00',
    es_sorpresa: false,
    es_recurrente: false,
    dias_semana: [],
    duracion_recurrencia_dias: 7,
    tipo_cocina: '',
    es_vegetariano: false,
    es_vegano: false,
    sin_gluten: false,
    alergenos: [],
    permite_envase_propio: true,
    descuento_envase_propio: 0.15
  });

  const tiposCocina = [
    'mediterranea', 'italiana', 'asiatica', 'mexicana', 
    'vegetariana', 'casera', 'internacional', 'rapida', 'otra'
  ];

  const alergenosComunes = [
    'gluten', 'lacteos', 'huevo', 'pescado', 'marisco',
    'frutos_secos', 'soja', 'sulfitos', 'ninguno'
  ];

  const diasSemana = [
    { id: 'monday', label: 'Lunes' },
    { id: 'tuesday', label: 'Martes' },
    { id: 'wednesday', label: 'Miércoles' },
    { id: 'thursday', label: 'Jueves' },
    { id: 'friday', label: 'Viernes' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  useEffect(() => {
    const loadUserAndCafeterias = async () => {
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

        setCafeterias(userCafeterias);

        // Si viene de dashboard con cafetería seleccionada, usarla
        if (location.state?.selectedCafeteria) {
          const selectedCafe = location.state.selectedCafeteria;
          setFormData(prev => ({
            ...prev,
            cafeteria_id: selectedCafe.id,
            precio_original: selectedCafe.precio_original_default || 8.5,
            hora_inicio_reserva: '15:30',
            hora_limite_reserva: selectedCafe.hora_fin_reserva || '16:30',
            hora_inicio_recogida: selectedCafe.hora_fin_reserva || '16:30',
            hora_limite: selectedCafe.hora_fin_recogida || '18:00'
          }));
        } else if (userCafeterias.length > 0 && !formData.cafeteria_id) {
          const firstCafe = userCafeterias[0];
          setFormData(prev => ({
            ...prev,
            cafeteria_id: firstCafe.id,
            precio_original: firstCafe.precio_original_default || 8.5,
            hora_inicio_reserva: '15:30',
            hora_limite_reserva: firstCafe.hora_fin_reserva || '16:30',
            hora_inicio_recogida: firstCafe.hora_fin_reserva || '16:30',
            hora_limite: firstCafe.hora_fin_recogida || '18:00'
          }));
        }

        if (location.state?.duplicateFrom) {
          const menu = location.state.duplicateFrom;
          setFormData(prev => ({
            ...prev,
            ...menu,
            cafeteria_id: userCafeterias.find(c => c.nombre === menu.cafeteria)?.id || prev.cafeteria_id,
            stock_total: menu.stock_total,
            stock_disponible: undefined
          }));
          if (menu.imagen_url) {
            setGeneratedImageUrl(menu.imagen_url);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadUserAndCafeterias();
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'cafeteria_id') {
      const cafe = cafeterias.find(c => c.id === value);
      if (cafe) {
        console.log('✅ Cafetería seleccionada:', cafe.nombre, 'Campus:', cafe.campus);
        setFormData(prev => ({
          ...prev,
          precio_original: cafe.precio_original_default || 8.5,
          hora_inicio_reserva: '15:30',
          hora_limite_reserva: cafe.hora_fin_reserva || '16:30',
          hora_inicio_recogida: cafe.hora_fin_reserva || '16:30',
          hora_limite: cafe.hora_fin_recogida || '18:00'
        }));
      }
    }
  };

  const toggleDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia]
    }));
  };

  const toggleAlergeno = (alergeno) => {
    setFormData(prev => ({
      ...prev,
      alergenos: prev.alergenos.includes(alergeno)
        ? prev.alergenos.filter(a => a !== alergeno)
        : [...prev.alergenos, alergeno]
    }));
  };

  const handleGenerateImages = useCallback(async () => {
    if (isGenerating) return;

    const shouldGenerateForSurprise = formData.es_sorpresa;
    const shouldGenerateForRegular = !formData.es_sorpresa && formData.plato_principal && formData.plato_secundario;

    if (!shouldGenerateForSurprise && !shouldGenerateForRegular) {
      return;
    }

    setIsGenerating(true);
    try {
      if (shouldGenerateForSurprise) {
        const prompt = 'A surprise mystery meal box for university students, featuring a beautifully arranged takeaway container with question mark decorations, colorful food presentation, eco-friendly packaging, professional food photography, appetizing and intriguing';
        const result = await base44.integrations.Core.GenerateImage({ prompt });
        if (result.url) {
          setGeneratedImageUrl(result.url);
        }
      } else {
        // Generar imagen para plato principal
        const prompt1 = `Foto profesional de comida: ${formData.plato_principal}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
        const result1 = await base44.integrations.Core.GenerateImage({ prompt: prompt1 });
        if (result1.url) {
          setGeneratedImageUrl(result1.url);
        }

        // Generar imagen para plato secundario
        const prompt2 = `Foto profesional de comida: ${formData.plato_secundario}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
        const result2 = await base44.integrations.Core.GenerateImage({ prompt: prompt2 });
        if (result2.url) {
          setGeneratedImageUrl2(result2.url);
        }
      }
    } catch (error) {
      console.error('Error al generar imágenes con IA:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [formData.plato_principal, formData.plato_secundario, formData.es_sorpresa, formData.es_recurrente, isGenerating]);

  useEffect(() => {
    const shouldGenerateForSurprise = formData.es_sorpresa;
    const shouldGenerateForRegular = !formData.es_sorpresa && formData.plato_principal && formData.plato_secundario;

    if ((shouldGenerateForSurprise || shouldGenerateForRegular) && !generatedImageUrl && !generatedImageUrl2 && !isGenerating) {
      const timer = setTimeout(() => {
        handleGenerateImages();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData.plato_principal, formData.plato_secundario, formData.es_sorpresa, formData.es_recurrente, generatedImageUrl, generatedImageUrl2, isGenerating, handleGenerateImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.es_sorpresa && (!formData.plato_principal || !formData.plato_secundario)) {
      alert('⚠️ Completa los platos o activa "Plato Sorpresa"');
      return;
    }

    if (!formData.stock_total || parseInt(formData.stock_total) <= 0) {
      alert('⚠️ Indica el stock total');
      return;
    }

    if (!formData.cafeteria_id) {
      alert('⚠️ Selecciona una cafetería');
      return;
    }

    if (formData.es_recurrente && formData.dias_semana.length === 0) {
      alert('⚠️ Selecciona al menos un día para el menú recurrente');
      return;
    }

    const cafe = cafeterias.find(c => c.id === formData.cafeteria_id);
    if (!cafe) {
      alert('⚠️ Cafetería no encontrada');
      console.error('Cafeterías disponibles:', cafeterias);
      console.error('ID buscado:', formData.cafeteria_id);
      return;
    }

    console.log('✅ Cafetería encontrada:', cafe.nombre, 'Campus:', cafe.campus);

    const confirmText = formData.es_recurrente
      ? `¿Crear menú recurrente de ${formData.duracion_recurrencia_dias} días para los días seleccionados en ${cafe.nombre}?`
      : `¿Confirmar publicación de este menú en ${cafe.nombre}?`;

    if (!confirm(confirmText)) return;

    setIsPublishing(true);

    try {
      // Generar imágenes automáticamente si no existen
      let finalImageUrl = generatedImageUrl;
      let finalImageUrl2 = generatedImageUrl2;

      if (formData.es_sorpresa && !finalImageUrl) {
        setIsGenerating(true);
        try {
          const prompt = 'A surprise mystery meal box for university students, featuring a beautifully arranged takeaway container with question mark decorations, colorful food presentation, eco-friendly packaging, professional food photography, appetizing and intriguing';
          const result = await base44.integrations.Core.GenerateImage({ prompt });
          if (result.url) finalImageUrl = result.url;
        } catch (error) {
          console.error('Error generando imagen sorpresa:', error);
        } finally {
          setIsGenerating(false);
        }
      } else if (!formData.es_sorpresa) {
        if (!finalImageUrl && formData.plato_principal) {
          setIsGenerating(true);
          try {
            const prompt1 = `Foto profesional de comida: ${formData.plato_principal}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
            const result1 = await base44.integrations.Core.GenerateImage({ prompt: prompt1 });
            if (result1.url) finalImageUrl = result1.url;
          } catch (error) {
            console.error('Error generando imagen principal:', error);
          } finally {
            setIsGenerating(false);
          }
        }
        if (!finalImageUrl2 && formData.plato_secundario) {
          setIsGenerating(true);
          try {
            const prompt2 = `Foto profesional de comida: ${formData.plato_secundario}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
            const result2 = await base44.integrations.Core.GenerateImage({ prompt: prompt2 });
            if (result2.url) finalImageUrl2 = result2.url;
          } catch (error) {
            console.error('Error generando imagen secundaria:', error);
          } finally {
            setIsGenerating(false);
          }
        }
      }

      const menuBase = {
        plato_principal: formData.es_sorpresa ? 'Plato Sorpresa' : formData.plato_principal,
        plato_secundario: formData.es_sorpresa ? '2º Plato Sorpresa' : formData.plato_secundario,
        precio_original: parseFloat(formData.precio_original),
        precio_descuento: 2.99,
        stock_total: parseInt(formData.stock_total),
        stock_disponible: parseInt(formData.stock_total),
        campus: cafe.campus, 
        cafeteria: cafe.nombre, 
        hora_inicio_reserva: formData.hora_inicio_reserva,
        hora_limite_reserva: formData.hora_limite_reserva,
        hora_inicio_recogida: formData.hora_inicio_recogida,
        hora_limite: formData.hora_limite,
        es_recurrente: formData.es_recurrente,
        es_sorpresa: formData.es_sorpresa,
        permite_envase_propio: formData.permite_envase_propio,
        descuento_envase_propio: parseFloat(formData.descuento_envase_propio),
        tipo_cocina: formData.tipo_cocina,
        es_vegetariano: formData.es_vegetariano,
        es_vegano: formData.es_vegano,
        sin_gluten: formData.sin_gluten,
        alergenos: formData.alergenos.length > 0 ? formData.alergenos : ['ninguno'],
        imagen_url: finalImageUrl || undefined,
        imagen_url_secundaria: finalImageUrl2 || undefined
      };

      console.log('📝 Creando menú(s) con datos:', menuBase);

      if (formData.es_recurrente) {
        const startDate = new Date(formData.fecha);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + formData.duracion_recurrencia_dias);
        
        const menuPadre = await base44.entities.Menu.create({
          ...menuBase,
          fecha: formData.fecha,
          fecha_fin_recurrencia: endDate.toISOString().split('T')[0],
          duracion_recurrencia_dias: formData.duracion_recurrencia_dias,
          dias_semana: formData.dias_semana
        });

        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const menusToCreate = [];
        
        for (let i = 1; i < formData.duracion_recurrencia_dias; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dayId = daysOfWeek[currentDate.getDay()];
          
          if (formData.dias_semana.includes(dayId)) {
            menusToCreate.push({
              ...menuBase,
              fecha: currentDate.toISOString().split('T')[0],
              fecha_fin_recurrencia: endDate.toISOString().split('T')[0],
              duracion_recurrencia_dias: formData.duracion_recurrencia_dias,
              menu_padre_id: menuPadre.id,
              dias_semana: formData.dias_semana
            });
          }
        }

        for (const menuData of menusToCreate) {
          await base44.entities.Menu.create(menuData);
        }

        // Enviar email de notificación
        try {
          await base44.integrations.Core.SendEmail({
            to: 'piccas.entrepreneurship@gmail.com',
            subject: `🍽️ Menú Recurrente Publicado - ${cafe.nombre}`,
            body: `
✅ Se ha publicado un menú recurrente:

📍 Cafetería: ${cafe.nombre}
🏫 Campus: ${cafe.campus}
📅 Duración: ${formData.duracion_recurrencia_dias} días
📆 Días: ${formData.dias_semana.map(d => diasSemana.find(ds => ds.id === d)?.label).join(', ')}
🍽️ Primer Plato: ${menuBase.plato_principal}
🍽️ Segundo Plato: ${menuBase.plato_secundario}
📦 Stock diario: ${menuBase.stock_total} unidades
💰 Precio: €${menuBase.precio_descuento}
${menuBase.es_sorpresa ? '🎁 Menú Sorpresa' : ''}

📊 Total menús creados: ${menusToCreate.length + 1}

---
PlatPal - Menús Sostenibles
            `.trim()
          });
        } catch (emailError) {
          console.error('Error enviando email de notificación:', emailError);
        }

        alert(`✅ Menú recurrente creado (1 inicial + ${menusToCreate.length} programados para ${formData.duracion_recurrencia_dias} días)`);
      } else {
        const menu = {
          ...menuBase,
          fecha: formData.fecha,
          dias_semana: []
        };

        await base44.entities.Menu.create(menu);

        // Enviar email de notificación
        try {
          await base44.integrations.Core.SendEmail({
            to: 'piccas.entrepreneurship@gmail.com',
            subject: `🍽️ Nuevo Menú Publicado - ${cafe.nombre}`,
            body: `
✅ Se ha publicado un nuevo menú:

📍 Cafetería: ${cafe.nombre}
🏫 Campus: ${cafe.campus}
📅 Fecha: ${formData.fecha}
🍽️ Primer Plato: ${menuBase.plato_principal}
🍽️ Segundo Plato: ${menuBase.plato_secundario}
📦 Stock: ${menuBase.stock_total} unidades
💰 Precio: €${menuBase.precio_descuento}
${menuBase.es_sorpresa ? '🎁 Menú Sorpresa' : ''}

⏰ Reservas: ${formData.hora_inicio_reserva} - ${formData.hora_limite_reserva}
⏰ Recogida: ${formData.hora_inicio_recogida} - ${formData.hora_limite}

---
PlatPal - Menús Sostenibles
            `.trim()
          });
        } catch (emailError) {
          console.error('Error enviando email de notificación:', emailError);
        }

        alert(`✅ Menú publicado en ${cafe.nombre}`);
      }

      navigate(createPageUrl("CafeteriaDashboard"), { state: { refresh: true } });
    } catch (error) {
      console.error('❌ Error publishing:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  if (cafeterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sin Cafeterías Asignadas</h2>
            <p className="text-gray-600 mb-6">No tienes cafeterías asignadas para publicar menús</p>
            <Link to={createPageUrl("Home")}>
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Publicar Menú</h1>
            <p className="text-gray-600 mt-2">Crea un nuevo menú con imagen IA automática</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {cafeterias.length > 1 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle>🏪 Selecciona Cafetería</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Select value={formData.cafeteria_id} onValueChange={(v) => handleChange('cafeteria_id', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cafeterias.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre} - Campus {c.campus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-emerald-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Platos del Menú
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Plato Sorpresa</Label>
                  <Switch
                    checked={formData.es_sorpresa}
                    onCheckedChange={(v) => handleChange('es_sorpresa', v)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!formData.es_sorpresa && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Plato Principal *</Label>
                    <Input
                      value={formData.plato_principal}
                      onChange={(e) => handleChange('plato_principal', e.target.value)}
                      placeholder="Ej: Pollo al horno"
                    />
                  </div>
                  <div>
                    <Label>Acompañamiento *</Label>
                    <Input
                      value={formData.plato_secundario}
                      onChange={(e) => handleChange('plato_secundario', e.target.value)}
                      placeholder="Ej: Patatas fritas"
                    />
                  </div>
                </div>
              )}
              {formData.es_sorpresa && (
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <p className="text-purple-900 font-semibold">🎁 Los estudiantes no sabrán qué hay hasta recoger</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imágenes de los Platos
                {isGenerating && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generando con IA...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!formData.es_sorpresa && (generatedImageUrl || generatedImageUrl2) ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Imagen Plato Principal */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Plato Principal</Label>
                    {generatedImageUrl ? (
                      <div className="relative group">
                        <img src={generatedImageUrl} alt="Plato Principal" className="w-full h-48 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => setGeneratedImageUrl('')}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isGenerating ? (
                      <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                        <Sparkles className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Imagen Plato Secundario */}
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Acompañamiento</Label>
                    {generatedImageUrl2 ? (
                      <div className="relative group">
                        <img src={generatedImageUrl2} alt="Acompañamiento" className="w-full h-48 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => setGeneratedImageUrl2('')}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isGenerating ? (
                      <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                        <Sparkles className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ) : formData.es_sorpresa && generatedImageUrl ? (
                <div className="relative group">
                  <img src={generatedImageUrl} alt="Menú Sorpresa" className="w-full h-64 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setGeneratedImageUrl('')}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : isGenerating ? (
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                  <OrbitalLoader message="Generando imágenes con IA..." />
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.es_sorpresa
                        ? 'Se generará una imagen especial para el plato sorpresa'
                        : 'Completa los platos para generar imágenes automáticamente'}
                    </p>
                  </div>
                </div>
              )}
              
              {(!formData.es_sorpresa && !isGenerating && formData.plato_principal && formData.plato_secundario || 
                formData.es_sorpresa && !isGenerating) && (
                <Button
                  type="button"
                  onClick={handleGenerateImages}
                  variant="outline"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generatedImageUrl || generatedImageUrl2 ? 'Regenerar Imágenes' : 'Generar Imágenes Manualmente'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle>⚙️ Configuración</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Stock Total *</Label>
                  <Input
                    type="number"
                    value={formData.stock_total}
                    onChange={(e) => handleChange('stock_total', e.target.value)}
                    min="1"
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

              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-4">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horarios de Reserva y Recogida
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-blue-800">Horario de Reservas</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-xs text-gray-600">Inicio</Label>
                        <Input
                          type="time"
                          value={formData.hora_inicio_reserva}
                          onChange={(e) => handleChange('hora_inicio_reserva', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Fin</Label>
                        <Input
                          type="time"
                          value={formData.hora_limite_reserva}
                          onChange={(e) => handleChange('hora_limite_reserva', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-blue-800">Horario de Recogida</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-xs text-gray-600">Inicio</Label>
                        <Input
                          type="time"
                          value={formData.hora_inicio_recogida}
                          onChange={(e) => handleChange('hora_inicio_recogida', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Fin</Label>
                        <Input
                          type="time"
                          value={formData.hora_limite}
                          onChange={(e) => handleChange('hora_limite', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <Label className="font-semibold">Menú Recurrente</Label>
                  <p className="text-sm text-gray-600">Publicar en varios días de la semana</p>
                </div>
                <Switch
                  checked={formData.es_recurrente}
                  onCheckedChange={(v) => handleChange('es_recurrente', v)}
                />
              </div>

              {formData.es_recurrente && (
                <div className="space-y-4">
                  <div>
                    <Label>Duración del menú recurrente</Label>
                    <Select 
                      value={formData.duracion_recurrencia_dias?.toString()} 
                      onValueChange={(value) => handleChange('duracion_recurrencia_dias', parseInt(value))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona duración" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 semana (7 días)</SelectItem>
                        <SelectItem value="14">2 semanas (14 días)</SelectItem>
                        <SelectItem value="21">3 semanas (21 días)</SelectItem>
                        <SelectItem value="30">1 mes (30 días)</SelectItem>
                        <SelectItem value="60">2 meses (60 días)</SelectItem>
                        <SelectItem value="90">3 meses (90 días)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Días de la Semana *</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {diasSemana.map(dia => (
                        <Button
                          key={dia.id}
                          type="button"
                          variant={formData.dias_semana.includes(dia.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDia(dia.id)}
                        >
                          {formData.dias_semana.includes(dia.id) && <Check className="w-4 h-4 mr-1" />}
                          {dia.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle>🥗 Propiedades</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Tipo de Cocina</Label>
                <Select value={formData.tipo_cocina} onValueChange={(v) => handleChange('tipo_cocina', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCocina.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>Vegetariano</Label>
                  <Switch
                    checked={formData.es_vegetariano}
                    onCheckedChange={(v) => handleChange('es_vegetariano', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>Vegano</Label>
                  <Switch
                    checked={formData.es_vegano}
                    onCheckedChange={(v) => handleChange('es_vegano', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>Sin Gluten</Label>
                  <Switch
                    checked={formData.sin_gluten}
                    onCheckedChange={(v) => handleChange('sin_gluten', v)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <div>
                  <Label className="font-semibold">Permite envase propio</Label>
                  <p className="text-sm text-gray-600">Los estudiantes pueden traer su propio contenedor</p>
                </div>
                <Switch
                  checked={formData.permite_envase_propio}
                  onCheckedChange={(v) => handleChange('permite_envase_propio', v)}
                />
              </div>

              <div>
                <Label>Alérgenos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {alergenosComunes.map(a => (
                    <Badge
                      key={a}
                      variant={formData.alergenos.includes(a) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAlergeno(a)}
                    >
                      {formData.alergenos.includes(a) && <Check className="w-3 h-3 mr-1" />}
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link to={createPageUrl("CafeteriaDashboard")} className="flex-1">
              <Button type="button" variant="outline" className="w-full py-6">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPublishing}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 py-6 text-lg font-bold"
            >
              {isPublishing ? (
                <OrbitalLoader className="w-5 h-5 mr-2" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {formData.es_recurrente ? 'Publicar Menús Recurrentes' : 'Publicar Menú'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(PublishMenu, ['cafeteria', 'admin']);