import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Copy, ArrowRight, Sparkles, MapPin, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccess({ reserva, onContinue }) {
  const copyCode = () => {
    navigator.clipboard.writeText(String(reserva.codigo_recogida || ''));
    toast.success("Código copiado al portapapeles");
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
        <div className="relative">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
          <p className="text-emerald-50 text-lg">Tu menú está reservado y pagado</p>
        </div>
      </div>

      <CardContent className="p-8 space-y-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-300 shadow-lg">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <p className="font-semibold text-amber-900">Tu Código de Recogida</p>
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div 
              className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
              onClick={copyCode}
            >
              <p className="text-5xl font-bold text-amber-900 tracking-wider mb-2">
                {String(reserva.codigo_recogida || '')}
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-700 text-sm group-hover:text-amber-900 transition-colors">
                <Copy className="w-4 h-4" />
                <span>Toca para copiar</span>
              </div>
            </div>
            <p className="text-xs text-amber-800">
              Muestra este código en la cafetería para recoger tu menú
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            Detalles de tu Pedido
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{String(reserva.cafeteria || 'Cafetería')}</p>
                <p className="text-gray-600">{String(reserva.campus || 'Campus')}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-gray-900">{String(reserva.menus_detalle || '')}</p>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="font-semibold text-emerald-900">Pagado:</span>
              <span className="text-2xl font-bold text-emerald-600">
                €{Number(reserva.precio_total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Próximos pasos:</h4>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Dirígete a <strong>{String(reserva.cafeteria || 'la cafetería')}</strong> antes de la hora límite</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Muestra tu código <strong>{String(reserva.codigo_recogida || '')}</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>¡Disfruta tu menú salvado y ayuda al planeta! 🌍</span>
            </li>
          </ol>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Ver Confirmación Completa
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}