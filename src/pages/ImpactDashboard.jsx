import React, { useEffect, useState } from "react";
import { Reserva } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Heart, Recycle, Target, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ImpactDashboard() {
  const [stats, setStats] = useState({
    mealsSaved: 0,
    donated: 0,
    co2Saved: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const paidReservations = await Reserva.filter({ estado: 'pagado' });
        const mealsSaved = paidReservations.length;
        
        const donated = mealsSaved * 0.25; // Assuming €0.25 donated per meal
        const co2Saved = mealsSaved * 2.5; // Assuming 2.5kg CO2 saved per meal

        setStats({ mealsSaved, donated, co2Saved });
      } catch (error) {
        console.error("Error fetching impact data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImpactData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestro Impacto Colectivo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada menú comprado en PlatPal contribuye a un futuro más sostenible y solidario. 
            ¡Mira lo que hemos logrado juntos!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-lg border-2 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">Menús Salvados</CardTitle>
              <UtensilsCrossed className="w-6 h-6 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600">{isLoading ? '...' : stats.mealsSaved}</div>
              <p className="text-sm text-gray-600">del desperdicio alimentario</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-rose-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">Donado a ONGs</CardTitle>
              <Heart className="w-6 h-6 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-rose-600">€{isLoading ? '...' : stats.donated.toFixed(2)}</div>
              <p className="text-sm text-gray-600">para combatir la pobreza alimentaria</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-amber-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">CO₂ Ahorrado</CardTitle>
              <Recycle className="w-6 h-6 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-600">{isLoading ? '...' : stats.co2Saved.toFixed(1)} <span className="text-2xl">kg</span></div>
              <p className="text-sm text-gray-600">en emisiones de efecto invernadero</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}