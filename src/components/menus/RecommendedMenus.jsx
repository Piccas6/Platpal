import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Heart, Clock } from 'lucide-react';
import MenuCard from './MenuCard';
import { base44 } from '@/api/base44Client';

export default function RecommendedMenus({ 
  currentUser, 
  allMenus, 
  allReservations,
  onReservationSuccess,
  onFavoriteToggle 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateRecommendations = async () => {
      if (!currentUser || !allMenus || allMenus.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const availableMenus = allMenus.filter(m => {
          const isToday = m.fecha === today;
          const hasStock = m.stock_disponible > 0;
          return isToday && hasStock;
        });

        if (availableMenus.length === 0) {
          setIsLoading(false);
          return;
        }

        // Filtrar por campus del usuario
        const campusMenus = currentUser.campus 
          ? availableMenus.filter(m => m.campus === currentUser.campus)
          : availableMenus;

        // Obtener reservas del usuario
        const userReservations = allReservations?.filter(r => 
          r.created_by === currentUser.email
        ) || [];

        // Calcular puntuaciones
        const scoredMenus = campusMenus.map(menu => {
          let score = 0;

          // 1. Coincidencia con preferencias dietéticas (+30 puntos)
          if (currentUser.preferencias_dieta) {
            if (currentUser.preferencias_dieta.es_vegetariano && menu.es_vegetariano) score += 30;
            if (currentUser.preferencias_dieta.es_vegano && menu.es_vegano) score += 30;
            if (currentUser.preferencias_dieta.sin_gluten && menu.sin_gluten) score += 30;
          }

          // 2. Evitar alérgenos (-50 puntos si contiene alérgenos a evitar)
          const alergenosEvitar = currentUser.preferencias_dieta?.alergenos_evitar || [];
          const tieneAlergenosProblematicos = menu.alergenos?.some(a => 
            alergenosEvitar.includes(a) && a !== 'ninguno'
          );
          if (tieneAlergenosProblematicos) score -= 50;

          // 3. Cafeterías favoritas (+25 puntos)
          if (currentUser.cafeterias_favoritas?.includes(menu.cafeteria)) {
            score += 25;
          }

          // 4. Menús favoritos del usuario (+40 puntos)
          if (currentUser.menus_favoritos?.includes(menu.id)) {
            score += 40;
          }

          // 5. Historial de pedidos similares (+20 puntos por cada pedido similar)
          const similarOrders = userReservations.filter(r => 
            r.cafeteria === menu.cafeteria ||
            r.menus_detalle?.includes(menu.plato_principal) ||
            (menu.tipo_cocina && r.menus_detalle?.toLowerCase().includes(menu.tipo_cocina.toLowerCase()))
          );
          score += similarOrders.length * 20;

          // 6. Popularidad en el campus (trending) (+15 puntos por cada 5 reservas)
          const menuReservations = allReservations?.filter(r => 
            r.menu_id === menu.id && r.payment_status === 'completed'
          ) || [];
          score += Math.floor(menuReservations.length / 5) * 15;

          // 7. Stock bajo = urgencia (+10 puntos si quedan pocos)
          if (menu.stock_disponible <= 3) {
            score += 10;
          }

          // 8. Tipo de cocina variada (bonus si no ha pedido este tipo antes)
          if (menu.tipo_cocina) {
            const hasOrderedThisType = userReservations.some(r => 
              r.menus_detalle?.toLowerCase().includes(menu.tipo_cocina.toLowerCase())
            );
            if (!hasOrderedThisType) score += 15;
          }

          return { ...menu, recommendationScore: score };
        });

        // Ordenar por puntuación y tomar los top 6
        const topRecommendations = scoredMenus
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 6);

        setRecommendations(topRecommendations);
      } catch (error) {
        console.error("Error calculating recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateRecommendations();
  }, [currentUser, allMenus, allReservations]);

  const getRecommendationReason = (menu) => {
    const reasons = [];
    
    if (currentUser.preferencias_dieta?.es_vegetariano && menu.es_vegetariano) {
      reasons.push({ icon: '🥗', text: 'Vegetariano' });
    }
    if (currentUser.preferencias_dieta?.es_vegano && menu.es_vegano) {
      reasons.push({ icon: '🌱', text: 'Vegano' });
    }
    if (currentUser.cafeterias_favoritas?.includes(menu.cafeteria)) {
      reasons.push({ icon: <Heart className="w-3 h-3" />, text: 'Cafetería favorita' });
    }
    if (currentUser.menus_favoritos?.includes(menu.id)) {
      reasons.push({ icon: <Heart className="w-3 h-3 fill-current" />, text: 'Menú favorito' });
    }
    if (menu.stock_disponible <= 3) {
      reasons.push({ icon: <Clock className="w-3 h-3" />, text: '¡Últimas unidades!' });
    }

    // Default to trending if no specific reasons
    if (reasons.length === 0) {
      reasons.push({ icon: <TrendingUp className="w-3 h-3" />, text: 'Popular' });
    }

    return reasons[0]; // Return the most relevant reason
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Recomendados para ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Buscando las mejores opciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser || !currentUser.id || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Recomendados para ti
          </CardTitle>
          <Badge className="bg-emerald-100 text-emerald-800">
            {recommendations.length} {recommendations.length === 1 ? 'menú' : 'menús'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Basado en tus preferencias, historial y los menús más populares de tu campus
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((menu) => {
            const reason = getRecommendationReason(menu);
            return (
              <div key={menu.id} className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <Badge className="bg-emerald-600 text-white shadow-lg flex items-center gap-1">
                    {typeof reason.icon === 'string' ? reason.icon : reason.icon}
                    <span className="text-xs">{reason.text}</span>
                  </Badge>
                </div>
                <MenuCard 
                  menu={menu} 
                  onReservationSuccess={onReservationSuccess}
                  currentUser={currentUser}
                  onFavoriteToggle={onFavoriteToggle}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}