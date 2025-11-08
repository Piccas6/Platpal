
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChefHat, CheckCircle2, Building2, Clock, Euro, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Función para generar ID temporal único
const generateTemporalId = (nombre, campus) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const cleanName = nombre.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
  return `tmp-${cleanName}-${campus}-${timestamp}${random}`;
};

export default function CafeteriaOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddingAnother, setIsAddingAnother] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    campus: "",
    contacto: "",
    descripcion: "",
    ubicacion_exacta: "",
    horario_apertura: "08:00",
    hora_fin_reserva: "16:00",
    hora_fin_recogida: "18:00",
    precio_original_default: 8.50
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        
        if (user.email && !formData.contacto) {
          setFormData(prev => ({ ...prev, contacto: user.email }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1Submit = () => {
    if (!formData.nombre || !formData.campus || !formData.contacto) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = () => {
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const user = currentUser || await base44.auth.me();
      
      // Generar slug único
      const slug = formData.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Generar ID temporal único
      const cafeteriaIdTemporal = generateTemporalId(formData.nombre, formData.campus);

      console.log('🆔 ID Temporal generado:', cafeteriaIdTemporal);

      // Crear la cafetería con ID temporal
      const cafeteriaData = {
        nombre: formData.nombre,
        slug: `${slug}-${formData.campus}-${Date.now()}`,
        cafeteria_id_temporal: cafeteriaIdTemporal, // ID temporal
        campus: formData.campus,
        contacto: formData.contacto,
        descripcion: formData.descripcion,
        ubicacion_exacta: formData.ubicacion_exacta,
        horario_apertura: formData.horario_apertura,
        hora_fin_reserva: formData.hora_fin_reserva,
        hora_fin_recogida: formData.hora_fin_recogida,
        precio_original_default: parseFloat(formData.precio_original_default),
        owner_user_id: user.id,
        aprobada: false,
        estado_onboarding: "en_revision",
        activa: false,
        puede_publicar_menus: false, // No puede publicar hasta aprobación
        fecha_solicitud: new Date().toISOString()
      };

      console.log('📝 Creando cafetería con datos:', cafeteriaData);
      const nuevaCafeteria = await base44.entities.Cafeteria.create(cafeteriaData);
      
      console.log('✅ Cafetería creada:', nuevaCafeteria.id);
      console.log('🆔 ID Temporal:', nuevaCafeteria.cafeteria_id_temporal);

      // Actualizar el usuario para añadir esta cafetería a su lista
      const cafeteriasActuales = user.cafeterias_asignadas || [];
      
      await base44.auth.updateMe({
        app_role: 'cafeteria',
        campus: formData.campus,
        cafeterias_asignadas: [...cafeteriasActuales, nuevaCafeteria.id],
        onboarding_completado: true
      });

      console.log('✅ Usuario actualizado con nueva cafetería');

      // Redirigir a página de confirmación
      setCurrentStep(4);

    } catch (error) {
      console.error("❌ Error durante onboarding:", error);
      
      let errorMessage = "Error al registrar la cafetería.\n\n";
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Por favor, intenta de nuevo.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      nombre: "",
      campus: "",
      contacto: currentUser?.email || "",
      descripcion: "",
      ubicacion_exacta: "",
      horario_apertura: "08:00",
      hora_fin_reserva: "16:00",
      hora_fin_recogida: "18:00",
      precio_original_default: 8.50
    });
    setCurrentStep(1);
    setIsAddingAnother(true);
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {isAddingAnother ? '¡Añade otro establecimiento!' : '¡Bienvenido a PlatPal!'}
            </CardTitle>
            <p className="text-gray-600 mt-2">Paso 1 de 3: Información Básica</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Badge className="bg-emerald-500">1</Badge>
              <Badge variant="outline">2</Badge>
              <Badge variant="outline">3</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de tu Cafetería / Establecimiento *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Cafetería Central"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Este es el nombre que verán los estudiantes</p>
              </div>

              <div>
                <Label htmlFor="campus">Campus *</Label>
                <Select value={formData.campus} onValueChange={(value) => handleChange('campus', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona tu campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jerez">Campus Jerez</SelectItem>
                    <SelectItem value="puerto_real">Campus Puerto Real</SelectItem>
                    <SelectItem value="cadiz">Campus Cádiz</SelectItem>
                    <SelectItem value="algeciras">Campus Algeciras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contacto">Teléfono de Contacto *</Label>
                <Input
                  id="contacto"
                  type="tel"
                  value={formData.contacto}
                  onChange={(e) => handleChange('contacto', e.target.value)}
                  placeholder="Ej: 956 123 456"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación Exacta en el Campus</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion_exacta}
                  onChange={(e) => handleChange('ubicacion_exacta', e.target.value)}
                  placeholder="Ej: Edificio B, Planta Baja"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción Breve</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Cuéntanos sobre tu cafetería..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={handleStep1Submit}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 py-6 text-lg"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Configuración de Horarios</CardTitle>
            <p className="text-gray-600 mt-2">Paso 2 de 3: Define cómo funcionará tu servicio</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Badge variant="outline" className="bg-emerald-100">✓ 1</Badge>
              <Badge className="bg-blue-500">2</Badge>
              <Badge variant="outline">3</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Consejo:</strong> Los horarios pueden modificarse más adelante desde tu panel de control.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario_apertura">Hora de Apertura</Label>
                <Input
                  id="horario_apertura"
                  type="time"
                  value={formData.horario_apertura}
                  onChange={(e) => handleChange('horario_apertura', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="hora_fin_reserva">Límite para Reservar</Label>
                <Input
                  id="hora_fin_reserva"
                  type="time"
                  value={formData.hora_fin_reserva}
                  onChange={(e) => handleChange('hora_fin_reserva', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Hasta qué hora pueden reservar los estudiantes</p>
              </div>

              <div>
                <Label htmlFor="hora_fin_recogida">Límite para Recoger</Label>
                <Input
                  id="hora_fin_recogida"
                  type="time"
                  value={formData.hora_fin_recogida}
                  onChange={(e) => handleChange('hora_fin_recogida', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Hasta qué hora pueden recoger los menús</p>
              </div>

              <div>
                <Label htmlFor="precio_original">Precio Original del Menú</Label>
                <div className="relative mt-1">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="precio_original"
                    type="number"
                    step="0.01"
                    value={formData.precio_original_default}
                    onChange={(e) => handleChange('precio_original_default', e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio habitual (sin descuento PlatPal)</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-900">
                ✨ <strong>Precio PlatPal:</strong> Los estudiantes siempre pagan €2.99 por menú. Tú recibes este importe por cada venta.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1 py-6"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Volver
              </Button>
              <Button 
                onClick={handleStep2Submit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 py-6"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Resumen de tu Cafetería</CardTitle>
            <p className="text-gray-600 mt-2">Paso 3 de 3: Revisa y confirma</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Badge variant="outline" className="bg-emerald-100">✓ 1</Badge>
              <Badge variant="outline" className="bg-blue-100">✓ 2</Badge>
              <Badge className="bg-purple-500">3</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">📋 Datos Básicos</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Nombre:</p>
                    <p className="font-medium">{formData.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Campus:</p>
                    <p className="font-medium capitalize">{formData.campus.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contacto:</p>
                    <p className="font-medium">{formData.contacto}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ubicación:</p>
                    <p className="font-medium">{formData.ubicacion_exacta || 'No especificada'}</p>
                  </div>
                </div>
                {formData.descripcion && (
                  <div>
                    <p className="text-gray-600 text-sm">Descripción:</p>
                    <p className="text-sm">{formData.descripcion}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">⏰ Configuración Operativa</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Apertura:</p>
                    <p className="font-medium">{formData.horario_apertura}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Límite Reservas:</p>
                    <p className="font-medium">{formData.hora_fin_reserva}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Límite Recogida:</p>
                    <p className="font-medium">{formData.hora_fin_recogida}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Precio Original:</p>
                    <p className="font-medium">€{parseFloat(formData.precio_original_default).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-900 font-medium mb-2">
                ⚠️ Proceso de Aprobación
              </p>
              <p className="text-sm text-amber-800">
                Tu cafetería será revisada por nuestro equipo antes de aparecer en la plataforma. 
                Te notificaremos por email cuando esté aprobada. Normalmente tarda 24-48 horas.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="flex-1 py-6"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Volver
              </Button>
              <Button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 py-6"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 w-5 h-5" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl">¡Solicitud Enviada!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Gracias por unirte a PlatPal, <strong>{formData.nombre}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left space-y-3">
              <h3 className="font-semibold text-blue-900 text-lg">📧 ¿Qué sigue ahora?</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Tu cafetería tiene un ID temporal y puedes acceder a tu panel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Nuestro equipo revisará tu solicitud en 24-48 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Recibirás un email cuando tu cafetería sea aprobada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Entonces podrás publicar menús y recibir pedidos</span>
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-900">
                ⚠️ <strong>Importante:</strong> Puedes explorar tu panel pero NO podrás publicar menús hasta que seamos aprobados.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddAnother}
                variant="outline"
                className="w-full py-6 text-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Plus className="mr-2 w-5 h-5" />
                Añadir otro establecimiento
              </Button>
              
              <Button 
                onClick={() => navigate(createPageUrl("CafeteriaDashboard"))}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 py-6 text-lg"
              >
                Ir a Mi Panel Temporal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
