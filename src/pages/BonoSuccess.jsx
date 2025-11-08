import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Sparkles, Gift, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BonoSuccess() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifySubscription = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setError('No se encontró información de la sesión');
        setIsLoading(false);
        return;
      }

      try {
        // Esperar un momento para que el webhook procese
        await new Promise(resolve => setTimeout(resolve, 3000));

        const user = await base44.auth.me();
        
        setSubscriptionData({
          creditos: user.creditos_menu_bono || 0,
          tiene_subscripcion: user.tiene_subscripcion_activa || false
        });
      } catch (err) {
        console.error('Error verificando suscripción:', err);
        setError('Error al verificar tu suscripción');
      } finally {
        setIsLoading(false);
      }
    };

    verifySubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Verificando tu suscripción...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-red-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
              <p className="text-gray-600 mb-6">Por favor, contacta con soporte si el problema persiste</p>
              <Link to={createPageUrl("Bonos")}>
                <Button>Volver a Bonos</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">¡Suscripción Activada! 🎉</h1>
          <p className="text-xl text-gray-600">Bienvenido a PlatPal Premium</p>
        </div>

        <Card className="mb-8 shadow-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Tu Suscripción Mensual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gift className="w-12 h-12 text-emerald-600" />
                <div>
                  <p className="text-5xl font-bold text-emerald-700">{subscriptionData?.creditos || 0}</p>
                  <p className="text-gray-600 text-sm">menús disponibles este mes</p>
                </div>
              </div>
            </div>

            <div className="border-t-2 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">Renovación automática cada mes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">10 menús nuevos cada mes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">Ahorro permanente del 10%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700">Cancela cuando quieras desde tu perfil</span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800 text-center">
                💡 <strong>Recuerda:</strong> Los menús no usados se pierden al final de cada mes
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Link to={createPageUrl("Menus")} className="block">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-6 text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Empezar a usar mis menús
            </Button>
          </Link>
          <Link to={createPageUrl("Profile")} className="block">
            <Button variant="outline" className="w-full py-6 text-lg">
              Ver mi perfil
            </Button>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}