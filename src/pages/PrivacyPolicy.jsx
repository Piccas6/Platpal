import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Política de Privacidad
            </h1>
            <p className="text-gray-600 mt-2">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
              alt="PlatPal Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Introducción */}
        <Card className="mb-6 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-2">
                  Tu privacidad es importante para nosotros
                </h2>
                <p className="text-emerald-800">
                  En PlatPal nos comprometemos a proteger tu información personal y a ser transparentes 
                  sobre cómo recopilamos, usamos y compartimos tus datos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secciones */}
        <div className="space-y-6">
          {/* 1. Información que recopilamos */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                1. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información de Cuenta</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Campus universitario</li>
                  <li>Información de autenticación (a través de Google OAuth)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información de Uso</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Historial de reservas de menús</li>
                  <li>Preferencias dietéticas y cafeterías favoritas</li>
                  <li>Interacciones con la plataforma</li>
                  <li>Logros y estadísticas de impacto sostenible</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información de Pago</h3>
                <p className="text-gray-700">
                  Los pagos se procesan de forma segura a través de Stripe. No almacenamos información 
                  completa de tarjetas de crédito en nuestros servidores.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cómo usamos tu información */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                2. Cómo Usamos tu Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">Utilizamos tu información personal para:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li><strong>Gestionar tu cuenta:</strong> Crear y mantener tu perfil de usuario</li>
                <li><strong>Procesar reservas:</strong> Facilitar la reserva y recogida de menús</li>
                <li><strong>Pagos:</strong> Procesar transacciones de forma segura</li>
                <li><strong>Personalización:</strong> Ofrecerte recomendaciones basadas en tus preferencias</li>
                <li><strong>Comunicación:</strong> Enviarte confirmaciones, recordatorios y actualizaciones importantes</li>
                <li><strong>Mejora del servicio:</strong> Analizar el uso de la plataforma para mejorarla</li>
                <li><strong>Impacto sostenible:</strong> Calcular y mostrar tu contribución al medio ambiente</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Compartir información */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                3. Compartir Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">Compartimos tu información únicamente con:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li><strong>Cafeterías del campus:</strong> Solo la información necesaria para preparar y entregar tu pedido (nombre y código de recogida)</li>
                <li><strong>Procesadores de pago (Stripe):</strong> Para completar transacciones de forma segura</li>
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (hosting, análisis, email)</li>
                <li><strong>Autoridades legales:</strong> Si es requerido por ley</li>
              </ul>
              <p className="text-gray-700 font-semibold mt-4">
                ❌ Nunca vendemos tu información personal a terceros
              </p>
            </CardContent>
          </Card>

          {/* 4. Seguridad */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                4. Seguridad de los Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Autenticación segura mediante Google OAuth</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Auditorías de seguridad regulares</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Tus derechos */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                5. Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">Tienes derecho a:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li><strong>Acceder:</strong> Solicitar una copia de tu información personal</li>
                <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminar:</strong> Solicitar la eliminación de tu cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en formato legible</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                <li><strong>Limitar:</strong> Solicitar la limitación del uso de tus datos</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Para ejercer estos derechos, contáctanos en: <strong>privacidad@platpal.com</strong>
              </p>
            </CardContent>
          </Card>

          {/* 6. Cookies */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
                6. Cookies y Tecnologías Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias (idioma, campus seleccionado)</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Mejorar la experiencia de usuario</li>
              </ul>
              <p className="text-gray-700">
                Puedes gestionar las cookies desde la configuración de tu navegador.
              </p>
            </CardContent>
          </Card>

          {/* 7. Menores de edad */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-pink-600" />
                </div>
                7. Usuarios Menores de Edad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                PlatPal está diseñado para estudiantes universitarios mayores de 18 años. 
                No recopilamos intencionalmente información de menores de edad sin el consentimiento 
                de sus padres o tutores legales.
              </p>
            </CardContent>
          </Card>

          {/* 8. Contacto */}
          <Card className="shadow-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                8. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información:
              </p>
              <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
                <p className="text-gray-700"><strong>Email:</strong> privacidad@platpal.com</p>
                <p className="text-gray-700"><strong>Contacto general:</strong> contacto@platpal.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex gap-4">
          <Link to={createPageUrl("Home")} className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl py-3 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          <Link to={createPageUrl("TermsOfService")} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl py-3 font-semibold">
              Ver Condiciones de Servicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}