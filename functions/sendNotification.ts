import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticación
    const user = await base44.auth.me();
    if (!user || (user.app_role !== 'admin' && user.app_role !== 'cafeteria' && user.app_role !== 'manager')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, target_users, notification_type } = await req.json();

    if (!title || !body) {
      return Response.json({ 
        error: 'Missing required fields',
        details: 'title and body are required' 
      }, { status: 400 });
    }

    // Obtener usuarios que tienen notificaciones activadas
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    let targetUsers = allUsers.filter(u => 
      u.notifications_enabled === true &&
      u.email // Asegurar que tiene email
    );

    // Filtrar por tipo de notificación si se especifica
    if (notification_type && notification_type !== 'all') {
      targetUsers = targetUsers.filter(u => 
        u.notification_preferences?.[notification_type] === true
      );
    }

    // Filtrar por usuarios específicos si se especifica
    if (target_users && Array.isArray(target_users) && target_users.length > 0) {
      targetUsers = targetUsers.filter(u => target_users.includes(u.email));
    }

    // Aquí normalmente enviarías notificaciones push reales
    // Por ahora, registramos el intento
    console.log(`📧 Sending notification to ${targetUsers.length} users`);
    console.log(`📝 Title: ${title}`);
    console.log(`📄 Body: ${body}`);

    // En una implementación real, aquí usarías un servicio como:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Push API del navegador
    
    // Ejemplo de estructura que enviarías a un servicio de notificaciones:
    const notificationPayload = {
      title,
      body,
      icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png',
      badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png',
      data: {
        url: '/',
        timestamp: new Date().toISOString()
      }
    };

    return Response.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`,
      recipients: targetUsers.length,
      notification: notificationPayload
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});