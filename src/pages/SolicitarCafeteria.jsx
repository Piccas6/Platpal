import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChefHat, Send, ArrowLeft, CheckCircle2, Mail, Phone, Building2, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SolicitarCafeteria() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    nombre_cafeteria: "",
    nombre_contacto: "",
    email: "",
    telefono: "",
    campus: "",
    ubicacion: "",
    mensaje: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre_cafeteria || !formData.nombre_contacto || !formData.email || !formData.telefono || !formData.campus) {
      alert("Por favor, completa todos los campos obligatorios (*)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir email para el admin
      const emailBody = `
📩 NUEVA SOLICITUD DE CAFETERÍA - PlatPal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DATOS DE LA CAFETERÍA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏪 Nombre: ${formData.nombre_cafeteria}
📍 Campus: ${formData.campus.toUpperCase()}
${formData.ubicacion ? `📍 Ubicación exacta: ${formData.ubicacion}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 DATOS DE CONTACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: ${formData.nombre_contacto}
📧 Email: ${formData.email}
📞 Teléfono: ${formData.telefono}

${formData.mensaje ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 MENSAJE ADICIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formData.mensaje}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Crear usuario en Base44:
   • Email: ${formData.email}
   • Generar contraseña temporal
   • Rol: cafeteria

2. Crear cafetería en la plataforma:
   • Nombre: ${formData.nombre_cafeteria}
   • Campus: ${formData.campus}
   • Asignar al usuario creado

3. Aprobar cafetería para que pueda publicar menús

4. Enviar credenciales al contacto: ${formData.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha de solicitud: ${new Date().toLocaleString('es-ES')}
      `.trim();

      console.log('📤 Enviando solicitud al admin...');

      // Enviar email al admin (ajusta este email al tuyo)
      await base44.integrations.Core.SendEmail({
        to: "admin@platpal.com", // ⚠️ CAMBIAR POR TU EMAIL REAL
        subject: `🆕 Nueva Solicitud de Cafetería: ${formData.nombre_cafeteria}`,
        body: emailBody
      });

      console.log('✅ Solicitud enviada correctamente');

      // Opcional: Guardar en una entidad para tracking (si quieres)
      // await base44.entities.SolicitudCafeteria.create(formData);

      setSubmitted(true);

    } catch (error) {
      console.error("❌ Error enviando solicitud:", error);
      alert("Error al enviar la solicitud. Por favor, intenta de nuevo o contacta directamente por email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pantalla de confirmación
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">¡Solicitud Enviada!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Gracias por tu interés, <strong>{formData.nombre_contacto}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left space-y-3">
              <h3 className="font-semibold text-blue-900 text-lg">📧 ¿Qué sigue ahora?</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Nuestro equipo revisará tu solicitud</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Te contactaremos en las próximas 24-48 horas por email o teléfono</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Te crearemos una cuenta y te enviaremos las credenciales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>¡Podrás empezar a publicar menús y recibir pedidos!</span>
                </li>
              </ol>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-900">
                📧 <strong>Email de confirmación:</strong> Te hemos enviado un email a <strong>{formData.email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Si tienes preguntas, contáctanos en:
              </p>
              <p className="text-sm font-medium text-gray-900">
                📧 contacto@platpal.com | 📞 +34 956 XXX XXX
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => navigate(createPageUrl("Home"))}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 py-6 text-lg"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              ¡Únete a PlatPal!
            </h1>
            <p className="text-lg text-gray-600">
              Solicita dar de alta tu cafetería en la plataforma
            </p>
          </div>
        </div>

        {/* Info Box */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 ¿Cómo funciona?</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Badge className="bg-blue-600 text-white">1</Badge>
                <span>Completa este formulario con los datos de tu cafetería</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-blue-600 text-white">2</Badge>
                <span>Nuestro equipo revisará tu solicitud (24-48h)</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-blue-600 text-white">3</Badge>
                <span>Te crearemos una cuenta y te enviaremos las credenciales</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-blue-600 text-white">4</Badge>
                <span>¡Empieza a publicar menús y recibir pedidos!</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card className="shadow-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">Datos de la Cafetería</CardTitle>
            <p className="text-sm text-gray-600">Los campos marcados con * son obligatorios</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Datos de la cafetería */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Información del Establecimiento
                </h3>

                <div>
                  <Label htmlFor="nombre_cafeteria">Nombre de la Cafetería / Establecimiento *</Label>
                  <Input
                    id="nombre_cafeteria"
                    value={formData.nombre_cafeteria}
                    onChange={(e) => handleChange('nombre_cafeteria', e.target.value)}
                    placeholder="Ej: Cafetería Central"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="campus">Campus *</Label>
                  <Select value={formData.campus} onValueChange={(value) => handleChange('campus', value)} required>
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
                  <Label htmlFor="ubicacion">Ubicación Exacta en el Campus</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                    placeholder="Ej: Edificio B, Planta Baja"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ayuda a los estudiantes a encontrarte fácilmente</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Datos de Contacto
                </h3>

                <div>
                  <Label htmlFor="nombre_contacto">Nombre de la Persona de Contacto *</Label>
                  <Input
                    id="nombre_contacto"
                    value={formData.nombre_contacto}
                    onChange={(e) => handleChange('nombre_contacto', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email de Contacto *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="ejemplo@email.com"
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Te enviaremos las credenciales de acceso a este email</p>
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono de Contacto *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="Ej: 956 123 456"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="mensaje">Mensaje Adicional (Opcional)</Label>
                <Textarea
                  id="mensaje"
                  value={formData.mensaje}
                  onChange={(e) => handleChange('mensaje', e.target.value)}
                  placeholder="Cuéntanos sobre tu cafetería, horarios, tipo de comida, etc."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-900">
                  ⚠️ <strong>Importante:</strong> Una vez aprobada tu solicitud, te crearemos una cuenta y te enviaremos las credenciales por email para que puedas acceder a tu panel de control.
                </p>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 py-6 text-lg font-bold shadow-xl hover:shadow-2xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              ¿Tienes dudas? Contáctanos directamente
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="mailto:contacto@platpal.com" className="text-emerald-600 hover:underline font-medium">
                📧 contacto@platpal.com
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">📞 +34 956 XXX XXX</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}