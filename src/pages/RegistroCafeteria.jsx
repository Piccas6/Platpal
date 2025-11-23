import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Loader2, CheckCircle } from "lucide-react";

export default function RegistroCafeteria() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_legal: '',
    nombre_comercial: '',
    cif_nif: '',
    direccion_fiscal: '',
    telefono: '',
    email_contacto: '',
    representante: '',
    dni_representante: '',
    acepta_politica_privacidad: false,
    acepta_tratamiento_datos: false,
    acepta_comisiones: false
  });

  const validateCIF = (cif) => {
    const cifRegex = /^[A-Z][0-9]{8}$/;
    return cifRegex.test(cif);
  };

  const validateNIF = (nif) => {
    const nifRegex = /^[0-9]{8}[A-Z]$/;
    return nifRegex.test(nif);
  };

  const validateDNI = (dni) => {
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    return dniRegex.test(dni);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!validateCIF(formData.cif_nif) && !validateNIF(formData.cif_nif)) {
      alert('CIF/NIF inválido. Formato: A12345678 o 12345678A');
      return;
    }

    if (!validateDNI(formData.dni_representante)) {
      alert('DNI del representante inválido. Formato: 12345678A');
      return;
    }

    if (!validatePhone(formData.telefono)) {
      alert('Teléfono inválido. Formato: +34600000000');
      return;
    }

    if (!formData.acepta_politica_privacidad || !formData.acepta_tratamiento_datos || !formData.acepta_comisiones) {
      alert('Debes aceptar todos los términos para continuar');
      return;
    }

    setIsLoading(true);
    try {
      // Crear cafetería con estado registro_iniciado
      const nuevaCafeteria = await base44.entities.Cafeteria.create({
        nombre: formData.nombre_comercial,
        slug: formData.nombre_comercial.toLowerCase().replace(/\s+/g, '-'),
        campus: 'jerez', // Default
        estado_onboarding: 'registro_iniciado',
        activa: false,
        aprobada: false,
        nombre_legal: formData.nombre_legal,
        cif_nif: formData.cif_nif,
        direccion_fiscal: formData.direccion_fiscal,
        telefono_contacto: formData.telefono,
        email_contacto: formData.email_contacto,
        representante_legal: formData.representante,
        dni_representante: formData.dni_representante,
        acepta_politica_privacidad: formData.acepta_politica_privacidad,
        acepta_tratamiento_datos: formData.acepta_tratamiento_datos,
        acepta_comisiones: formData.acepta_comisiones,
        fecha_solicitud: new Date().toISOString()
      });

      // Crear audit log
      await base44.entities.CafeteriaAudit.create({
        cafeteria_id: nuevaCafeteria.id,
        evento: 'registro_iniciado',
        meta: {
          nombre_comercial: formData.nombre_comercial,
          email: formData.email_contacto,
          ip_address: window.location.hostname
        },
        actor: 'system',
        timestamp: new Date().toISOString(),
        ip_address: window.location.hostname
      });

      // Enviar email de verificación
      await base44.functions.invoke('wf_registro_cafeteria_iniciar', {
        cafeteria_id: nuevaCafeteria.id,
        email: formData.email_contacto,
        representante: formData.representante
      });

      navigate(createPageUrl('UploadDocumentsCafeteria'), {
        state: { cafeteria_id: nuevaCafeteria.id }
      });

    } catch (error) {
      console.error('Error al registrar cafetería:', error);
      alert('Error al registrar. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Registro de Cafetería</h1>
          <p className="text-gray-600">Completa el formulario para iniciar tu onboarding en PlatPal</p>
        </div>

        <Card className="border-2 border-emerald-100 shadow-xl">
          <CardHeader>
            <CardTitle>Datos de la Cafetería</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Legal */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Información Legal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre Legal *</Label>
                    <Input
                      required
                      value={formData.nombre_legal}
                      onChange={(e) => setFormData({...formData, nombre_legal: e.target.value})}
                      placeholder="Cafetería Los Pinos S.L."
                    />
                  </div>
                  <div>
                    <Label>Nombre Comercial *</Label>
                    <Input
                      required
                      value={formData.nombre_comercial}
                      onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                      placeholder="Los Pinos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>CIF/NIF * (Formato: A12345678 o 12345678A)</Label>
                    <Input
                      required
                      value={formData.cif_nif}
                      onChange={(e) => setFormData({...formData, cif_nif: e.target.value.toUpperCase()})}
                      placeholder="A12345678"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <Label>Teléfono * (Formato: +34600000000)</Label>
                    <Input
                      required
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="+34600000000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Dirección Fiscal *</Label>
                  <Input
                    required
                    value={formData.direccion_fiscal}
                    onChange={(e) => setFormData({...formData, direccion_fiscal: e.target.value})}
                    placeholder="Calle Principal 123, 11401 Jerez de la Frontera"
                  />
                </div>

                <div>
                  <Label>Email de Contacto *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email_contacto}
                    onChange={(e) => setFormData({...formData, email_contacto: e.target.value})}
                    placeholder="contacto@cafeteria.com"
                  />
                </div>
              </div>

              {/* Representante Legal */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Representante Legal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Representante *</Label>
                    <Input
                      required
                      value={formData.representante}
                      onChange={(e) => setFormData({...formData, representante: e.target.value})}
                      placeholder="Juan Pérez García"
                    />
                  </div>
                  <div>
                    <Label>DNI del Representante * (Formato: 12345678A)</Label>
                    <Input
                      required
                      value={formData.dni_representante}
                      onChange={(e) => setFormData({...formData, dni_representante: e.target.value.toUpperCase()})}
                      placeholder="12345678A"
                      maxLength={9}
                    />
                  </div>
                </div>
              </div>

              {/* Aceptaciones */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900">Términos y Condiciones</h3>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacidad"
                    checked={formData.acepta_politica_privacidad}
                    onCheckedChange={(checked) => setFormData({...formData, acepta_politica_privacidad: checked})}
                  />
                  <label htmlFor="privacidad" className="text-sm text-gray-700 cursor-pointer">
                    Acepto la <a href="#" className="text-emerald-600 underline">Política de Privacidad</a>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="datos"
                    checked={formData.acepta_tratamiento_datos}
                    onCheckedChange={(checked) => setFormData({...formData, acepta_tratamiento_datos: checked})}
                  />
                  <label htmlFor="datos" className="text-sm text-gray-700 cursor-pointer">
                    Acepto el tratamiento de mis datos personales conforme al RGPD
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="comisiones"
                    checked={formData.acepta_comisiones}
                    onCheckedChange={(checked) => setFormData({...formData, acepta_comisiones: checked})}
                  />
                  <label htmlFor="comisiones" className="text-sm text-gray-700 cursor-pointer">
                    Acepto la estructura de comisiones de PlatPal (33% por venta)
                  </label>
                </div>
              </div>

              {/* Botón Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Iniciar Onboarding'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}