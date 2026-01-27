import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Check, ChefHat, ArrowLeft, Sparkles, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function VoicePublishMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cafeterias, setCafeterias] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const [formData, setFormData] = useState({
    cafeteria_id: '',
    plato_principal: '',
    plato_secundario: '',
    precio_original: 8.5,
    stock_total: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_cocina: '',
    es_vegetariano: false,
    es_vegano: false,
    sin_gluten: false,
    alergenos: []
  });

  const tiposCocina = ['mediterranea', 'italiana', 'asiatica', 'mexicana', 'vegetariana', 'casera', 'internacional', 'rapida', 'otra'];
  const alergenosComunes = ['gluten', 'lacteos', 'huevo', 'pescado', 'marisco', 'frutos_secos', 'soja', 'sulfitos', 'ninguno'];

  useEffect(() => {
    const loadData = async () => {
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

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          setFormData(prev => ({
            ...prev,
            cafeteria_id: firstCafe.id,
            precio_original: firstCafe.precio_original_default || 8.5
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interimTranscript += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          handleVoiceCommand(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error deteniendo reconocimiento:', error);
        setIsListening(false);
      }
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error iniciando reconocimiento:', error);
        if (error.name === 'InvalidStateError') {
          setIsListening(false);
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('Error en reintento:', e);
            }
          }, 100);
        }
      }
    }
  };

  const handleVoiceCommand = async (text) => {
    setIsProcessing(true);
    try {
      console.log('🎤 Procesando:', text);
      
      // Parsear directamente el texto con regex y lógica simple
      const textLower = text.toLowerCase();
      
      // Extraer platos (buscar patrones como "X con Y", "X y Y")
      const platosMatch = text.match(/^([^,]+?)(?:\s+con\s+|\s+y\s+)([^,]+)/i);
      if (platosMatch) {
        setFormData(prev => ({
          ...prev,
          plato_principal: platosMatch[1].trim(),
          plato_secundario: platosMatch[2].trim().split(',')[0].trim()
        }));
      }
      
      // Extraer stock (buscar números seguidos de "raciones", "unidades", etc)
      const stockMatch = text.match(/(\d+)\s*(raciones?|unidades?|platos?)/i);
      if (stockMatch) {
        setFormData(prev => ({
          ...prev,
          stock_total: stockMatch[1]
        }));
      }
      
      // Extraer precio (buscar números con "euros", "€", etc)
      const precioMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:euros?|€)/i);
      if (precioMatch) {
        setFormData(prev => ({
          ...prev,
          precio_original: parseFloat(precioMatch[1].replace(',', '.'))
        }));
      }
      
      // Detectar propiedades
      if (/sin\s+gluten|celíaco/i.test(textLower)) {
        setFormData(prev => ({ ...prev, sin_gluten: true }));
      }
      if (/vegetariano/i.test(textLower)) {
        setFormData(prev => ({ ...prev, es_vegetariano: true }));
      }
      if (/vegano/i.test(textLower)) {
        setFormData(prev => ({ ...prev, es_vegano: true }));
      }
      
      // Detectar tipo de cocina
      const tiposMatch = tiposCocina.find(tipo => textLower.includes(tipo));
      if (tiposMatch) {
        setFormData(prev => ({ ...prev, tipo_cocina: tiposMatch }));
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error procesando comando de voz:', error);
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plato_principal || !formData.plato_secundario) {
      alert('⚠️ Completa los platos principales');
      return;
    }

    if (!formData.stock_total || parseInt(formData.stock_total) <= 0) {
      alert('⚠️ Indica el stock total');
      return;
    }

    const cafe = cafeterias.find(c => c.id === formData.cafeteria_id);
    if (!cafe) {
      alert('⚠️ Cafetería no encontrada');
      return;
    }

    if (!confirm(`¿Confirmar publicación en ${cafe.nombre}?`)) return;

    setIsPublishing(true);

    try {
      // Generar imagen automáticamente
      const prompt = `Foto profesional de comida: ${formData.plato_principal}. Plato apetitoso, bien iluminado, presentación de restaurante, fondo neutro, alta calidad`;
      const imageResult = await base44.integrations.Core.GenerateImage({ prompt });

      const menuData = {
        plato_principal: formData.plato_principal,
        plato_secundario: formData.plato_secundario,
        precio_original: parseFloat(formData.precio_original),
        precio_descuento: 2.99,
        stock_total: parseInt(formData.stock_total),
        stock_disponible: parseInt(formData.stock_total),
        campus: cafe.campus,
        cafeteria: cafe.nombre,
        fecha: formData.fecha,
        hora_inicio_reserva: '15:30',
        hora_limite_reserva: '16:30',
        hora_inicio_recogida: '16:30',
        hora_limite: '18:00',
        tipo_cocina: formData.tipo_cocina,
        es_vegetariano: formData.es_vegetariano,
        es_vegano: formData.es_vegano,
        sin_gluten: formData.sin_gluten,
        alergenos: formData.alergenos.length > 0 ? formData.alergenos : ['ninguno'],
        imagen_url: imageResult?.url || undefined,
        permite_envase_propio: true,
        descuento_envase_propio: 0.15
      };

      await base44.entities.Menu.create(menuData);

      alert(`✅ Menú publicado en ${cafe.nombre}`);
      navigate(createPageUrl("CafeteriaDashboard"));
    } catch (error) {
      console.error('Error publicando menú:', error);
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
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">🎤 Publicar Menú por Voz</h1>
            <p className="text-gray-600 mt-2">Dicta la información y observa cómo se rellena automáticamente</p>
          </div>
        </div>

        {/* Voice Control Card */}
        <Card className="border-4 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-2xl">
          <CardHeader className="border-b-2 border-emerald-200 bg-emerald-100">
            <CardTitle className="text-2xl">Control de Voz</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              {/* Botón de Micrófono GRANDE */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : isProcessing
                    ? 'bg-gray-400'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-16 h-16 animate-spin text-white" />
                ) : isListening ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </motion.button>

              {/* Estado */}
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {isProcessing ? 'Procesando...' : isListening ? 'Escuchando...' : 'Pulsa para dictar'}
                </p>
                <p className="text-sm text-gray-600">
                  Ejemplo: "Pasta carbonara con ensalada, 20 raciones, 8 euros, sin gluten"
                </p>
              </div>

              {/* Transcripción en tiempo real */}
              <AnimatePresence>
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-lg"
                  >
                    <Label className="text-sm text-gray-600 mb-2 block">Texto reconocido:</Label>
                    <p className="text-xl text-gray-900 font-medium">{transcript}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Formulario Dinámico */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Cafetería */}
          {cafeterias.length > 1 && (
            <Card className="border-2">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">🏪 Cafetería</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Select value={formData.cafeteria_id} onValueChange={(v) => setFormData(prev => ({ ...prev, cafeteria_id: v }))}>
                  <SelectTrigger className="text-lg h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cafeterias.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-lg">
                        {c.nombre} - Campus {c.campus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Platos */}
          <Card className={`border-4 transition-all ${formData.plato_principal ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}>
            <CardHeader className="bg-emerald-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Platos del Menú
                {formData.plato_principal && <Check className="w-6 h-6 text-emerald-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-lg font-semibold">Plato Principal *</Label>
                <Input
                  value={formData.plato_principal}
                  onChange={(e) => setFormData(prev => ({ ...prev, plato_principal: e.target.value }))}
                  placeholder="Ej: Pollo al horno"
                  className="text-xl h-14 mt-2"
                />
              </div>
              <div>
                <Label className="text-lg font-semibold">Acompañamiento *</Label>
                <Input
                  value={formData.plato_secundario}
                  onChange={(e) => setFormData(prev => ({ ...prev, plato_secundario: e.target.value }))}
                  placeholder="Ej: Patatas fritas"
                  className="text-xl h-14 mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock y Precio */}
          <Card className={`border-4 transition-all ${formData.stock_total ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="w-6 h-6" />
                Stock y Precio
                {formData.stock_total && <Check className="w-6 h-6 text-blue-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-semibold">Stock Total *</Label>
                  <Input
                    type="number"
                    value={formData.stock_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_total: e.target.value }))}
                    min="1"
                    placeholder="Ej: 20"
                    className="text-xl h-14 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-lg font-semibold">Precio Original</Label>
                  <Input
                    type="number"
                    value={formData.precio_original}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_original: parseFloat(e.target.value) }))}
                    step="0.5"
                    min="1"
                    className="text-xl h-14 mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Propiedades */}
          <Card className="border-2">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg">🥗 Propiedades</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">Tipo de Cocina</Label>
                <Select value={formData.tipo_cocina} onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_cocina: v }))}>
                  <SelectTrigger className="text-lg h-12 mt-2">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCocina.map(t => (
                      <SelectItem key={t} value={t} className="text-lg">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <Label className="text-base font-semibold">Vegetariano</Label>
                  <Switch
                    checked={formData.es_vegetariano}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, es_vegetariano: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <Label className="text-base font-semibold">Vegano</Label>
                  <Switch
                    checked={formData.es_vegano}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, es_vegano: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <Label className="text-base font-semibold">Sin Gluten</Label>
                  <Switch
                    checked={formData.sin_gluten}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, sin_gluten: v }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Alérgenos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {alergenosComunes.map(a => (
                    <Badge
                      key={a}
                      variant={formData.alergenos.includes(a) ? "default" : "outline"}
                      className="cursor-pointer text-base px-4 py-2"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          alergenos: prev.alergenos.includes(a)
                            ? prev.alergenos.filter(al => al !== a)
                            : [...prev.alergenos, a]
                        }));
                      }}
                    >
                      {formData.alergenos.includes(a) && <Check className="w-4 h-4 mr-1" />}
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón Publicar */}
          <div className="flex gap-4">
            <Link to={createPageUrl("CafeteriaDashboard")} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-16 text-lg font-bold">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isPublishing || !formData.plato_principal || !formData.plato_secundario || !formData.stock_total}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 h-16 text-lg font-bold"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  Publicar Menú
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}