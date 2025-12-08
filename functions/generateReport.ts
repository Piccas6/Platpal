import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Autenticación
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol
    if (!['admin', 'manager', 'cafeteria'].includes(user.app_role)) {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const config = await req.json();
    const {
      report_type,
      fecha_inicio,
      fecha_fin,
      cafeteria_filter,
      incluir_analisis_ia,
      incluir_visualizaciones,
      incluir_predicciones
    } = config;

    // Obtener datos según el tipo de informe
    const [reservations, menus, users, cafeterias] = await Promise.all([
      base44.asServiceRole.entities.Reserva.list('-created_date', 500),
      base44.asServiceRole.entities.Menu.list('-created_date', 300),
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Cafeteria.list()
    ]);

    // Filtrar por fechas
    const startDate = new Date(fecha_inicio);
    const endDate = new Date(fecha_fin);
    
    const filteredReservations = reservations.filter(r => {
      const createdDate = new Date(r.created_date);
      const matchDate = createdDate >= startDate && createdDate <= endDate;
      const matchCafeteria = cafeteria_filter === 'all' || r.cafeteria === cafeteria_filter;
      return matchDate && matchCafeteria;
    });

    const filteredMenus = menus.filter(m => {
      const menuDate = new Date(m.fecha);
      const matchDate = menuDate >= startDate && menuDate <= endDate;
      const matchCafeteria = cafeteria_filter === 'all' || m.cafeteria === cafeteria_filter;
      return matchDate && matchCafeteria;
    });

    // Calcular métricas básicas según el tipo de informe
    let metricas = {};
    let datos_para_analisis = {};

    if (report_type === 'ventas' || report_type === 'completo') {
      const ventasCompletadas = filteredReservations.filter(r => r.payment_status === 'completed');
      const totalVentas = ventasCompletadas.length;
      const ingresosTotal = ventasCompletadas.reduce((sum, r) => sum + (r.precio_total || 0), 0);
      const ticketPromedio = totalVentas > 0 ? ingresosTotal / totalVentas : 0;
      const ventasConBono = ventasCompletadas.filter(r => r.pagado_con_bono).length;

      metricas = {
        ...metricas,
        total_ventas: totalVentas,
        ingresos_total: `€${ingresosTotal.toFixed(2)}`,
        ticket_promedio: `€${ticketPromedio.toFixed(2)}`,
        ventas_con_bono: ventasConBono,
        tasa_conversion: `${totalVentas > 0 ? ((totalVentas / filteredMenus.length) * 100).toFixed(1) : 0}%`
      };

      datos_para_analisis.ventas = {
        total: totalVentas,
        ingresos: ingresosTotal,
        ventas_por_dia: agruparPorDia(ventasCompletadas),
        cafeterias_top: calcularTopCafeterias(ventasCompletadas)
      };
    }

    if (report_type === 'menus' || report_type === 'completo') {
      const menusPublicados = filteredMenus.length;
      const stockTotal = filteredMenus.reduce((sum, m) => sum + (m.stock_total || 0), 0);
      const stockVendido = filteredMenus.reduce((sum, m) => sum + (m.stock_total - m.stock_disponible || 0), 0);
      const tasaVendido = stockTotal > 0 ? (stockVendido / stockTotal * 100) : 0;

      metricas = {
        ...metricas,
        menus_publicados: menusPublicados,
        stock_total: stockTotal,
        stock_vendido: stockVendido,
        tasa_vendido: `${tasaVendido.toFixed(1)}%`
      };

      datos_para_analisis.menus = {
        publicados: menusPublicados,
        vendidos: stockVendido,
        platos_populares: calcularPlatosPopulares(filteredReservations)
      };
    }

    if (report_type === 'clientes' || report_type === 'completo') {
      const clientesActivos = new Set(filteredReservations.map(r => r.student_email)).size;
      const clientesNuevos = calcularClientesNuevos(filteredReservations, users);
      const frecuenciaPromedio = clientesActivos > 0 ? (filteredReservations.length / clientesActivos).toFixed(1) : 0;

      metricas = {
        ...metricas,
        clientes_activos: clientesActivos,
        clientes_nuevos: clientesNuevos,
        frecuencia_promedio: frecuenciaPromedio
      };

      datos_para_analisis.clientes = {
        activos: clientesActivos,
        nuevos: clientesNuevos,
        frecuencia: frecuenciaPromedio
      };
    }

    if (report_type === 'impacto' || report_type === 'completo') {
      const menusRescatados = filteredReservations.filter(r => r.payment_status === 'completed').length;
      const co2Evitado = menusRescatados * 2.5;
      const comidaRescatada = menusRescatados * 0.4; // kg aproximados

      metricas = {
        ...metricas,
        menus_rescatados: menusRescatados,
        co2_evitado: `${co2Evitado.toFixed(1)} kg`,
        comida_rescatada: `${comidaRescatada.toFixed(1)} kg`
      };

      datos_para_analisis.impacto = {
        menus_rescatados: menusRescatados,
        co2_evitado: co2Evitado,
        comida_rescatada: comidaRescatada
      };
    }

    // Preparar datos para visualización
    let datos_grafico = null;
    if (incluir_visualizaciones) {
      datos_grafico = prepararDatosGrafico(filteredReservations, report_type);
    }

    // Análisis con IA
    let analisis_ia = null;
    if (incluir_analisis_ia) {
      const prompt = construirPromptAnalisis(report_type, metricas, datos_para_analisis, fecha_inicio, fecha_fin);
      
      try {
        const analisisResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              resumen: { type: "string" },
              puntos_clave: { type: "array", items: { type: "string" } },
              oportunidades: { type: "array", items: { type: "string" } },
              recomendaciones: { type: "array", items: { type: "string" } }
            }
          }
        });
        
        analisis_ia = analisisResult;
      } catch (error) {
        console.error('Error en análisis IA:', error);
        analisis_ia = {
          resumen: "No se pudo generar el análisis IA en este momento.",
          puntos_clave: [],
          oportunidades: [],
          recomendaciones: []
        };
      }
    }

    // Predicciones con IA
    let predicciones = null;
    if (incluir_predicciones) {
      const promptPredicciones = `Basándote en estos datos históricos de PlatPal:
${JSON.stringify(datos_para_analisis, null, 2)}

Genera predicciones específicas y cuantificables para los próximos 30 días sobre:
- Volumen de ventas esperado
- Tendencias de demanda
- Mejores momentos para publicar menús
- Oportunidades de crecimiento

Sé específico con números y porcentajes.`;

      try {
        const prediccionesResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: promptPredicciones
        });
        predicciones = prediccionesResult;
      } catch (error) {
        console.error('Error en predicciones:', error);
      }
    }

    return Response.json({
      success: true,
      metricas,
      analisis_ia,
      datos_grafico,
      predicciones,
      periodo: { inicio: fecha_inicio, fin: fecha_fin }
    });

  } catch (error) {
    console.error('Error generando informe:', error);
    return Response.json({ 
      error: 'Error al generar informe',
      details: error.message 
    }, { status: 500 });
  }
});

