import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * AUTO SURPLUS DETECTION ALGORITHM
 * 
 * Analiza patrones históricos de ventas por cafetería + día de la semana
 * para predecir excedentes automáticamente y actualizar el stock en tiempo real.
 * 
 * Puede ser llamado manualmente (demo) o por automation programada.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Permitir llamadas de sistema (automations) o admins
    let isSystemCall = false;
    try {
      const user = await base44.auth.me();
      if (user?.app_role !== 'admin' && user?.app_role !== 'cafeteria' && user?.app_role !== 'manager') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      // Llamada de sistema (automation) — permitir con service role
      isSystemCall = true;
    }

    const body = await req.json().catch(() => ({}));
    const { cafeteria_name, dry_run = false } = body;

    const today = new Date().toISOString().split('T')[0];
    const todayDow = new Date().getDay(); // 0=Dom, 6=Sab

    // 1. Obtener todos los menús de hoy
    const allMenus = await base44.asServiceRole.entities.Menu.list('-created_date', 200);
    const todayMenus = allMenus.filter(m => {
      const matchDate = m.fecha === today;
      const matchCafe = cafeteria_name ? m.cafeteria === cafeteria_name : true;
      return matchDate && matchCafe && m.stock_total > 0;
    });

    if (todayMenus.length === 0) {
      return Response.json({ message: 'No hay menús activos hoy', processed: 0 });
    }

    // 2. Obtener historial de reservas (últimos 90 días)
    const allReservations = await base44.asServiceRole.entities.Reserva.list('-created_date', 1000);
    const completedReservations = allReservations.filter(r => r.payment_status === 'completed');

    // 3. Obtener historial de menús pasados (últimos 90 días)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const historicMenus = allMenus.filter(m => m.fecha && m.fecha < today && new Date(m.fecha) >= cutoff);

    const results = [];

    for (const menu of todayMenus) {
      // === NÚCLEO DEL ALGORITMO ===

      // A) Ventas históricas del mismo día de la semana para esta cafetería
      const sameDowMenus = historicMenus.filter(m => {
        if (m.cafeteria !== menu.cafeteria) return false;
        const d = new Date(m.fecha).getDay();
        return d === todayDow;
      });

      // B) Calcular tasa de venta promedio por día de semana
      let avgSellRate = 0.7; // fallback si no hay datos
      if (sameDowMenus.length > 0) {
        const rates = sameDowMenus.map(m => {
          const sold = completedReservations.filter(r => r.menu_id === m.id).length;
          return m.stock_total > 0 ? sold / m.stock_total : 0;
        });
        avgSellRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      }

      // C) Ventas históricas de platos similares (mismo plato principal)
      const similarMenus = historicMenus.filter(m =>
        m.cafeteria === menu.cafeteria &&
        m.plato_principal?.toLowerCase() === menu.plato_principal?.toLowerCase()
      );

      let dishPopularityRate = null;
      if (similarMenus.length > 0) {
        const rates = similarMenus.map(m => {
          const sold = completedReservations.filter(r => r.menu_id === m.id).length;
          return m.stock_total > 0 ? sold / m.stock_total : 0;
        });
        dishPopularityRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      }

      // D) Reservas actuales del menú de hoy
      const currentReservations = completedReservations.filter(r => r.menu_id === menu.id).length;
      const currentSellRate = menu.stock_total > 0 ? currentReservations / menu.stock_total : 0;

      // E) Factor de tendencia reciente (últimos 7 días)
      const last7DayMenus = historicMenus.filter(m => {
        if (m.cafeteria !== menu.cafeteria) return false;
        const d = new Date(m.fecha);
        const daysAgo = (new Date() - d) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      });

      let trendFactor = 1.0;
      if (last7DayMenus.length >= 2) {
        const recentRates = last7DayMenus.map(m => {
          const sold = completedReservations.filter(r => r.menu_id === m.id).length;
          return m.stock_total > 0 ? sold / m.stock_total : 0;
        });
        const recentAvg = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
        trendFactor = recentAvg > 0 ? recentAvg / Math.max(avgSellRate, 0.01) : 1.0;
        trendFactor = Math.max(0.5, Math.min(1.5, trendFactor)); // clamp entre 0.5 y 1.5
      }

      // F) Combinar señales con pesos
      const weights = {
        dow: 0.35,         // día de la semana
        dish: 0.30,        // popularidad del plato
        current: 0.25,     // reservas actuales como señal temprana
        trend: 0.10        // tendencia reciente
      };

      const dishScore = dishPopularityRate !== null ? dishPopularityRate : avgSellRate;
      const predictedSellRate = (
        weights.dow * avgSellRate +
        weights.dish * dishScore +
        weights.current * (currentSellRate * trendFactor) +
        weights.trend * (avgSellRate * trendFactor)
      );

      // G) Calcular excedente predicho
      const predictedSold = Math.round(menu.stock_total * Math.min(predictedSellRate, 1.0));
      const predictedSurplus = Math.max(0, menu.stock_total - predictedSold);
      const surplusPercentage = menu.stock_total > 0 ? (predictedSurplus / menu.stock_total * 100) : 0;

      // H) Nivel de confianza basado en cantidad de datos históricos
      let confidence = 'low';
      const dataPoints = sameDowMenus.length + similarMenus.length;
      if (dataPoints >= 10) confidence = 'high';
      else if (dataPoints >= 4) confidence = 'medium';

      // I) Recomendación de acción
      let action = 'none';
      let actionReason = '';
      if (surplusPercentage >= 40) {
        action = 'activate_surprise'; // marcar como menú sorpresa / excedente
        actionReason = `Se predice un ${surplusPercentage.toFixed(0)}% de excedente. Activar descuento especial.`;
      } else if (surplusPercentage >= 20) {
        action = 'notify_cafeteria';
        actionReason = `Excedente moderado (~${surplusPercentage.toFixed(0)}%). Notificar a la cafetería.`;
      } else if (predictedSellRate > 0.95) {
        action = 'notify_high_demand';
        actionReason = 'Alta demanda predicha. Considerar aumentar stock.';
      }

      const result = {
        menu_id: menu.id,
        cafeteria: menu.cafeteria,
        plato_principal: menu.plato_principal,
        stock_total: menu.stock_total,
        reservas_actuales: currentReservations,
        predicted_sell_rate: parseFloat(predictedSellRate.toFixed(3)),
        predicted_sold: predictedSold,
        predicted_surplus: predictedSurplus,
        surplus_percentage: parseFloat(surplusPercentage.toFixed(1)),
        confidence,
        action,
        action_reason: actionReason,
        data_points_used: dataPoints,
        algorithm_factors: {
          dow_avg_rate: parseFloat(avgSellRate.toFixed(3)),
          dish_popularity_rate: dishPopularityRate !== null ? parseFloat(dishPopularityRate.toFixed(3)) : null,
          trend_factor: parseFloat(trendFactor.toFixed(3)),
          current_sell_rate: parseFloat(currentSellRate.toFixed(3))
        }
      };

      results.push(result);

      // J) Aplicar acciones automáticas (solo si no es dry_run)
      if (!dry_run) {
        if (action === 'activate_surprise' && menu.stock_disponible > 0) {
          // Marcar el menú como sorpresa/excedente automáticamente
          await base44.asServiceRole.entities.Menu.update(menu.id, {
            es_sorpresa: true
          });
        }

        if (action !== 'none') {
          // Crear notificación para la cafetería
          await base44.asServiceRole.entities.Notification.create({
            type: action,
            title: action === 'activate_surprise' ? '🤖 Excedente detectado automáticamente' :
                   action === 'notify_high_demand' ? '🔥 Alta demanda predicha' : '⚠️ Excedente moderado predicho',
            message: actionReason,
            target_users: [],
            sent_at: new Date().toISOString(),
            notification_data: { menu_id: menu.id, cafeteria: menu.cafeteria }
          });
        }
      }
    }

    // Resumen estadístico
    const summary = {
      total_menus_analyzed: results.length,
      menus_with_surplus_risk: results.filter(r => r.surplus_percentage >= 20).length,
      menus_auto_activated: results.filter(r => r.action === 'activate_surprise').length,
      avg_predicted_sell_rate: results.length > 0
        ? parseFloat((results.reduce((a, r) => a + r.predicted_sell_rate, 0) / results.length).toFixed(3))
        : 0,
      total_predicted_surplus_units: results.reduce((a, r) => a + r.predicted_surplus, 0),
      dry_run,
      timestamp: new Date().toISOString()
    };

    return Response.json({ summary, results });

  } catch (error) {
    console.error('Error en autoSurplusDetection:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});