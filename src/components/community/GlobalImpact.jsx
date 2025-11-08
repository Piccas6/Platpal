import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, TrendingUp, Users, Leaf, DollarSign, Heart, Utensils } from 'lucide-react';

export default function GlobalImpact({ globalStats }) {
  // Calcular stats derivados
  const co2Total = (globalStats.menusSaved * 0.3).toFixed(1);
  const waterTotal = Math.round(globalStats.menusSaved * 35);
  const foodTotal = (globalStats.menusSaved * 0.4).toFixed(0);
  const moneyTotal = (globalStats.menusSaved * 2.99).toFixed(2);
  const donations = (globalStats.menusSaved * 2.99 * 0.05).toFixed(2);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Globe className="w-5 h-5 md:w-6 md:h-6" />
            Impacto Global de PlatPal
          </CardTitle>
          <p className="text-xs md:text-sm text-emerald-700">Juntos estamos haciendo la diferencia</p>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-md border border-emerald-100">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-600 mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{globalStats.activeMembers}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Estudiantes activos</p>
              <div className="mt-2 md:mt-3 flex items-center gap-1 text-green-600 text-xs md:text-sm">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                <span>Creciendo</span>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-md border border-orange-100">
              <Utensils className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{globalStats.menusSaved}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Menús salvados</p>
              <div className="mt-2 md:mt-3 flex items-center gap-1 text-green-600 text-xs md:text-sm">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                <span>En aumento</span>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-md border border-purple-100 col-span-2 md:col-span-1">
              <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-purple-600 mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-gray-900">€{moneyTotal}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Movidos en total</p>
              <div className="mt-2 md:mt-3 flex items-center gap-1 text-green-600 text-xs md:text-sm">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                <span>Economía local</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 md:p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl md:rounded-2xl">
              <h3 className="font-bold text-base md:text-lg text-green-900 mb-3 md:mb-4">🌍 Impacto Ambiental</h3>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <p className="text-xs md:text-sm text-green-700">CO₂ Evitado</p>
                  <p className="text-xl md:text-2xl font-bold text-green-900">{co2Total} kg</p>
                  <p className="text-xs text-green-600">= {Math.floor(globalStats.menusSaved / 10)} árboles 🌳</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-green-700">Agua Ahorrada</p>
                  <p className="text-xl md:text-2xl font-bold text-green-900">{waterTotal.toLocaleString()} L</p>
                  <p className="text-xs text-green-600">= {Math.floor(waterTotal / 50)} duchas 🚿</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-green-700">Comida Salvada</p>
                  <p className="text-xl md:text-2xl font-bold text-green-900">{foodTotal} kg</p>
                  <p className="text-xs text-green-600">= {globalStats.menusSaved * 2} comidas 🍽️</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl md:rounded-2xl">
              <h3 className="font-bold text-base md:text-lg text-rose-900 mb-3 md:mb-4">❤️ Impacto Social</h3>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <p className="text-xs md:text-sm text-rose-700">Donado a ONGs</p>
                  <p className="text-xl md:text-2xl font-bold text-rose-900">€{donations}</p>
                  <p className="text-xs text-rose-600">5% de las ventas</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-rose-700">Cafeterías Apoyadas</p>
                  <p className="text-xl md:text-2xl font-bold text-rose-900">8</p>
                  <p className="text-xs text-rose-600">En 4 campus</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-rose-700">Empleos Sostenidos</p>
                  <p className="text-xl md:text-2xl font-bold text-rose-900">~24</p>
                  <p className="text-xs text-rose-600">Personal de cafeterías</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl md:rounded-2xl">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />
              <h3 className="font-bold text-base md:text-lg text-gray-900">Nuestra Misión Continúa</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
              Cada menú salvado no es solo una comida, es un acto de responsabilidad con el planeta, 
              con tu comunidad y contigo mismo.
            </p>
            <div className="grid grid-cols-3 gap-2 md:gap-3 text-center">
              <div>
                <p className="text-xl md:text-2xl font-bold text-blue-600">100%</p>
                <p className="text-xs text-gray-600">Sostenible</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-purple-600">100%</p>
                <p className="text-xs text-gray-600">Local</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-pink-600">100%</p>
                <p className="text-xs text-gray-600">Real</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}