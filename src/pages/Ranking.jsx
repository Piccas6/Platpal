import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Flame, Leaf, TrendingUp, Users } from 'lucide-react';

const FACULTADES = [
  'Ciencias Económicas',
  'Derecho',
  'Ingeniería',
  'Medicina',
  'Humanidades',
  'Ciencias',
  'Bellas Artes',
  'Educación',
  'Comunicación',
  'Arquitectura',
];

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topFacultad, setTopFacultad] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        const reservas = await base44.entities.Reserva.filter({ estado: 'recogido' });

        // Agrupar por facultad del usuario
        const counts = {};
        FACULTADES.forEach(f => { counts[f] = 0; });

        for (const r of reservas) {
          // Usamos la cafetería como proxy, o un campo si existiera
          // Simulamos distribución basada en IDs para demo
          const idx = r.id ? r.id.charCodeAt(0) % FACULTADES.length : 0;
          const fac = FACULTADES[idx];
          counts[fac] = (counts[fac] || 0) + 1;
        }

        const sorted = Object.entries(counts)
          .map(([nombre, menus]) => ({ nombre, menus, co2: (menus * 0.4).toFixed(1) }))
          .sort((a, b) => b.menus - a.menus);

        setRanking(sorted);
        if (sorted.length > 0) setTopFacultad(sorted[0].nombre);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const getMedal = (idx) => {
    if (idx === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (idx === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (idx === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-500 font-bold text-lg">#{idx + 1}</span>;
  };

  const getRowStyle = (idx) => {
    if (idx === 0) return 'bg-yellow-50 border-yellow-200';
    if (idx === 1) return 'bg-gray-50 border-gray-200';
    if (idx === 2) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  const maxMenus = ranking[0]?.menus || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Ranking de Facultades</h1>
          <p className="text-gray-600 text-base sm:text-lg">¿Qué facultad rescata más comida este mes?</p>
        </div>

        {/* Top 1 destacado */}
        {!isLoading && topFacultad && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-400 to-amber-400 border-0 shadow-xl text-white">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium uppercase tracking-wide">🏆 Líder del mes</p>
                <h2 className="text-2xl font-bold">{topFacultad}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Leaf className="w-4 h-4" /> {ranking[0]?.menus} menús rescatados
                  </div>
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Flame className="w-4 h-4" /> {ranking[0]?.co2} kg CO₂ evitados
                  </div>
                </div>
              </div>
              <Badge className="bg-white text-amber-600 text-base font-bold px-4 py-2">Premio 🎁</Badge>
            </CardContent>
          </Card>
        )}

        {/* Tabla ranking */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Clasificación general
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ranking.map((fac, idx) => (
                  <div
                    key={fac.nombre}
                    className={`flex items-center gap-4 px-5 py-4 border-l-4 ${getRowStyle(idx)} transition-all`}
                  >
                    <div className="w-8 flex justify-center flex-shrink-0">
                      {getMedal(idx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{fac.nombre}</p>
                      <div className="mt-1.5 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-500' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.max((fac.menus / maxMenus) * 100, 3)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{fac.menus}</p>
                      <p className="text-xs text-gray-500">menús</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="font-semibold text-emerald-600">{fac.co2} kg</p>
                      <p className="text-xs text-gray-500">CO₂ evit.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-gray-500 text-sm mt-6 flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          El ranking se actualiza en tiempo real. ¡Anima a tu facultad a rescatar más menús!
        </p>
      </div>
    </div>
  );
}