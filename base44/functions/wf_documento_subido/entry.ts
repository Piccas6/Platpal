import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { cafeteria_id, tipo, file_name } = body;

    if (!cafeteria_id || !tipo || !file_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Obtener información de la cafetería
    const cafeteria = await base44.asServiceRole.entities.Cafeteria.list();
    const cafeteriaData = cafeteria.find(c => c.id === cafeteria_id);

    if (!cafeteriaData) {
      return Response.json({ error: 'Cafeteria not found' }, { status: 404 });
    }

    // Notificar al equipo de revisión
    const adminEmails = ['admin@platpal.com']; // TODO: obtener de configuración

    for (const adminEmail of adminEmails) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `Nuevo documento subido - ${cafeteriaData.nombre}`,
        body: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10B981;">Nuevo Documento Pendiente de Revisión</h2>
              <p><strong>Cafetería:</strong> ${cafeteriaData.nombre}</p>
              <p><strong>Tipo de documento:</strong> ${tipo}</p>
              <p><strong>Nombre del archivo:</strong> ${file_name}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              <p style="margin-top: 30px;">
                <a href="https://platpal.app/admin/cafeterias/${cafeteria_id}" 
                   style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Revisar Documento
                </a>
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Este documento debe ser revisado en un plazo máximo de 48 horas.
              </p>
            </body>
          </html>
        `
      });
    }

    return Response.json({ 
      success: true,
      message: 'Notificación enviada al equipo de revisión'
    });

  } catch (error) {
    console.error('Error en wf_documento_subido:', error);
    return Response.json({ 
      error: error.message || 'Error al procesar workflow'
    }, { status: 500 });
  }
});