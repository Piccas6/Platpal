import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.app_role !== 'cafeteria' && user.app_role !== 'admin' && user.app_role !== 'manager')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { cafeteria_name, plato_principal, plato_secundario, fecha } = await req.json();

    if (!cafeteria_name || !fecha) {
      return Response.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Obtener historial de menús y reservas de los últimos 60 días
    const allMenus = await base44.asServiceRole.entities.Menu.list('-created_date', 200);
    const allReservations = await base44.asServiceRole.entities.Reserva.list('-created_date', 500);

    // Filtrar por cafetería
    const cafeteriaMenus = allMenus.filter(m => m.cafeteria === cafeteria_name);
    const cafeteriaReservations = allReservations.filter(r => r.cafeteria === cafeteria_name);

    // Construir historial de ventas
    const salesHistory = cafeteriaMenus.map(menu => {
      const menuSales = cafeteriaReservations.filter(r => 
        r.menu_id === menu.id && r.payment_status === 'completed'
      ).length;

      const dayOfWeek = new Date(menu.fecha).toLocaleDateString('es-ES', { weekday: 'long' });
      
      return {
        fecha: menu.fecha,
        dia_semana: dayOfWeek,
        plato_principal: menu.plato_principal,
        plato_secundario: menu.plato_secundario,
        stock_total: menu.stock_total,
        vendidos: menuSales,
        porcentaje_vendido: menu.stock_total > 0 ? (menuSales / menu.stock_total * 100).toFixed(1) : 0
      };
    }).slice(0, 30); // Últimos 30 menús

    // Información del día objetivo
    const targetDayOfWeek = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' });

    // Preparar prompt para la IA
    const prompt = `Eres un experto en predicción de demanda para cafeterías universitarias.

**Historial de ventas recientes:**
${salesHistory.map(s => `- ${s.dia_semana} (${s.fecha}): "${s.plato_principal} + ${s.plato_secundario}" - Stock: ${s.stock_total}, Vendidos: ${s.vendidos} (${s.porcentaje_vendido}%)`).join('\n')}

**Menú a predecir:**
- Día: ${targetDayOfWeek} (${fecha})
- Primer plato: ${plato_principal || 'No especificado'}
- Segundo plato: ${plato_secundario || 'No especificado'}
- Cafetería: ${cafeteria_name}

Analiza los patrones de venta y proporciona:
1. Una predicción de stock recomendado (número entre 10 y 50)
2. Nivel de confianza (bajo/medio/alto)
3. Factores clave que influyen en la predicción
4. Recomendaciones breves para optimizar ventas

Considera:
- Popularidad histórica de platos similares
- Patrones del día de la semana
- Tendencias de venta recientes
- Estacionalidad`;

    // Llamar a la IA
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          stock_recomendado: { type: 'number' },
          confianza: { type: 'string', enum: ['bajo', 'medio', 'alto'] },
          factores_clave: { type: 'array', items: { type: 'string' } },
          recomendaciones: { type: 'array', items: { type: 'string' } },
          razonamiento: { type: 'string' }
        }
      }
    });

    return Response.json({
      prediccion: aiResponse,
      historial_analizado: salesHistory.length,
      dia_prediccion: targetDayOfWeek
    });

  } catch (error) {
    console.error('Error en predicción:', error);
    return Response.json(
      { error: error.message || 'Error al predecir demanda' },
      { status: 500 }
    );
  }
});