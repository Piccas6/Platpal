import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { cafeteria_id } = body;

    if (!cafeteria_id) {
      return Response.json({ error: 'Missing cafeteria_id' }, { status: 400 });
    }

    // Obtener documentos de la cafetería
    const documentos = await base44.asServiceRole.entities.CafeteriaDocumento.filter({ 
      cafeteria_id 
    });

    // Verificar que estén los documentos requeridos
    const requiredDocs = ['cif', 'dni_representante'];
    const hasAllRequired = requiredDocs.every(tipo => 
      documentos.some(d => d.tipo === tipo)
    );

    if (!hasAllRequired) {
      return Response.json({ 
        error: 'Missing required documents',
        required: requiredDocs,
        uploaded: documentos.map(d => d.tipo)
      }, { status: 400 });
    }

    // TODO: Integración con servicio KYC externo (ComplyAdvantage, Onfido, etc.)
    // Por ahora, validación automática básica
    
    // Simular verificación automática
    const kycPassed = true; // En producción, esto vendría de la API externa

    if (kycPassed) {
      // Actualizar estado a kyc_validado
      await base44.asServiceRole.entities.Cafeteria.update(cafeteria_id, {
        estado_onboarding: 'kyc_validado'
      });

      // Crear audit log
      await base44.asServiceRole.entities.CafeteriaAudit.create({
        cafeteria_id,
        evento: 'kyc_validado',
        meta: {
          metodo: 'automatico',
          documentos_verificados: documentos.map(d => d.tipo)
        },
        actor: 'system',
        timestamp: new Date().toISOString()
      });

      // Ejecutar workflow de generación de contrato
      await base44.asServiceRole.functions.invoke('wf_generar_contrato', {
        cafeteria_id
      });

      return Response.json({ 
        success: true,
        message: 'KYC validado correctamente',
        next_step: 'contrato'
      });

    } else {
      // KYC falló - mantener en kyc_pendiente para revisión manual
      await base44.asServiceRole.entities.Cafeteria.update(cafeteria_id, {
        estado_onboarding: 'kyc_pendiente'
      });

      // Obtener datos de la cafetería
      const cafeterias = await base44.asServiceRole.entities.Cafeteria.list();
      const cafeteria = cafeterias.find(c => c.id === cafeteria_id);

      // Enviar email de fallo
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: cafeteria.email_contacto,
        subject: 'Verificación KYC pendiente - Platpal Partners',
        body: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #F59E0B;">Verificación Pendiente</h2>
              <p>Hola ${cafeteria.representante_legal},</p>
              <p>Necesitamos revisar manualmente tus documentos antes de continuar con el proceso de onboarding.</p>
              <p>Nuestro equipo se pondrá en contacto contigo en las próximas 48 horas.</p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              <p>Saludos,<br>Equipo Platpal</p>
            </body>
          </html>
        `
      });

      return Response.json({ 
        success: true,
        message: 'KYC pendiente de revisión manual'
      });
    }

  } catch (error) {
    console.error('Error en wf_kyc_automatic_check:', error);
    return Response.json({ 
      error: error.message || 'Error al procesar KYC'
    }, { status: 500 });
  }
});