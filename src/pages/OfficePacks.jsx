import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CheckCircle, Building2, Truck, Calendar, Euro } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import withOfficeAuth from "../components/auth/withOfficeAuth";
import OfficeChatWidget from "../components/office/OfficeChatWidget";

function OfficePacks() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [includeBebida, setIncludeBebida] = useState(false);

  const packs = [
    {
      id: 'semanal_5',
      nombre: 'Pack Semanal 5',
      descripcion: 'Perfecto para equipos pequeños',
      cantidad_menus: 5,
      tipo: 'semanal',
      precio_sin_bebida: 22.50,
      precio_con_bebida: 26.50,
      descuento_porcentaje: 0,
      minimo_pedido: 5
    },
    {
      id: 'semanal_10',
      nombre: 'Pack Semanal 10',
      descripcion: 'Ideal para equipos medianos',
      cantidad_menus: 10,
      tipo: 'semanal',
      precio_sin_bebida: 43.00,
      precio_con_bebida: 51.00,
      descuento_porcentaje: 5,
      minimo_pedido: 10,
      popular: true
    },
    {
      id: 'mensual_20',
      nombre: 'Pack Mensual 20',
      descripcion: 'Gran ahorro para uso frecuente',
      cantidad_menus: 20,
      tipo: 'mensual',
      precio_sin_bebida: 81.00,
      precio_con_bebida: 95.00,
      descuento_porcentaje: 10,
      minimo_pedido: 20
    },
    {
      id: 'mensual_40',
      nombre: 'Pack Mensual 40',
      descripcion: 'Máximo ahorro para equipos grandes',
      cantidad_menus: 40,
      tipo: 'mensual',
      precio_sin_bebida: 153.00,
      precio_con_bebida: 180.00,
      descuento_porcentaje: 15,
      minimo_pedido: 40
    }
  ];

  const getPrecioUnitario = (pack) => {
    const precioBase = includeBebida ? 5.30 : 4.50;
    const descuento = (precioBase * pack.descuento_porcentaje) / 100;
    return precioBase - descuento;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("OfficeHome")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-blue-200 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Packs Corporativos
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Alimentación sostenible para tu equipo con descuentos por volumen
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Sin permanencia • Cancela cuando quieras
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Inversión con impacto</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>📦 Packs flexibles adaptados a tu equipo</li>
                  <li>💰 Ahorra hasta 15% vs menús individuales</li>
                  <li>🚚 <strong>Entrega gestionada</strong> o recogida en cafetería</li>
                  <li>📊 Dashboard + informes de impacto mensuales</li>
                  <li>✅ Sin permanencia, cancela cuando quieras</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector Bebida */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            onClick={() => setIncludeBebida(false)}
            variant={!includeBebida ? "default" : "outline"}
            className={!includeBebida ? "bg-blue-600" : ""}
          >
            Sin Bebida (4,50€)
          </Button>
          <Button
            onClick={() => setIncludeBebida(true)}
            variant={includeBebida ? "default" : "outline"}
            className={includeBebida ? "bg-purple-600" : ""}
          >
            Con Bebida (5,30€)
          </Button>
        </div>

        {/* Packs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {packs.map((pack) => {
            const precioTotal = includeBebida ? pack.precio_con_bebida : pack.precio_sin_bebida;
            const precioUnitario = getPrecioUnitario(pack);
            const ahorro = pack.descuento_porcentaje > 0 
              ? ((includeBebida ? 5.30 : 4.50) - precioUnitario) * pack.cantidad_menus 
              : 0;

            return (
              <Card 
                key={pack.id} 
                className={`border-2 hover:shadow-2xl transition-all relative overflow-hidden ${
                  pack.popular ? 'border-purple-300 shadow-xl' : 'border-blue-200'
                }`}
              >
                {pack.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1 text-xs font-bold">
                    MÁS POPULAR
                  </div>
                )}
                <CardHeader className={pack.popular ? 'pt-8' : ''}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{pack.nombre}</CardTitle>
                      <p className="text-gray-600 text-sm">{pack.descripcion}</p>
                    </div>
                    <Package className={`w-8 h-8 ${pack.popular ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Precio */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
                    <div className="text-5xl font-black text-gray-900 mb-2">
                      €{precioTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {pack.cantidad_menus} menús {includeBebida ? 'con' : 'sin'} bebida
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      €{precioUnitario.toFixed(2)} por menú
                    </div>
                    {pack.descuento_porcentaje > 0 && (
                      <Badge className="mt-2 bg-green-500">
                        -{pack.descuento_porcentaje}% descuento
                      </Badge>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Pedido mínimo: <strong>{pack.minimo_pedido} menús</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Renovación: <strong>{pack.tipo === 'semanal' ? 'Semanal' : 'Mensual'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-600" />
                      <span><strong>Envío no incluido</strong> (pagado por cliente)</span>
                    </div>
                    {ahorro > 0 && (
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-green-600" />
                        <span>Ahorras: <strong className="text-green-600">€{ahorro.toFixed(2)}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Botón */}
                  <Button 
                    className={`w-full py-6 text-lg font-semibold rounded-xl ${
                      pack.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                    onClick={() => alert(`Pack ${pack.nombre} - Integración con Stripe próximamente`)}
                  >
                    Contratar Pack
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Información Adicional */}
        <Card className="mt-12 border-2 border-gray-200">
          <CardHeader>
            <CardTitle>¿Cómo funcionan los packs?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Elige tu pack</h4>
                <p>Selecciona el pack que mejor se adapte al tamaño de tu equipo y frecuencia de uso.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-purple-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Programa tus entregas</h4>
                <p>Decide cuándo quieres recibir cada menú. Puedes distribuirlos durante el período contratado.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-green-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Recibe y disfruta</h4>
                <p>Los menús se entregan en tu oficina vía Glovo o JustEat. El coste de envío se añade en cada pedido.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Widget */}
        <OfficeChatWidget />
      </div>
    </div>
  );
}

export default withOfficeAuth(OfficePacks);