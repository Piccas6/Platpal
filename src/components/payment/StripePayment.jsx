import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowLeft, Loader2, AlertCircle, Euro, MapPin, UtensilsCrossed, Recycle } from "lucide-react";

export default function StripePayment({ reserva, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        reserva_id: reserva.id || '',
        menus_detalle: String(reserva.menus_detalle || ''),
        cafeteria: String(reserva.cafeteria || ''),
        campus: String(reserva.campus || ''),
        precio_total: Number(reserva.precio_total || 0),
        codigo_recogida: String(reserva.codigo_recogida || ''),
        envase_propio: Boolean(reserva.envase_propio)
      });

      if (!data.checkout_url) {
        throw new Error('No se recibió URL de pago');
      }

      window.location.href = data.checkout_url;

    } catch (error) {
      console.error('Error al crear checkout:', error);
      setError(error.response?.data?.error || error.message || 'Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-amber-50 border-b-2">
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          Proceder al Pago
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            Resumen de tu Pedido
          </h3>
          
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{String(reserva.cafeteria || 'Cafetería')}</p>
                <p className="text-sm text-gray-600">{String(reserva.campus || 'Campus')}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-gray-900 font-medium">{String(reserva.menus_detalle || '')}</p>
              {reserva.envase_propio && (
                <div className="flex items-center gap-2 mt-2">
                  <Recycle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">
                    Con envase propio • Descuento aplicado: €{Number(reserva.descuento_aplicado || 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Total a pagar:</span>
              <div className="flex items-center gap-1">
                <Euro className="w-6 h-6 text-emerald-600" />
                <span className="text-3xl font-bold text-emerald-600">
                  {Number(reserva.precio_total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
          <p className="text-sm text-amber-800 font-medium mb-2">Tu código de recogida:</p>
          <p className="text-2xl font-bold text-amber-900 tracking-widest text-center bg-white rounded-lg py-3">
            {String(reserva.codigo_recogida || '')}
          </p>
          <p className="text-xs text-amber-700 mt-2 text-center">
            Guárdalo para recoger tu menú
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-900">Pago seguro con Stripe</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Serás redirigido a Stripe para completar el pago de forma segura. 
                No almacenamos tu información de tarjeta. Una vez completado el pago, 
                volverás automáticamente para ver tu confirmación.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error al procesar el pago</p>
                <p className="text-sm text-red-700 mt-1">{String(error)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-2xl py-6 font-semibold border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirigiendo a Stripe...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar €{Number(reserva.precio_total || 0).toFixed(2)}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 pt-4">
          Al continuar, aceptas que tu reserva es final y el pago no es reembolsable una vez completado.
        </p>
      </CardContent>
    </Card>
  );
}