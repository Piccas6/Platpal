
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingUp, Leaf, Droplets, UtensilsCrossed, Euro, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StreakMeter from '../profile/StreakMeter'; // NEW IMPORT

export default function PersonalImpact({ user, isAuthenticated }) {
  const [impact, setImpact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateImpact = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Obtener todas las reservas del usuario
        const allReservations = await base44.entities.Reserva.list('-created_date');
        const userReservations = allReservations.filter(
          r => r.created_by === user.email && r.payment_status === 'completed'
        );

        const menusSaved = userReservations.length;
        const totalSpent = userReservations.reduce((sum, r) => sum + (r.precio_total || 2.99), 0);

        // Cálculos de impacto
        const co2Avoided = (menusSaved * 0.3).toFixed(1); // ~300g CO2 por menú
        const waterSaved = Math.round(menusSaved * 35); // ~35L por menú
        const foodSaved = (menusSaved * 0.4).toFixed(1); // ~400g por menú
        const moneySaved = (menusSaved * 6).toFixed(2); // ~€6 ahorrados vs precio normal
        const donations = (totalSpent * 0.05).toFixed(2); // 5% donado
        const cafeteriaSupport = totalSpent.toFixed(2);

        setImpact({
          menusSaved,
          co2Avoided,
          waterSaved,
          foodSaved,
          moneySaved,
          donations,
          cafeteriaSupport,
          treesEquivalent: Math.floor(menusSaved / 10), // 10 menús = 1 árbol
          mealsEquivalent: menusSaved * 2,
          showersEquivalent: Math.floor(waterSaved / 50)
        });

      } catch (error) {
        console.error("Error calculating impact:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateImpact();
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Card className="border-2 border-blue-100">
        <CardContent className="p-8 md:p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Inicia sesión para ver tu impacto
          </h3>
          <p className="text-gray-600 mb-6">
            Descubre cuánto has ayudado al planeta con tus menús salvados
          </p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-gradient-to-r from-blue-600 to-purple-600">
            Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!impact || impact.menusSaved === 0) {
    return (
      <Card className="border-2 border-orange-100">
        <CardContent className="p-8 md:p-12 text-center">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Empieza tu viaje sostenible!
          </h3>
          <p className="text-gray-600 mb-6">
            Aún no has salvado ningún menú. ¡Es hora de empezar a marcar la diferencia!
          </p>
          <Link to={createPageUrl("Campus")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600">
              Ver Menús Disponibles
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Resumen de Logros */}
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Award className="w-5 h-5" />
            Tu Impacto Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl md:text-6xl font-bold text-purple-600 mb-2">
              {impact.menusSaved}
            </p>
            <p className="text-gray-700 font-medium">
              Menús Salvados del Desperdicio
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NUEVO: Racha prominente */}
      {isAuthenticated && user && (
        <StreakMeter 
          currentStreak={user.racha_actual || 0}
          maxStreak={user.racha_maxima || 0}
        />
      )}

      {/* Impacto Ambiental y Económico */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="text-green-900 text-base md:text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Impacto Ambiental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">CO₂ Evitado</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-900">{impact.co2Avoided} kg</p>
              <p className="text-xs text-green-600 mt-1">
                = {impact.treesEquivalent} {impact.treesEquivalent === 1 ? 'árbol' : 'árboles'} plantados 🌳
              </p>
            </div>
            
            <div className="p-3 md:p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">Agua Ahorrada</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-900">{impact.waterSaved} L</p>
              <p className="text-xs text-blue-600 mt-1">
                = {impact.showersEquivalent} duchas 🚿
              </p>
            </div>
            
            <div className="p-3 md:p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <UtensilsCrossed className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-purple-700">Comida Salvada</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-900">{impact.foodSaved} kg</p>
              <p className="text-xs text-purple-600 mt-1">
                = {impact.mealsEquivalent} comidas 🍽️
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base md:text-lg flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Impacto Económico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Euro className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-700">Tu Ahorro</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-amber-900">€{impact.moneySaved}</p>
              <p className="text-xs text-amber-600 mt-1">
                vs precio regular de menús
              </p>
            </div>
            
            <div className="p-3 md:p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-orange-700">Donaciones</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-orange-900">€{impact.donations}</p>
              <p className="text-xs text-orange-600 mt-1">
                donados a ONGs locales 🤝
              </p>
            </div>
            
            <div className="p-3 md:p-4 bg-rose-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-rose-600" />
                <p className="text-sm text-rose-700">Apoyo Local</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-rose-900">€{impact.cafeteriaSupport}</p>
              <p className="text-xs text-rose-600 mt-1">
                a cafeterías del campus 🏪
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-6 md:p-8 text-center">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            ¡Sigue haciendo la diferencia!
          </h3>
          <p className="text-sm md:text-base text-gray-700 mb-4">
            Cada menú que salvas suma a tu impacto positivo
          </p>
          <Link to={createPageUrl("Campus")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 w-full sm:w-auto">
              Salvar Más Menús
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
