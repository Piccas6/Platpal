import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    console.log('📧 sendReservationEmails iniciado');
    
    try {
        const base44 = createClientFromRequest(req);

        // Funciona tanto con usuario autenticado (bono) como desde serviceRole (webhook Stripe)
        let isAuthorized = false;
        try {
            const user = await base44.auth.me();
            isAuthorized = !!user;
        } catch {
            // Si no hay usuario, verificar si viene desde service role (webhook)
            isAuthorized = req.headers.get('Authorization')?.includes('service') || false;
        }

        // Aceptar también llamadas sin auth (desde webhook interno)
        const body = await req.json();
        const { reserva_id } = body;

        if (!reserva_id) {
            return Response.json({ error: 'Falta reserva_id' }, { status: 400 });
        }

        console.log('📋 Buscando reserva:', reserva_id);

        const allReservas = await base44.asServiceRole.entities.Reserva.list();
        const reserva = allReservas.find(r => r.id === reserva_id);

        if (!reserva) {
            return Response.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        const allUsers = await base44.asServiceRole.entities.User.list();
        const studentUser = allUsers.find(u => u.email === reserva.student_email);
        const studentPhone = studentUser?.telefono;
        const studentWhatsappApiKey = studentUser?.whatsapp_api_key; // API key personal del usuario

        // Buscar emails de la cafetería
        const allCafeterias = await base44.asServiceRole.entities.Cafeteria.list();
        const cafeteriaEntity = allCafeterias.find(c => c.nombre === reserva.cafeteria);
        let cafeteriaEmails = [];

        if (cafeteriaEntity) {
            const cafeteriaUsers = allUsers.filter(u => {
                const hasAssigned = u.cafeterias_asignadas?.includes(cafeteriaEntity.id);
                const hasCafeteriaInfo = u.cafeteria_info &&
                    (u.cafeteria_info.id === cafeteriaEntity.id ||
                     u.cafeteria_info.nombre_cafeteria === cafeteriaEntity.nombre);
                const hasRole = ['cafeteria', 'manager', 'admin'].includes(u.app_role);
                return hasRole && (hasAssigned || hasCafeteriaInfo);
            });
            cafeteriaEmails = cafeteriaUsers.map(u => u.email).filter(Boolean);
        }

        const metodoPago = reserva.pagado_con_bono ? 'Bono PlatPal' : 'Tarjeta';
        const precioTexto = reserva.pagado_con_bono ? 'GRATIS (Bono)' : `€${(reserva.precio_total || 0).toFixed(2)}`;

        const emailEstudiante = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ ¡Reserva Confirmada!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #374151;">Hola <strong>${reserva.student_name || 'Estudiante'}</strong>,</p>
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 8px 0; color: #374151;"><strong>🍽️ Menú:</strong> ${reserva.menus_detalle}</p>
                    <p style="margin: 8px 0; color: #374151;"><strong>🏢 Cafetería:</strong> ${reserva.cafeteria}</p>
                    <p style="margin: 8px 0; color: #374151;"><strong>📍 Campus:</strong> ${reserva.campus}</p>
                    <p style="margin: 8px 0; color: #374151;"><strong>💳 Pago:</strong> ${metodoPago} · <strong>${precioTexto}</strong></p>
                </div>
                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; text-align: center;">
                    <p style="color: #92400e; font-weight: 600;">🎫 Tu Código de Recogida</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <span style="font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 4px; font-family: monospace;">${reserva.codigo_recogida}</span>
                    </div>
                    <p style="color: #92400e; font-size: 14px;">Muestra este código en la cafetería</p>
                </div>
                ${reserva.envase_propio ? `<div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 8px;"><p style="margin:0; color: #92400e;">♻️ <strong>Recuerda traer tu envase propio</strong></p></div>` : ''}
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">💚 Gracias por usar PlatPal — menús sostenibles para tu campus.</p>
            </div>
        </div>`;

        let emailsSent = { student: false, cafeteria: false };
        let whatsappSent = false;

        // Email al estudiante
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'PlatPal',
                to: reserva.student_email,
                subject: `✅ Reserva Confirmada - Código: ${reserva.codigo_recogida}`,
                body: emailEstudiante
            });
            emailsSent.student = true;
            console.log('✅ Email enviado al estudiante');
        } catch (e) {
            console.error('❌ Error email estudiante:', e.message);
        }

        // WhatsApp al estudiante (solo si tiene teléfono Y su propia API key de CallMeBot)
        if (studentPhone && studentWhatsappApiKey) {
            try {
                let phone = studentPhone.replace(/[\s\-\(\)]/g, '');
                if (!phone.startsWith('+')) phone = '+34' + phone;
                phone = phone.replace('+', '');

                const mensaje = encodeURIComponent(
                    `✅ *Reserva confirmada en PlatPal*\n\n` +
                    `🍽️ *Menú:* ${reserva.menus_detalle}\n` +
                    `🏢 *Cafetería:* ${reserva.cafeteria}\n` +
                    `💰 *Total:* ${precioTexto}\n\n` +
                    `🎫 *Código de recogida:*\n*${reserva.codigo_recogida}*\n\n` +
                    `Muéstralo en la cafetería.` +
                    `${reserva.envase_propio ? '\n\n♻️ Trae tu envase propio.' : ''}\n\n` +
                    `_PlatPal_`
                );

                const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${mensaje}&apikey=${studentWhatsappApiKey}`;
                const waResp = await fetch(waUrl);
                whatsappSent = waResp.ok;
                console.log('📱 WhatsApp status:', waResp.status);
            } catch (e) {
                console.error('❌ Error WhatsApp:', e.message);
            }
        } else if (studentPhone && !studentWhatsappApiKey) {
            console.log('ℹ️ Tiene teléfono pero no ha activado CallMeBot todavía');
        }

        // Emails a la cafetería
        const emailCafeteria = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nuevo Pedido</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px;">
                <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 8px 0; color: #374151;"><strong>👤 Cliente:</strong> ${reserva.student_name || reserva.student_email}</p>
                    <p style="margin: 8px 0; color: #374151;"><strong>🍽️ Menú:</strong> ${reserva.menus_detalle}</p>
                    <p style="margin: 8px 0; color: #374151;"><strong>💳 Pago:</strong> ${metodoPago} · ${precioTexto}</p>
                    ${reserva.envase_propio ? '<p style="margin: 8px 0; color: #374151;">♻️ <strong>Trae envase propio</strong></p>' : ''}
                </div>
                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; text-align: center;">
                    <p style="color: #92400e; font-weight: 600;">🎫 Código de Recogida</p>
                    <span style="font-size: 36px; font-weight: bold; color: #d97706; letter-spacing: 4px; font-family: monospace;">${reserva.codigo_recogida}</span>
                </div>
            </div>
        </div>`;

        for (const email of cafeteriaEmails) {
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: 'PlatPal',
                    to: email,
                    subject: `🔔 Nuevo Pedido - Código: ${reserva.codigo_recogida}`,
                    body: emailCafeteria
                });
                emailsSent.cafeteria = true;
            } catch (e) {
                console.error('❌ Error email cafetería:', email, e.message);
            }
        }

        return Response.json({
            success: true,
            emails_sent: emailsSent,
            whatsapp_sent: whatsappSent,
            reserva_codigo: reserva.codigo_recogida
        });

    } catch (error) {
        console.error('❌ Error en sendReservationEmails:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});