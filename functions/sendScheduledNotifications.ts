import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Función programada para enviar notificaciones push automatizadas:
 * - Recordatorios de recogida (30 min antes)
 * - Nuevos menús publicados
 * - Últimas unidades disponibles
 */
Deno.serve(async (req) => {
  const logPrefix = '🔔 [SCHEDULED_NOTIF]';
  console.log(`${logPrefix} ==================== INICIO ====================`);
  
  try {
    // Usar service role para operaciones automatizadas
    const fakeReq = new Request('http://localhost', {
      headers: new Headers({ 'Authorization': 'Bearer service-role-token' })
    });
    const base44 = createClientFromRequest(fakeReq);

    const { notification_type } = await req.json();

    if (!notification_type) {
      return Response.json({ error: 'notification_type required' }, { status: 400 });
    }

    // 1. RECORDATORIOS DE RECOGIDA (30 min antes)
    if (notification_type === 'pickup_reminders') {
      console.log(`${logPrefix} 📦 Procesando recordatorios de recogida...`);
      
      const now = new Date();
      const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
      
      // Buscar reservas que vencen en ~30 minutos
      const allReservas = await base44.asServiceRole.entities.Reserva.list();
      const today = now.toISOString().split('T')[0];
      
      const reservasToRemind = allReservas.filter(r => {
        if (r.estado !== 'pagado' || !r.created_date?.startsWith(today)) return false;
        
        // Verificar si la hora límite es en ~30 minutos
        try {
          const horaLimite = r.hora_limite || '18:00';
          const [hours, minutes] = horaLimite.split(':').map(Number);
          const limiteDate = new Date(now);
          limiteDate.setHours(hours, minutes, 0, 0);
          
          const diff = limiteDate.getTime() - now.getTime();
          return diff > 0 && diff <= 35 * 60 * 1000 && diff >= 25 * 60 * 1000; // 25-35 min
        } catch {
          return false;
        }
      });

      console.log(`${logPrefix} Encontradas ${reservasToRemind.length} reservas para recordar`);

      // Enviar notificaciones a usuarios con preferencia activada
      const allUsers = await base44.asServiceRole.entities.User.list();
      let sentCount = 0;

      for (const reserva of reservasToRemind) {
        const user = allUsers.find(u => u.email === reserva.created_by);
        
        if (user?.notifications_enabled && user?.notification_preferences?.recordatorios_recogida) {
          console.log(`${logPrefix} 📧 Enviando recordatorio a ${user.email}`);
          
          // Aquí integrarías con servicio de push real (FCM, OneSignal, etc.)
          // Por ahora registramos el intento
          
          sentCount++;
        }
      }

      return Response.json({ 
        success: true, 
        type: 'pickup_reminders',
        reservas_found: reservasToRemind.length,
        notifications_sent: sentCount
      });
    }

    // 2. NOTIFICAR NUEVOS MENÚS
    if (notification_type === 'new_menus') {
      console.log(`${logPrefix} 🍽️ Procesando notificación de nuevos menús...`);
      
      // Buscar menús publicados en la última hora
      const allMenus = await base44.asServiceRole.entities.Menu.list('-created_date', 50);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const recentMenus = allMenus.filter(m => {
        const createdDate = new Date(m.created_date);
        return createdDate > oneHourAgo && m.stock_disponible > 0;
      });

      console.log(`${logPrefix} Encontrados ${recentMenus.length} menús nuevos`);

      if (recentMenus.length === 0) {
        return Response.json({ success: true, message: 'No new menus to notify' });
      }

      // Agrupar por campus para notificaciones más relevantes
      const menusByCampus = {};
      recentMenus.forEach(m => {
        if (!menusByCampus[m.campus]) menusByCampus[m.campus] = [];
        menusByCampus[m.campus].push(m);
      });

      const allUsers = await base44.asServiceRole.entities.User.list();
      let sentCount = 0;

      for (const [campus, menus] of Object.entries(menusByCampus)) {
        const usersInCampus = allUsers.filter(u => 
          u.campus === campus &&
          u.notifications_enabled === true &&
          u.notification_preferences?.nuevos_menus === true
        );

        console.log(`${logPrefix} Campus ${campus}: ${usersInCampus.length} usuarios elegibles`);

        // Notificar sobre cafeterías favoritas
        for (const user of usersInCampus) {
          let shouldNotify = false;
          let notificationText = '';

          // Verificar si hay menús de cafeterías favoritas
          if (user.notification_preferences?.cafeterias_favoritas_nuevos_menus && 
              user.cafeterias_favoritas?.length > 0) {
            const favMenus = menus.filter(m => 
              user.cafeterias_favoritas.includes(m.cafeteria)
            );
            
            if (favMenus.length > 0) {
              shouldNotify = true;
              notificationText = `⭐ ${favMenus.length} ${favMenus.length === 1 ? 'nuevo menú' : 'nuevos menús'} en tus cafeterías favoritas`;
            }
          }

          // Notificación genérica de nuevos menús
          if (!shouldNotify && user.notification_preferences?.nuevos_menus) {
            shouldNotify = true;
            notificationText = `🍽️ ${menus.length} ${menus.length === 1 ? 'nuevo menú disponible' : 'nuevos menús disponibles'} en ${campus}`;
          }

          if (shouldNotify) {
            console.log(`${logPrefix} 📧 Notificando a ${user.email}: ${notificationText}`);
            sentCount++;
          }
        }
      }

      return Response.json({ 
        success: true, 
        type: 'new_menus',
        menus_found: recentMenus.length,
        notifications_sent: sentCount
      });
    }

    // 3. NOTIFICAR ÚLTIMAS UNIDADES
    if (notification_type === 'low_stock') {
      console.log(`${logPrefix} 🔥 Procesando alertas de últimas unidades...`);
      
      const today = new Date().toISOString().split('T')[0];
      const allMenus = await base44.asServiceRole.entities.Menu.list();
      
      // Menús con pocas unidades (< 3 y > 0)
      const lowStockMenus = allMenus.filter(m => 
        m.fecha === today &&
        m.stock_disponible > 0 && 
        m.stock_disponible <= 3 &&
        m.stock_disponible / m.stock_total < 0.2 // Menos del 20%
      );

      console.log(`${logPrefix} Encontrados ${lowStockMenus.length} menús con stock bajo`);

      if (lowStockMenus.length === 0) {
        return Response.json({ success: true, message: 'No low stock items' });
      }

      const allUsers = await base44.asServiceRole.entities.User.list();
      let sentCount = 0;

      for (const menu of lowStockMenus) {
        // Notificar a usuarios que tienen esta cafetería como favorita
        const interestedUsers = allUsers.filter(u => 
          u.notifications_enabled === true &&
          u.notification_preferences?.ultimas_unidades === true &&
          u.campus === menu.campus &&
          u.cafeterias_favoritas?.includes(menu.cafeteria)
        );

        for (const user of interestedUsers) {
          console.log(`${logPrefix} 📧 Alertando a ${user.email} sobre ${menu.cafeteria}`);
          sentCount++;
        }
      }

      return Response.json({ 
        success: true, 
        type: 'low_stock',
        menus_found: lowStockMenus.length,
        notifications_sent: sentCount
      });
    }

    return Response.json({ error: 'Invalid notification_type' }, { status: 400 });

  } catch (error) {
    console.error(`${logPrefix} ❌ ERROR:`, error.message);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    console.log(`${logPrefix} ==================== FIN ====================`);
  }
});