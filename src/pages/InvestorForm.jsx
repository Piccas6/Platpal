
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SendEmail } from "@/integrations/Core";
import { ArrowLeft, TrendingUp, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function InvestorForm() {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    empresa: "",
    tipo_inversor: "",
    monto_interes: "",
    como_conocio: "",
    mensaje: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #F59E0B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚀 Nuevo Interés de Inversión - PlatPal</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10B981; margin-top: 0;">Datos del Inversor Potencial</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Información Personal</h3>
              <p><strong>Nombre:</strong> ${formData.nombre_completo}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Teléfono:</strong> ${formData.telefono || 'No proporcionado'}</p>
              <p><strong>Empresa/Organización:</strong> ${formData.empresa || 'No especificada'}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Detalles de Inversión</h3>
              <p><strong>Tipo de Inversor:</strong> ${formData.tipo_inversor}</p>
              <p><strong>Monto de Interés:</strong> ${formData.monto_interes}</p>
              <p><strong>Cómo conoció PlatPal:</strong> ${formData.como_conocio}</p>
            </div>

            ${formData.mensaje ? `
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Mensaje Adicional</h3>
              <p style="font-style: italic;">"${formData.mensaje}"</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #E8F5E8; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #10B981; font-weight: bold;">¡Responde rápidamente! Este inversor está interesado en conocer más sobre PlatPal.</p>
            </div>
          </div>
        </div>
      `;

      await SendEmail({
        to: "contacto@platpal.com",
        subject: `💰 Nuevo Inversor Potencial: ${formData.nombre_completo} (${formData.tipo_inversor})`,
        body: emailBody
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending investor form:", error);
      alert("Hubo un error al enviar el formulario. Por favor, intenta de nuevo o contacta directamente a contacto@platpal.com");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 relative mx-auto mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/63020aa39_22aacda021fc4bed925f03e5d6273ef91.png" 
                alt="PlatPal Logo" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Gracias por tu interés!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Hemos recibido tu información y nos pondremos en contacto contigo en las próximas 24-48 horas 
              para discutir las oportunidades de inversión en PlatPal.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl py-3 font-semibold">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Inversión en PlatPal</h1>
            <p className="text-gray-600 mt-2">Únete a la revolución de la sostenibilidad universitaria</p>
          </div>
        </div>

        <Card className="shadow-xl border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Formulario para Inversores
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Completa este formulario y nuestro equipo se pondrá en contacto contigo para discutir 
              las oportunidades de inversión en nuestra startup.
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                  <Input
                    id="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                    required
                    placeholder="Tu nombre completo"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contacto *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+34 600 000 000"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa/Organización (Opcional)</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    placeholder="Nombre de tu empresa"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo_inversor">Tipo de Inversor *</Label>
                  <Select value={formData.tipo_inversor} onValueChange={(value) => handleInputChange('tipo_inversor', value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="angel">Inversor Ángel</SelectItem>
                      <SelectItem value="vc">Venture Capital</SelectItem>
                      <SelectItem value="corporate">Corporate Venture</SelectItem>
                      <SelectItem value="individual">Inversor Individual</SelectItem>
                      <SelectItem value="family_office">Family Office</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto_interes">Monto de Interés *</Label>
                  <Select value={formData.monto_interes} onValueChange={(value) => handleInputChange('monto_interes', value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Rango de inversión" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10k-50k">€10.000 - €50.000</SelectItem>
                      <SelectItem value="50k-100k">€50.000 - €100.000</SelectItem>
                      <SelectItem value="100k-250k">€100.000 - €250.000</SelectItem>
                      <SelectItem value="250k-500k">€250.000 - €500.000</SelectItem>
                      <SelectItem value="500k+">€500.000+</SelectItem>
                      <SelectItem value="por_discutir">Por discutir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="como_conocio">¿Cómo conociste PlatPal? *</Label>
                <Select value={formData.como_conocio} onValueChange={(value) => handleInputChange('como_conocio', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web_search">Búsqueda en Google</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referencia">Referencia de contacto</SelectItem>
                    <SelectItem value="evento">Evento/Pitch</SelectItem>
                    <SelectItem value="prensa">Prensa/Medios</SelectItem>
                    <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje Adicional (Opcional)</Label>
                <Textarea
                  id="mensaje"
                  value={formData.mensaje}
                  onChange={(e) => handleInputChange('mensaje', e.target.value)}
                  placeholder="Cuéntanos sobre tu interés en PlatPal, experiencia previa en inversiones, o cualquier pregunta específica..."
                  className="h-24 rounded-xl resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.nombre_completo || !formData.email || !formData.tipo_inversor || !formData.monto_interes || !formData.como_conocio}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl py-4 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Solicitud de Inversión
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Al enviar este formulario, aceptas que nos pongamos en contacto contigo para discutir oportunidades de inversión.</p>
                <p className="mt-1">También puedes contactarnos directamente en <strong>contacto@platpal.com</strong></p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