// Funciones auxiliares
function agruparPorDia(reservations) {
  const grupos = {};
  reservations.forEach(r => {
    const dia = r.created_date?.split('T')[0];
    if (dia) {
      grupos[dia] = (grupos[dia] || 0) + 1;
    }
  });
  return grupos;
}

function calcularTopCafeterias(reservations) {
  const conteo = {};
  reservations.forEach(r => {
    if (r.cafeteria) {
      conteo[r.cafeteria] = (conteo[r.cafeteria] || 0) + 1;
    }
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, ventas]) => ({ nombre, ventas }));
}

function calcularPlatosPopulares(reservations) {
  const conteo = {};
  reservations.forEach(r => {
    if (r.menus_detalle) {
      const platos = r.menus_detalle.split(' + ');
      platos.forEach(plato => {
        conteo[plato] = (conteo[plato] || 0) + 1;
      });
    }
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([plato, veces]) => ({ plato, veces }));
}

function calcularClientesNuevos(reservations, users) {
  const fechaInicio = new Date(reservations[reservations.length - 1]?.created_date || new Date());
  return reservations.filter(r => {
    const user = users.find(u => u.email === r.student_email);
    if (!user) return false;
    const userCreated = new Date(user.created_date);
    return userCreated >= fechaInicio;
  }).length;
}

function prepararDatosGrafico(reservations, reportType) {
  const ventasCompletadas = reservations.filter(r => r.payment_status === 'completed');
  
  // Agrupar por día
  const porDia = {};
  ventasCompletadas.forEach(r => {
    const dia = r.created_date?.split('T')[0];
    if (dia) {
      porDia[dia] = (porDia[dia] || 0) + 1;
    }
  });

  return Object.entries(porDia)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fecha, ventas]) => ({
      fecha: new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ventas,
      ingresos: ventas * 2.99
    }));
}

function construirPromptAnalisis(reportType, metricas, datos, fechaInicio, fechaFin) {
  return `Eres un analista experto de datos para PlatPal, una plataforma de menús sostenibles universitarios.

Analiza este informe de ${reportType} del periodo ${fechaInicio} al ${fechaFin}:

MÉTRICAS:
${JSON.stringify(metricas, null, 2)}

DATOS DETALLADOS:
${JSON.stringify(datos, null, 2)}

Genera un análisis profesional que incluya:
1. RESUMEN EJECUTIVO (2-3 párrafos): Visión general del rendimiento
2. PUNTOS CLAVE (4-6 bullets): Hallazgos más importantes
3. OPORTUNIDADES (3-5 bullets): Áreas de mejora identificadas
4. RECOMENDACIONES (3-5 bullets): Acciones concretas y específicas

Sé específico con números, porcentajes y tendencias. Escribe en español de forma profesional y directa.`;
}