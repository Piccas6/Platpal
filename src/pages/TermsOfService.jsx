import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle, Scale, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-blue-200 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Condiciones de Servicio
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
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Bienvenido a PlatPal
                </h2>
                <p className="text-blue-800">
                  Al usar PlatPal, aceptas estas condiciones de servicio. Por favor, léelas detenidamente 
                  antes de utilizar nuestra plataforma.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secciones */}
        <div className="space-y-6">
          {/* 1. Aceptación de términos */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                1. Aceptación de Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                Al acceder y utilizar PlatPal, confirmas que:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Tienes al menos 18 años de edad</li>
                <li>Eres estudiante o personal de un campus universitario participante, o una persona que pasa cerca de la uni</li>
                <li>Aceptas cumplir con estos términos y condiciones</li>
                <li>Proporcionarás información veraz y actualizada</li>
              </ul>
            </CardContent>
          </Card>

          {/* 2. Descripción del servicio */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                2. Descripción del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                PlatPal es una plataforma que conecta estudiantes universitarios con cafeterías del campus 
                para rescatar menús excedentes a precios reducidos, contribuyendo a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Reducir el desperdicio alimentario</li>
                <li>Ofrecer comidas de calidad a precios accesibles</li>
                <li>Promover la sostenibilidad en el campus</li>
                <li>Apoyar iniciativas benéficas locales</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Cuenta de usuario */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                3. Cuenta de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                <strong>Responsabilidades del usuario:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Mantener la seguridad de tu cuenta</li>
                <li>No compartir tus credenciales de acceso</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Actualizar tu información cuando sea necesario</li>
                <li>Ser responsable de todas las actividades en tu cuenta</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>Cancelación de cuenta:</strong> Puedes cancelar tu cuenta en cualquier momento 
                contactando a contacto@platpal.com. Las reservas activas deberán cumplirse antes de la cancelación.
              </p>
            </CardContent>
          </Card>

          {/* 4. Reservas y pagos */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                4. Reservas y Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Proceso de Reserva:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Las reservas están sujetas a disponibilidad</li>
                  <li>Debes completar el pago para confirmar tu reserva</li>
                  <li>Recibirás un código de recogida único</li>
                  <li>Los menús deben recogerse en el horario indicado</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Política de Pagos:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Los pagos se procesan de forma segura a través de Stripe</li>
                  <li>Los precios incluyen todos los impuestos aplicables</li>
                  <li>Una vez confirmado el pago, la reserva es vinculante</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Política de Cancelación:</h3>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 font-semibold">
                    ⚠️ Las reservas NO pueden cancelarse una vez confirmadas
                  </p>
                  <p className="text-red-700 text-sm mt-2">
                    Esto se debe a que apartamos el menú específicamente para ti. 
                    Por favor, reserva solo lo que vayas a recoger.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Recogida de pedidos */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                5. Recogida de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                <strong>Normas de recogida:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Presenta tu código de recogida en la cafetería</li>
                <li>Recoge tu pedido dentro del horario establecido</li>
                <li>Los menús son exclusivamente para llevar</li>
                <li>Trae tu propio envase si deseas el descuento adicional</li>
                <li>No se pueden recoger pedidos fuera del horario límite</li>
              </ul>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-amber-800">
                  <strong>⏰ Importante:</strong> Si no recoges tu pedido en el horario establecido, 
                  perderás el derecho al menú sin posibilidad de reembolso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Conducta del usuario */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                6. Conducta Prohibida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                Está prohibido:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Revender o transferir reservas a terceros</li>
                <li>Crear múltiples cuentas para evadir restricciones</li>
                <li>Proporcionar información falsa o engañosa</li>
                <li>Abusar del servicio o realizar reservas fraudulentas</li>
                <li>Interferir con el funcionamiento normal de la plataforma</li>
                <li>Violar cualquier ley o regulación aplicable</li>
              </ul>
              <p className="text-red-700 font-semibold mt-4">
                El incumplimiento puede resultar en la suspensión o cancelación permanente de tu cuenta.
              </p>
            </CardContent>
          </Card>

          {/* 7. Garantías y limitaciones */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                </div>
                7. Garantías y Limitaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                <strong>Calidad de los menús:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Los menús están en buen estado y son seguros para consumir</li>
                <li>La disponibilidad y variedad dependen de cada cafetería</li>
                <li>No garantizamos la disponibilidad continua de menús específicos</li>
              </ul>
              
              <p className="text-gray-700 mt-4">
                <strong>Limitación de responsabilidad:</strong>
              </p>
              <p className="text-gray-700">
                PlatPal actúa como intermediario entre estudiantes y cafeterías. No somos responsables por:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Alergias alimentarias o intolerancias (verifica los ingredientes antes de reservar)</li>
                <li>Cambios de último momento en la disponibilidad</li>
                <li>Problemas con la calidad del menú preparado por la cafetería</li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Propiedad intelectual */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-pink-600" />
                </div>
                8. Propiedad Intelectual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Todos los derechos de propiedad intelectual sobre PlatPal (marca, logo, diseño, contenido) 
                pertenecen a PlatPal o sus licenciantes. No puedes usar, copiar o distribuir ningún 
                contenido sin autorización expresa.
              </p>
            </CardContent>
          </Card>

          {/* 9. Modificaciones */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                9. Modificaciones del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Nos reservamos el derecho de:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>Modificar o descontinuar el servicio en cualquier momento</li>
                <li>Actualizar estos términos (te notificaremos de cambios importantes)</li>
                <li>Cambiar precios con previo aviso</li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Ley aplicable */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-gray-600" />
                </div>
                10. Ley Aplicable y Jurisdicción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta 
                en los tribunales de Cádiz, España.
              </p>
            </CardContent>
          </Card>

          {/* 11. Contacto */}
          <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                11. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Para preguntas sobre estos términos de servicio:
              </p>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <p className="text-gray-700"><strong>Email:</strong> legal@platpal.com</p>
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
          <Link to={createPageUrl("PrivacyPolicy")} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-3 font-semibold">
              Ver Política de Privacidad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}