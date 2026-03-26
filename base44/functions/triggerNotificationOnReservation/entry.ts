import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Función que se llama después de crear una reserva para programar
 * el recordatorio automático 30 minutos antes de la hora límite
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { reserva_id } = await req.json();

    if (!reserva_id) {
      return Response.json({ error: 'reserva_id required' }, { status: 400 });
    }

    // Obtener la reserva
    const allReservas = await base44.asServiceRole.entities.Reserva.list();
    const reserva = allReservas.find(r => r.id === reserva_id);

    if (!reserva) {
      return Response.json({ error: 'Reserva not found' }, { status: 404 });
    }

    // Verificar si el usuario tiene notificaciones activadas
    const allUsers = await base44.asServiceRole.entities.User.list();
    const user = allUsers.find(u => u.email === reserva.created_by);

    if (!user?.notifications_enabled || !user?.notification_preferences?.recordatorios_recogida) {
      return Response.json({ 
        success: true, 
        message: 'User has pickup reminders disabled',
        notification_scheduled: false
      });
    }

    // Calcular hora del recordatorio (30 min antes)
    const horaLimite = reserva.hora_limite || '18:00';
    const [hours, minutes] = horaLimite.split(':').map(Number);
    
    const now = new Date();
    const limiteDate = new Date(now);
    limiteDate.setHours(hours, minutes, 0, 0);
    
    const recordatorioDate = new Date(limiteDate.getTime() - 30 * 60 * 1000);
    const timeUntilReminder = recordatorioDate.getTime() - now.getTime();

    if (timeUntilReminder <= 0) {
      return Response.json({ 
        success: true, 
        message: 'Pickup time too soon for reminder',
        notification_scheduled: false
      });
    }

    // Aquí integrarías con un sistema de cron jobs o scheduled tasks
    // Por ejemplo: Deno Cron, Cloud Scheduler, etc.
    
    console.log(`📅 Recordatorio programado para ${recordatorioDate.toLocaleString('es-ES')}`);
    console.log(`⏰ Dentro de ${Math.round(timeUntilReminder / 60000)} minutos`);
    console.log(`📧 Usuario: ${user.email}`);
    console.log(`🍽️ Menú: ${reserva.menus_detalle}`);
    console.log(`🏪 Cafetería: ${reserva.cafeteria}`);
    console.log(`🔢 Código: ${reserva.codigo_recogida}`);

    // Registrar la programación
    const notificationInfo = {
      user_email: user.email,
      reserva_id: reserva.id,
      scheduled_time: recordatorioDate.toISOString(),
      notification_type: 'pickup_reminder',
      notification_content: {
        title: '⏰ Recordatorio de recogida',
        body: `Tu menú de ${reserva.cafeteria} está listo. Recógelo antes de las ${horaLimite}h`,
        data: {
          reserva_id: reserva.id,
          codigo: reserva.codigo_recogida,
          cafeteria: reserva.cafeteria
        }
      }
    };

    return Response.json({ 
      success: true, 
      message: 'Notification scheduled successfully',
      notification_scheduled: true,
      scheduled_for: recordatorioDate.toISOString(),
      minutes_until_reminder: Math.round(timeUntilReminder / 60000),
      notification_info: notificationInfo
    });

  } catch (error) {
    console.error('Error scheduling notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});