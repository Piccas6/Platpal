import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowRight, 
  Building2,
  Clock,
  Truck,
  CheckCircle,
  Package,
  MapPin,
  Euro
} from "lucide-react";

export default function OfficeHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-[20px] p-5 border border-gray-200 flex items-center justify-center hover:border-blue-300 transition-colors duration-300">
                <Building2 className="w-full h-full text-blue-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-4">
            PlatPal Office
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Menús de calidad para tu oficina desde <span className="text-blue-600 font-bold">4,50€</span>
          </p>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <Euro className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Desde 4,50€</p>
              <p className="text-sm text-gray-600">Precio fijo</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-lg">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Entrega 15:30</p>
              <p className="text-sm text-gray-600">Puntual</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-green-100 shadow-lg">
              <Truck className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Glovo/JustEat</p>
              <p className="text-sm text-gray-600">A tu oficina</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-lg">
              <Package className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Packs</p>
              <p className="text-sm text-gray-600">Suscripciones</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("OfficeMenus")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-14 py-7 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all group">
                Ver Menús Office
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to={createPageUrl("OfficePacks")}>
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-14 py-7 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Ver Packs y Suscripciones
              </Button>
            </Link>
          </div>

          {/* Volver a Estudiantes */}
          <div className="mt-8">
            <Link to={createPageUrl("Home")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
              ← Volver a PlatPal Estudiantes
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-3xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Elige tus menús</h3>
              <p className="text-gray-600 leading-relaxed">Selecciona entre menús individuales o contrata un pack semanal/mensual para tu equipo.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-purple-100 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Paga y programa</h3>
              <p className="text-gray-600 leading-relaxed">Pago seguro online. Programa la entrega para las 15:30 o cuando te venga mejor.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-green-100 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Recibe y disfruta</h3>
              <p className="text-gray-600 leading-relaxed">Recibe tu pedido en la oficina vía Glovo o JustEat. Listo para comer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Precios transparentes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sin Bebida</h3>
                <div className="text-5xl font-black text-blue-600 mb-6">4,50€</div>
                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Menú completo de calidad</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Entrega incluida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>A partir de las 15:30</span>
                  </li>
                </ul>
                <Link to={createPageUrl("OfficeMenus")}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Pedir ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Con Bebida</h3>
                <div className="text-5xl font-black text-purple-600 mb-6">5,30€</div>
                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Menú completo + bebida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Entrega incluida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>A partir de las 15:30</span>
                  </li>
                </ul>
                <Link to={createPageUrl("OfficeMenus")}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Pedir ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para mejorar las comidas de tu equipo?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Únete a las empresas que ya confían en PlatPal Office para alimentar a sus equipos.
          </p>
          <Link to={createPageUrl("OfficeMenus")}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-12 py-7 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all">
              Empezar ahora
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}