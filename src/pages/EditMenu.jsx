import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Recycle, Sparkles, Image as ImageIcon, Upload, X, RefreshCw } from "lucide-react";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";

function EditMenu({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');

  useEffect(() => {
    const loadMenu = async () => {
      // Check if menu was passed via location.state
      if (location.state?.menu) {
        const menuData = location.state.menu;
        setMenu(menuData);
        setFormData({
          plato_principal: menuData.plato_principal,
          plato_secundario: menuData.plato_secundario,
          precio_original: menuData.precio_original,
          stock_disponible: menuData.stock_disponible,
          hora_inicio_reserva: menuData.hora_inicio_reserva || '15:30',
          hora_limite_reserva: menuData.hora_limite_reserva || '16:30',
          hora_inicio_recogida: menuData.hora_inicio_recogida || '16:30',
          hora_limite: menuData.hora_limite || '18:00',
          permite_envase_propio: menuData.permite_envase_propio ?? true,
          descuento_envase_propio: menuData.descuento_envase_propio ?? 0.15,
          es_sorpresa: menuData.es_sorpresa ?? false
        });
        setImageUrl(menuData.imagen_url || '');
        setImageUrl2(menuData.imagen_url_secundaria || '');
        setIsLoading(false);
        return;
      }

      // Fallback to URL param if no state
      const searchParams = new URLSearchParams(location.search);
      const menuId = searchParams.get('id');
      if (menuId) {
        try {
          const data = await base44.entities.Menu.get(menuId);
          setMenu(data);
          setFormData({
            plato_principal: data.plato_principal,
            plato_secundario: data.plato_secundario,
            precio_original: data.precio_original,
            stock_disponible: data.stock_disponible,
            hora_inicio_reserva: data.hora_inicio_reserva || '15:30',
            hora_limite_reserva: data.hora_limite_reserva || '16:30',
            hora_inicio_recogida: data.hora_inicio_recogida || '16:30',
            hora_limite: data.hora_limite || '18:00',
            permite_envase_propio: data.permite_envase_propio ?? true,
            descuento_envase_propio: data.descuento_envase_propio ?? 0.15,
            es_sorpresa: data.es_sorpresa ?? false
          });
          setImageUrl(data.imagen_url || '');
          setImageUrl2(data.imagen_url_secundaria || '');
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching menu:", err);
          alert("No se pudo cargar el menú para editar.");
          navigate(createPageUrl("CafeteriaDashboard"));
        }
      } else {
        alert("No se especificó un menú para editar.");
        navigate(createPageUrl("CafeteriaDashboard"));
      }
    };

    loadMenu();
  }, [location.search, location.state, navigate]);

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSwitchChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleGenerateImages = useCallback(async () => {
    if (formData.es_sorpresa || !formData.plato_principal || !formData.plato_secundario) {
      return;
    }

    if (isGeneratingImage) return;

    setIsGeneratingImage(true);
    try {
      // Generar imagen para plato principal
      const prompt1 = `Foto profesional de comida: ${formData.plato_principal}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
      const result1 = await base44.integrations.Core.GenerateImage({ prompt: prompt1 });
      if (result1.url) {
        setImageUrl(result1.url);
      }

      // Generar imagen para plato secundario
      const prompt2 = `Foto profesional de comida: ${formData.plato_secundario}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
      const result2 = await base44.integrations.Core.GenerateImage({ prompt: prompt2 });
      if (result2.url) {
        setImageUrl2(result2.url);
      }
    } catch (error) {
      console.error('Error al generar imágenes con IA:', error);
      alert('Error al generar las imágenes. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [formData.plato_principal, formData.plato_secundario, formData.es_sorpresa, isGeneratingImage]);

  const handleImageUpload = async (e, imageNumber) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      if (result.file_url) {
        if (imageNumber === 1) {
          setImageUrl(result.file_url);
        } else {
          setImageUrl2(result.file_url);
        }
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      console.log('💾 Guardando cambios del menú...');
      
      await base44.entities.Menu.update(menu.id, {
        ...formData,
        stock_total: menu.stock_total, // Mantener stock_total original
        imagen_url: imageUrl || undefined,
        imagen_url_secundaria: imageUrl2 || undefined
      });
      
      console.log('✅ Menú actualizado exitosamente');
      
      // Wait for DB replication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate with refresh flag
      navigate(createPageUrl("CafeteriaDashboard"), {
        state: { refreshData: true, timestamp: Date.now() }
      });
    } catch (error) {
      console.error("❌ Error updating menu:", error);
      alert("Error al actualizar el menú.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !menu) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="ml-2">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Editar Menú</h1>
            <p className="text-gray-600 mt-2">Ajusta los detalles de tu menú publicado.</p>
          </div>
        </div>

        <Card className="shadow-lg border-2">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl border">
                 <Sparkles className="w-5 h-5 text-purple-700"/>
                 <p className="text-sm font-medium text-gray-800">
                    {formData.es_sorpresa ? "Este es un menú sorpresa." : "Este no es un menú sorpresa."}
                 </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plato_principal">Plato Principal</Label>
                  <Input id="plato_principal" value={formData.plato_principal || ''} onChange={handleInputChange} required disabled={formData.es_sorpresa} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plato_secundario">2º Plato</Label>
                  <Input id="plato_secundario" value={formData.plato_secundario || ''} onChange={handleInputChange} required disabled={formData.es_sorpresa} />
                </div>
              </div>

              {/* SECCIÓN DE IMÁGENES */}
              {!formData.es_sorpresa && (
                <Card className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Imágenes de los Platos
                      {isGeneratingImage && (
                        <span className="ml-2 text-sm text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando...
                        </span>
                      )}
                      {isUploadingImage && (
                        <span className="ml-2 text-sm text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subiendo...
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Imagen Plato Principal */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Plato Principal</Label>
                        {imageUrl ? (
                          <div className="relative group">
                            <img src={imageUrl} alt="Plato Principal" className="w-full h-48 object-cover rounded-xl border-2" />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 1)}
                            disabled={isGeneratingImage || isUploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full pointer-events-none"
                            disabled={isGeneratingImage || isUploadingImage}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Subir imagen
                          </Button>
                        </div>
                      </div>

                      {/* Imagen Plato Secundario */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Acompañamiento</Label>
                        {imageUrl2 ? (
                          <div className="relative group">
                            <img src={imageUrl2} alt="Acompañamiento" className="w-full h-48 object-cover rounded-xl border-2" />
                            <button
                              type="button"
                              onClick={() => setImageUrl2('')}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 2)}
                            disabled={isGeneratingImage || isUploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full pointer-events-none"
                            disabled={isGeneratingImage || isUploadingImage}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Subir imagen
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGenerateImages}
                      disabled={isGeneratingImage || isUploadingImage || !formData.plato_principal || !formData.plato_secundario}
                      variant="outline"
                      className="w-full"
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (imageUrl && imageUrl2) ? (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {(imageUrl && imageUrl2) ? 'Regenerar ambas con IA' : 'Generar ambas con IA'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="precio_original">Precio Original (€)</Label>
                  <Input id="precio_original" type="number" step="0.01" value={formData.precio_original || ''} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Precio PlatPal (€)</Label>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-xl font-bold text-emerald-600">€2.99</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_disponible">Stock Disponible</Label>
                  <Input id="stock_disponible" type="number" value={formData.stock_disponible || 0} onChange={handleInputChange} required />
                   <p className="text-xs text-gray-500">Stock total original: {menu?.stock_total}</p>
                </div>
              </div>

              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-base">⏰ Horarios de Reserva y Recogida</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="font-semibold text-blue-800">Horario de Reservas</Label>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="hora_inicio_reserva" className="text-xs text-gray-600">Inicio</Label>
                          <Input id="hora_inicio_reserva" type="time" value={formData.hora_inicio_reserva || ''} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <Label htmlFor="hora_limite_reserva" className="text-xs text-gray-600">Fin</Label>
                          <Input id="hora_limite_reserva" type="time" value={formData.hora_limite_reserva || ''} onChange={handleInputChange} required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-semibold text-blue-800">Horario de Recogida</Label>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="hora_inicio_recogida" className="text-xs text-gray-600">Inicio</Label>
                          <Input id="hora_inicio_recogida" type="time" value={formData.hora_inicio_recogida || ''} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <Label htmlFor="hora_limite" className="text-xs text-gray-600">Fin</Label>
                          <Input id="hora_limite" type="time" value={formData.hora_limite || ''} onChange={handleInputChange} required />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

               <div className="p-4 border rounded-2xl space-y-4 bg-green-50/30">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="permite_envase_propio" className="flex items-center gap-2 font-semibold"><Recycle className="w-4 h-4 text-green-700"/>¿Permitir envase propio?</Label>
                      <Switch id="permite_envase_propio" checked={formData.permite_envase_propio} onCheckedChange={(c) => handleSwitchChange('permite_envase_propio', c)} />
                  </div>
                  {formData.permite_envase_propio && (
                      <div className="space-y-2"><Label htmlFor="descuento_envase_propio">Descuento por envase propio (€)</Label><Input id="descuento_envase_propio" type="number" step="0.01" value={formData.descuento_envase_propio || 0} onChange={handleInputChange} className="w-32" /></div>
                  )}
              </div>

              <Button type="submit" disabled={isSaving || isGeneratingImage || isUploadingImage} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl py-3 font-semibold">
                {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(EditMenu, ['cafeteria', 'admin']);