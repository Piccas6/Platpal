import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShoppingCart, TrendingUp, Check, ArrowLeft, Loader2, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Bonos() {
  const navigate = useNavigate();
  const [bonoPacks, setBonoPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [packs, user] = await Promise.all([
        base44.entities.BonoPack.list(),
        base44.auth.me().catch(() => null)
      ]);
      
      const activePacks = packs.filter(p => p.activo);
      setBonoPacks(activePacks);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading bonos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseBono = async (bonoPack) => {
    console.log('🎁 Iniciando compra de bono...');
    
    if (!currentUser) {
      alert('Debes iniciar sesión para suscribirte');
      await base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    // Verificar si ya tiene suscripción activa
    if (currentUser.tiene_subscripcion_activa) {
      alert('Ya tienes una suscripción activa. Puedes gestionarla desde tu perfil.');
      return;
    }

    console.log('✅ Usuario autenticado:', currentUser.email);
    console.log('📦 BonoPack:', bonoPack);

    // FIXED: Usar el stripe_payment_link del BonoPack
    if (bonoPack.stripe_payment_link) {
      console.log('🔗 Redirigiendo a Stripe Payment Link:', bonoPack.stripe_payment_link);
      
      // Crear BonoCompra pendiente primero
      try {
        const bonoCompra = await base44.entities.BonoCompra.create({
          bono_pack_id: bonoPack.id,
          user_email: currentUser.email,
          cantidad_menus: bonoPack.cantidad_menus,
          precio_pagado: bonoPack.precio_mensual,
          subscription_status: 'pending',
          menus_usados_mes_actual: 0
        });
        
        console.log('✅ BonoCompra creado:', bonoCompra.id);
        
        // Redirigir a Stripe Payment Link
        window.location.href = bonoPack.stripe_payment_link;
      } catch (error) {
        console.error('❌ Error creando BonoCompra:', error);
        alert('Error al procesar la compra: ' + error.message);
      }
    } else {
      console.error('❌ No hay stripe_payment_link configurado');
      alert('El plan no tiene configurado el enlace de pago. Contacta con soporte.');
    }
  };

  const calculateSavings = (pack) => {
    const precioNormal = pack.cantidad_menus * pack.precio_unitario_menu;
    return (precioNormal - pack.precio_mensual).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Tomar solo el primer pack activo
  const mainPack = bonoPacks.length > 0 ? bonoPacks[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              🎁 Suscripción de Menús
            </h1>
            <p className="text-gray-600 mt-2">Tu cuota mensual de menús sostenibles</p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {currentUser && currentUser.tiene_subscripcion_activa && (
          <Card className="mb-8 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">✅ Suscripción Activa</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {currentUser.creditos_menu_bono || 0} {currentUser.creditos_menu_bono === 1 ? 'menú disponible' : 'menús disponibles'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Este mes • Se renuevan el próximo mes</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Link to={createPageUrl("Menus")}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 w-full">
                      Usar ahora
                    </Button>
                  </Link>
                  <a 
                    href="https://billing.stripe.com/p/login/8wMdSq58Q3SV7Oo288" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full text-sm">
                      Gestionar suscripción
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ahorra un 10%</h3>
              <p className="text-sm text-gray-600">10 menús al mes por el precio de 9</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mensualidad Fija</h3>
              <p className="text-sm text-gray-600">10 menús nuevos cada mes</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Sin Permanencia</h3>
              <p className="text-sm text-gray-600">Cancela cuando quieras</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Subscription Plan */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Plan de Suscripción</h2>
          
          {!mainPack ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No hay planes de suscripción disponibles en este momento.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-emerald-200 hover:shadow-2xl transition-all relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-amber-500 text-white text-lg px-4 py-2 shadow-lg">
                  🔥 Más Popular
                </Badge>
              </div>

              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white pb-8 pt-6">
                <CardTitle className="text-3xl">{mainPack.nombre}</CardTitle>
                <p className="text-emerald-50 mt-2 text-lg">{mainPack.descripcion}</p>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {/* Price */}
                <div className="text-center space-y-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold text-emerald-600">
                      €{(mainPack.precio_mensual || 0).toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-600">/mes</span>
                  </div>
                  <p className="text-lg text-gray-600">
                    Solo €{((mainPack.precio_mensual || 0) / (mainPack.cantidad_menus || 1)).toFixed(2)} por menú
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Ahorras €{calculateSavings(mainPack)} cada mes
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 pt-6 border-t-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-lg">{mainPack.cantidad_menus} menús cada mes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Renovación automática mensual</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Válido en todas las cafeterías</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-lg">Cancela cuando quieras</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-lg">{mainPack.descuento_porcentaje}% de descuento permanente</span>
                  </div>
                </div>

                {/* Warning about monthly reset */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800 text-center">
                    ⚠️ <strong>Importante:</strong> Los menús no usados se pierden al final de cada mes. ¡Úsalos todos!
                  </p>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchaseBono(mainPack)}
                  disabled={!currentUser || currentUser.tiene_subscripcion_activa || isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-7 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  {currentUser?.tiene_subscripcion_activa ? (
                    'Ya tienes una suscripción'
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6 mr-2" />
                      Suscribirme Ahora
                    </>
                  )}
                </Button>

                {!currentUser && (
                  <p className="text-sm text-center text-gray-500 mt-2">
                    Debes iniciar sesión para suscribirte
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* FAQ Section */}
        <Card className="mt-12 border-2">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Cómo funciona la suscripción?</h4>
              <p className="text-sm text-gray-600">
                Cada mes recibes automáticamente 10 menús en tu cuenta. El pago se realiza automáticamente el mismo día de cada mes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Qué pasa con los menús no usados?</h4>
              <p className="text-sm text-gray-600">
                <strong>Los menús no usados se pierden al final del mes.</strong> Es como una cuota de gimnasio: si no vas, pierdes esas clases. Esto nos ayuda a planificar mejor y evitar desperdicio.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Puedo cancelar cuando quiera?</h4>
              <p className="text-sm text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento desde el portal de Stripe. Seguirás teniendo acceso a tus menús hasta el final del mes pagado.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Cuándo se cobra la suscripción?</h4>
              <p className="text-sm text-gray-600">
                El primer cobro se hace al suscribirte. Después, se cobrará automáticamente cada mes en la misma fecha. Tus 10 menús se renovarán el mismo día.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Puedo pausar mi suscripción?</h4>
              <p className="text-sm text-gray-600">
                Por ahora solo puedes cancelar la suscripción. Si tienes necesidades especiales, contacta con soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}