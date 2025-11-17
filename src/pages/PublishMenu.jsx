import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChefHat, Image as ImageIcon, Sparkles, Plus, Check, ArrowLeft, X, RefreshCw, Recycle } from "lucide-react";
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

  const [formData, setFormData] = useState({
    cafeteria_id: '',
    plato_principal: '',
    plato_secundario: '',
    precio_original: 8.5,
    stock_total: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_limite_reserva: '16:30',
    hora_limite: '18:00',
    es_sorpresa: false,
    es_recurrente: false,
    dias_semana: [],
    duracion_recurrente_dias: 7,
    tipo_cocina: '',
    es_vegetariano: false,
    es_vegano: false,
    sin_gluten: false,
    alergenos: [],
    permite_llevar_envase: true,
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

        if (userCafeterias.length > 0 && !formData.cafeteria_id) {
          const firstCafe = userCafeterias[0];
          setFormData(prev => ({
            ...prev,
            cafeteria_id: firstCafe.id,
            precio_original: firstCafe.precio_original_default || 8.5,
            hora_limite_reserva: '16:30',
            hora_limite: '18:00'
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
          hora_limite_reserva: '16:30',
          hora_limite: '18:00'
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

  const handleGenerateImage = useCallback(async () => {
    if (!formData.es_sorpresa && !formData.plato_principal && !formData.plato_secundario) {
      return;
    }

    if (isGenerating) return;

    setIsGenerating(true);
    try {
      let prompt;
      if (formData.es_sorpresa && formData.es_recurrente) {
        prompt = `Comida universitaria para llevar en envase eco-friendly. Presentación apetitosa de menú del día universitario, plato equilibrado y nutritivo, estilo cafetería universitaria moderna, iluminación natural, fondo neutro profesional`;
      } else if (!formData.es_sorpresa) {
        prompt = `Foto profesional de comida: ${formData.plato_principal} con ${formData.plato_secundario}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
      } else {
        setIsGenerating(false);
        return;
      }
      
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      
      if (result.url) {
        setGeneratedImageUrl(result.url);
      }
    } catch (error) {
      console.error('Error al generar imagen con IA:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [formData.plato_principal, formData.plato_secundario, formData.es_sorpresa, formData.es_recurrente, isGenerating]);

  useEffect(() => {
    if (formData.es_sorpresa && !formData.es_recurrente) {
      if (generatedImageUrl) {
        setGeneratedImageUrl('');
      }
      return;
    }

    if (!formData.es_sorpresa && (!formData.plato_principal || !formData.plato_secundario)) {
      if (generatedImageUrl) {
        setGeneratedImageUrl('');
      }
      return;
    }

    if (formData.plato_principal && formData.plato_secundario && !formData.es_sorpresa && !generatedImageUrl && !isGenerating) {
      const timer = setTimeout(() => {
        if (formData.plato_principal && formData.plato_secundario && !formData.es_sorpresa && !generatedImageUrl && !isGenerating) {
          handleGenerateImage();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData.plato_principal, formData.plato_secundario, formData.es_sorpresa, formData.es_recurrente, generatedImageUrl, isGenerating, handleGenerateImage]);

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
      ? `¿Crear menú recurrente que se publicará automáticamente durante ${formData.duracion_recurrente_dias} días en ${cafe.nombre}?`
      : `¿Confirmar publicación de este menú en ${cafe.nombre}?`;

    if (!confirm(confirmText)) return;

    setIsPublishing(true);

    try {
      const today = new Date(formData.fecha);
      const fechaFin = new Date(today);
      fechaFin.setDate(fechaFin.getDate() + parseInt(formData.duracion_recurrente_dias));

      const menuBase = {
        plato_principal: formData.es_sorpresa ? 'Plato Sorpresa' : formData.plato_principal,
        plato_secundario: formData.es_sorpresa ? '2º Plato Sorpresa' : formData.plato_secundario,
        precio_original: parseFloat(formData.precio_original),
        precio_descuento: 2.99,
        stock_total: parseInt(formData.stock_total),
        stock_disponible: parseInt(formData.stock_total),
        campus: cafe.campus, 
        cafeteria: cafe.nombre, 
        hora_limite_reserva: '16:30',
        hora_limite: '18:00',
        es_recurrente: formData.es_recurrente,
        es_sorpresa: formData.es_sorpresa,
        permite_llevar_envase: formData.permite_llevar_envase,
        permite_envase_propio: formData.permite_envase_propio,
        descuento_envase_propio: parseFloat(formData.descuento_envase_propio),
        tipo_cocina: formData.tipo_cocina,
        es_vegetariano: formData.es_vegetariano,
        es_vegano: formData.es_vegano,
        sin_gluten: formData.sin_gluten,
        alergenos: formData.alergenos.length > 0 ? formData.alergenos : ['ninguno'],
        imagen_url: generatedImageUrl || undefined
      };

      if (formData.es_recurrente) {
        menuBase.dias_semana = formData.dias_semana;
        menuBase.duracion_recurrente_dias = parseInt(formData.duracion_recurrente_dias);
        menuBase.fecha_fin_recurrente = fechaFin.toISOString().split('T')[0];
        menuBase.aviso_enviado = false;
      }

      console.log('📝 Creando menú con datos:', menuBase);

      if (formData.es_recurrente) {
        const menu = {
          ...menuBase,
          fecha: formData.fecha
        };

        await base44.entities.Menu.create(menu);
        alert(`✅ Menú recurrente creado. Se publicará automáticamente cada día durante ${formData.duracion_recurrente_dias} días en ${cafe.nombre}`);
      } else {
        const menu = {
          ...menuBase,
          fecha: formData.fecha,
          dias_semana: []
        };

        await base44.entities.Menu.create(menu);
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

  const canGenerateSurpriseImage = formData.es_sorpresa && formData.es_recurrente;

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
            <p className="text-gray-600 mt-2">Reservas: 15:30-16:30 | Recogida: 16:30-18:00</p>
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
                  {formData.es_recurrente && (
                    <p className="text-purple-700 text-sm mt-2">✨ Puedes generar una foto especial para menú sorpresa recurrente</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagen del Menú
                {isGenerating && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generando con IA...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {generatedImageUrl ? (
                <div className="relative group">
                  <img src={generatedImageUrl} alt="Menu" className="w-full h-64 object-cover rounded-xl" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerar
                    </Button>
                    <button
                      type="button"
                      onClick={() => setGeneratedImageUrl('')}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Generando imagen con IA...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.es_sorpresa && !formData.es_recurrente
                        ? 'No se genera imagen para platos sorpresa simples' 
                        : formData.es_sorpresa && formData.es_recurrente
                        ? 'Menú sorpresa recurrente - Puedes generar una imagen especial'
                        : 'Completa los platos para generar imagen automáticamente'}
                    </p>
                  </div>
                </div>
              )}
              
              {((!formData.es_sorpresa && formData.plato_principal && formData.plato_secundario) || canGenerateSurpriseImage) && !isGenerating && (
                <Button
                  type="button"
                  onClick={handleGenerateImage}
                  variant="outline"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generatedImageUrl ? 'Regenerar Imagen' : 'Generar Imagen Manualmente'}
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

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <Label className="font-semibold">Menú Recurrente</Label>
                  <p className="text-sm text-gray-600">Publicar automáticamente durante varios días</p>
                </div>
                <Switch
                  checked={formData.es_recurrente}
                  onCheckedChange={(v) => handleChange('es_recurrente', v)}
                />
              </div>

              {formData.es_recurrente && (
                <div className="space-y-4">
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

                  <div>
                    <Label>Duración (días) *</Label>
                    <Select 
                      value={formData.duracion_recurrente_dias.toString()} 
                      onValueChange={(v) => handleChange('duracion_recurrente_dias', parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 semana (7 días)</SelectItem>
                        <SelectItem value="14">2 semanas (14 días)</SelectItem>
                        <SelectItem value="21">3 semanas (21 días)</SelectItem>
                        <SelectItem value="30">1 mes (30 días)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600 mt-1">Se publicará 1 menú cada día durante este periodo</p>
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
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-green-700" />
                  <div>
                    <Label className="font-semibold">¿Permite envase propio?</Label>
                    <p className="text-xs text-gray-600">El estudiante puede traer su recipiente</p>
                  </div>
                </div>
                <Switch
                  checked={formData.permite_llevar_envase}
                  onCheckedChange={(v) => {
                    handleChange('permite_llevar_envase', v);
                    handleChange('permite_envase_propio', v);
                  }}
                />
              </div>

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
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              {formData.es_recurrente ? 'Publicar Menú Recurrente' : 'Publicar Menú'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(PublishMenu, ['cafeteria', 'admin']);