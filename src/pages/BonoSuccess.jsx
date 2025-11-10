import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Gift, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function BonoSuccess() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    const processSubscription = async () => {
      try {
        console.log('🎉 BonoSuccess - Verificando suscripción...');
        
        // Esperar un poco para que Stripe procese el webhook
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Obtener usuario actualizado
        const user = await base44.auth.me();
        console.log('Usuario actualizado:', user);

        if (user.tiene_subscripcion_activa) {
          console.log('✅ Suscripción confirmada');
          setSubscriptionData({
            creditos: user.creditos_menu_bono || 10,
            email: user.email
          });
        } else {
          console.log('⏳ Suscripción aún procesando...');
          // Esperar un poco más
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const user2 = await base44.auth.me();
          if (user2.tiene_subscripcion_activa) {
            setSubscriptionData({
              creditos: user2.creditos_menu_bono || 10,
              email: user2.email
            });
          } else {
            setError('La suscripción está procesándose. Puedes cerrar esta ventana y revisar tu perfil en unos minutos.');
          }
        }
      } catch (error) {
        console.error('Error procesando suscripción:', error);
        setError('Error al verificar la suscripción. Por favor, contacta con soporte si no ves tus menús en tu perfil.');
      } finally {
        setIsProcessing(false);
      }
    };

    processSubscription();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando tu suscripción...
            </h2>
            <p className="text-gray-600">
              Espera un momento mientras confirmamos tu pago
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-2xl border-2 border-amber-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Procesando...</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link to={createPageUrl("Profile")}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Ver mi Perfil
                </Button>
              </Link>
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="w-full">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-2xl border-4 border-emerald-400">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-16 h-16 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black mb-2">
            ¡Suscripción Activada! 🎉
          </CardTitle>
          <p className="text-emerald-50 text-lg">
            Ya puedes disfrutar de tus menús mensuales
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Créditos disponibles */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200">
            <div className="text-center">
              <Gift className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm text-emerald-700 font-semibold mb-2">Tus menús de este mes</p>
              <p className="text-5xl font-black text-emerald-600 mb-2">
                {subscriptionData?.creditos || 10}
              </p>
              <p className="text-gray-600">menús disponibles</p>
            </div>
          </div>

          {/* Información de la suscripción */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Suscripción mensual activa</p>
                <p className="text-sm text-blue-700">Se renovará automáticamente cada mes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900">10 menús nuevos cada mes</p>
                <p className="text-sm text-purple-700">Tus créditos se resetean el mismo día cada mes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Sin permanencia</p>
                <p className="text-sm text-amber-700">Cancela cuando quieras desde tu perfil</p>
              </div>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
            <p className="text-sm text-orange-800 text-center">
              ⚠️ <strong>Recuerda:</strong> Los menús no usados se pierden al final del mes. ¡Úsalos todos!
            </p>
          </div>

          {/* Email confirmación */}
          <div className="text-center text-sm text-gray-600">
            📧 Recibirás un email de confirmación en <strong>{subscriptionData?.email}</strong>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-4">
            <Link to={createPageUrl("Menus")} className="w-full">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-6 text-lg font-bold">
                Reservar mi primer menú
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex gap-3">
              <Link to={createPageUrl("Profile")} className="flex-1">
                <Button variant="outline" className="w-full">
                  Ver mi Perfil
                </Button>
              </Link>
              <a 
                href="https://billing.stripe.com/p/login/8wMdSq58Q3SV7Oo288" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  Gestionar Suscripción
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}