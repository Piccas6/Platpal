import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { cafeteria_id, email, representante } = body;

    if (!cafeteria_id || !email || !representante) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generar token de verificación
    const verificationToken = Math.random().toString(36).substring(2, 15);
    const verificationLink = `https://platpal.app/verify-email?token=${verificationToken}&cafeteria=${cafeteria_id}`;

    // Enviar email de verificación
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'Confirma tu email — Platpal Partners',
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10B981;">Bienvenido a PlatPal Partners</h2>
            <p>Hola ${representante},</p>
            <p>Gracias por registrarte en Platpal Partners. Confirma tu email haciendo clic en el siguiente enlace:</p>
            <p style="margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Confirmar Email
              </a>
            </p>
            <p>Después de confirmar, podrás subir tus documentos y continuar el onboarding.</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Si no has solicitado este registro, puedes ignorar este mensaje.
            </p>
            <p>Saludos,<br>Equipo Platpal</p>
          </body>
        </html>
      `
    });

    return Response.json({ 
      success: true,
      message: 'Email de verificación enviado correctamente'
    });

  } catch (error) {
    console.error('Error en wf_registro_cafeteria_iniciar:', error);
    return Response.json({ 
      error: error.message || 'Error al procesar workflow'
    }, { status: 500 });
  }
});