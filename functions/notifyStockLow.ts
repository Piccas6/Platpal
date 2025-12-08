import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Autenticación admin/cafeteria
    const user = await base44.auth.me();
    if (!user || !['admin', 'cafeteria', 'manager'].includes(user.app_role)) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Obtener menús de hoy con stock bajo
    const allMenus = await base44.asServiceRole.entities.Menu.list();
    const todayMenus = allMenus.filter(m => m.fecha === today);
    
    const lowStockMenus = todayMenus.filter(menu => {
      const stockPercent = menu.stock_total > 0 
        ? (menu.stock_disponible / menu.stock_total) * 100 
        : 0;
      return menu.stock_disponible > 0 && menu.stock_disponible <= 3 && stockPercent < 20;
    });

    if (lowStockMenus.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No hay stock bajo', 
        notifications_sent: 0 
      });
    }

    // Enviar notificaciones por cada menú
    let notificationsSent = 0;
    
    for (const menu of lowStockMenus) {
      // Notificación a la entidad Notification
      await base44.asServiceRole.entities.Notification.create({
        type: 'stock_low',
        title: '⚠️ Stock Bajo',
        message: `${menu.plato_principal} en ${menu.cafeteria} - Solo quedan ${menu.stock_disponible} unidades`,
        target_users: [], // Enviar a todos los admins/cafeterias
        notification_data: {
          menu_id: menu.id,
          cafeteria: menu.cafeteria,
          stock_disponible: menu.stock_disponible
        },
        sent_at: new Date().toISOString(),
        sent_by: 'system'
      });

      notificationsSent++;
    }

    console.log(`✅ ${notificationsSent} notificaciones de stock bajo enviadas`);

    return Response.json({
      success: true,
      notifications_sent: notificationsSent,
      low_stock_menus: lowStockMenus.map(m => ({
        id: m.id,
        cafeteria: m.cafeteria,
        plato: m.plato_principal,
        stock: m.stock_disponible
      }))
    });

  } catch (error) {
    console.error('Error notificando stock bajo:', error);
    return Response.json({ 
      error: 'Error al notificar stock bajo',
      details: error.message 
    }, { status: 500 });
  }
});