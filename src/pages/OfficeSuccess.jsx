import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OfficeSuccess() {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      const orderId = params.get('order_id');
      const sessionId = params.get('session_id');

      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        // Actualizar el estado del pedido
        const order = await base44.entities.OfficeOrder.get(orderId);
        
        await base44.entities.OfficeOrder.update(orderId, {
          payment_status: 'completed',
          estado: 'pagado',
          stripe_payment_id: sessionId
        });

        setOrderDetails({
          ...order,
          payment_status: 'completed',
          estado: 'pagado'
        });

        // Enviar email de confirmación
        try {
          await base44.integrations.Core.SendEmail({
            to: order.cliente_email,
            subject: '✅ Pedido Office Confirmado - PlatPal',
            body: `
¡Hola ${order.cliente_nombre}!

Tu pedido Office ha sido confirmado y pagado correctamente.

📦 Detalles del Pedido:
━━━━━━━━━━━━━━━━━━━━━━
🍽️ Menú: ${order.menu_detalle}
📍 Cafetería: ${order.cafeteria}
🏢 Dirección: ${order.direccion_entrega}
${order.incluye_bebida ? '🥤 Con bebida incluida' : ''}
🚚 Entrega: ${order.servicio_entrega === 'glovo' ? 'Glovo' : 'Just Eat'}

💰 Total pagado: €${order.precio_total?.toFixed(2)}

⏰ Entrega programada a partir de las 15:30

━━━━━━━━━━━━━━━━━━━━━━

📱 Puedes seguir tu pedido en: ${window.location.origin}/platpal-v2/OfficeDashboard

¡Buen provecho! 🎉

---
PlatPal Office Team
            `.trim()
          });
        } catch (emailError) {
          console.error('Error enviando email:', emailError);
        }

      } catch (error) {
        console.error('Error processing payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando tu pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-green-200 shadow-2xl">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            ¡Pedido Confirmado! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 mb-8">
            Tu pago se ha procesado correctamente
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-blue-200 text-left">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">📦 Detalles de tu pedido:</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Menú:</span>
                  <span className="font-semibold text-gray-900">{orderDetails.menu_detalle}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Cafetería:</span>
                  <span className="font-semibold text-gray-900">{orderDetails.cafeteria}</span>
                </div>

                {orderDetails.incluye_bebida && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bebida:</span>
                    <span className="font-semibold text-green-600">✅ Incluida</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Entrega:</span>
                  <span className="font-semibold text-gray-900">
                    {orderDetails.servicio_entrega === 'glovo' ? 'Glovo' : 'Just Eat'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="font-semibold text-gray-900 text-right ml-2">
                    {orderDetails.direccion_entrega}
                  </span>
                </div>

                <div className="border-t-2 border-blue-200 pt-3 mt-3 flex justify-between">
                  <span className="text-gray-900 font-bold">Total:</span>
                  <span className="text-2xl font-black text-blue-600">
                    €{orderDetails.precio_total?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-blue-900">
              <strong>⏰ Entrega:</strong> Tu pedido será entregado a partir de las 15:30 en la dirección indicada.
            </p>
            <p className="text-sm text-blue-900 mt-2">
              <strong>📧 Email:</strong> Recibirás un correo de confirmación con todos los detalles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={createPageUrl("OfficeDashboard")} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg font-semibold">
                <Package className="w-5 h-5 mr-2" />
                Ver mis pedidos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link to={createPageUrl("OfficeMenus")} className="flex-1">
              <Button variant="outline" className="w-full py-6 text-lg font-semibold border-2">
                Hacer otro pedido
              </Button>
            </Link>
          </div>

          {/* Return Home */}
          <Link to={createPageUrl("OfficeHome")} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mt-6 text-sm">
            <Home className="w-4 h-4" />
            Volver al inicio de Office
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}