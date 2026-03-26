import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    console.log('📧 sendReservationEmails iniciado');
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Verificar autenticación
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'No autorizado' }, { status: 401 });
        }
        
        const body = await req.json();
        const { reserva_id } = body;

        if (!reserva_id) {
            return Response.json({ error: 'Falta reserva_id' }, { status: 400 });
        }

        console.log('📋 Buscando reserva:', reserva_id);

        // Obtener la reserva con privilegios de servicio
        const allReservas = await base44.asServiceRole.entities.Reserva.list();
        const reserva = allReservas.find(r => r.id === reserva_id);
        
        if (!reserva) {
            return Response.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        console.log('✅ Reserva encontrada:', {
            codigo: reserva.codigo_recogida,
            estudiante: reserva.student_email,
            cafeteria: reserva.cafeteria
        });

        // Buscar el email de la cafetería
        const allCafeterias = await base44.asServiceRole.entities.Cafeteria.list();
        const cafeteriaEntity = allCafeterias.find(c => c.nombre === reserva.cafeteria);
        
        let cafeteriaEmails = [];
        
        // Buscar usuarios administradores de la cafetería
        if (cafeteriaEntity) {
            console.log('📍 Cafetería encontrada:', cafeteriaEntity.nombre, 'ID:', cafeteriaEntity.id);
            
            const allUsers = await base44.asServiceRole.entities.User.list();
            
            // Buscar TODOS los usuarios con acceso a esta cafetería
            const cafeteriaUsers = allUsers.filter(u => {
                // Verificar por cafeterias_asignadas (array de IDs)
                const hasAssigned = u.cafeterias_asignadas && 
                    Array.isArray(u.cafeterias_asignadas) &&
                    u.cafeterias_asignadas.includes(cafeteriaEntity.id);
                
                // Verificar por cafeteria_info (objeto con id o nombre)
                const hasCafeteriaInfo = u.cafeteria_info && 
                    (u.cafeteria_info.id === cafeteriaEntity.id || 
                     u.cafeteria_info.nombre_cafeteria === cafeteriaEntity.nombre);
                
                // Verificar rol apropiado
                const hasRole = u.app_role === 'cafeteria' || u.app_role === 'manager' || u.app_role === 'admin';
                
                return hasRole && (hasAssigned || hasCafeteriaInfo);
            });
            
            cafeteriaEmails = cafeteriaUsers.map(u => u.email).filter(Boolean);
            
            console.log('📧 Emails de cafetería encontrados:', cafeteriaEmails);
            
            if (cafeteriaEmails.length === 0) {
                console.warn('⚠️ No se encontraron usuarios asignados a cafetería:', reserva.cafeteria);
                console.log('📋 Usuarios con roles de cafetería/manager:', allUsers.filter(u => u.app_role === 'cafeteria' || u.app_role === 'manager').map(u => ({
                    email: u.email,
                    role: u.app_role,
                    cafeterias_asignadas: u.cafeterias_asignadas,
                    cafeteria_info: u.cafeteria_info
                })));
            }
        } else {
            console.warn('⚠️ No se encontró entidad Cafeteria para:', reserva.cafeteria);
        }

        const metodoPago = reserva.pagado_con_bono ? 'Bono PlatPal' : 'Tarjeta';
        const precioTexto = reserva.pagado_con_bono ? 'GRATIS (Bono)' : `€${reserva.precio_total.toFixed(2)}`;

        // EMAIL AL ESTUDIANTE
        const emailEstudiante = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ ¡Reserva Confirmada!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                    Hola <strong>${reserva.student_name || 'Estudiante'}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                    Tu menú ha sido reservado con éxito. Aquí están los detalles:
                </p>

                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
                    <h2 style="color: #059669; margin: 0 0 15px 0; font-size: 20px;">📋 Detalles de tu Reserva</h2>
                    
                    <p style="margin: 8px 0; color: #374151;">
                        <strong>🍽️ Menú:</strong> ${reserva.menus_detalle}
                    </p>
                    <p style="margin: 8px 0; color: #374151;">
                        <strong>🏢 Cafetería:</strong> ${reserva.cafeteria}
                    </p>
                    <p style="margin: 8px 0; color: #374151;">
                        <strong>📍 Campus:</strong> ${reserva.campus}
                    </p>
                    <p style="margin: 8px 0; color: #374151;">
                        <strong>💳 Método de pago:</strong> ${metodoPago}
                    </p>
                    <p style="margin: 8px 0; color: #374151;">
                        <strong>💰 Total:</strong> <span style="color: #059669; font-size: 18px;">${precioTexto}</span>
                    </p>
                </div>

                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 12px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 16px;">
                        🎫 Tu Código de Recogida
                    </p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                            ${reserva.codigo_recogida}
                        </span>
                    </div>
                    <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                        Muestra este código al personal de la cafetería
                    </p>
                </div>

                ${reserva.envase_propio ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        ♻️ <strong>Recuerda traer tu envase propio</strong> para recibir tu descuento
                    </p>
                </div>
                ` : ''}

                <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <strong>💚 Gracias por usar PlatPal</strong><br>
                        Has contribuido a reducir el desperdicio alimentario y apoyar la sostenibilidad en tu campus.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>PlatPal - Menús sostenibles para tu campus</p>
            </div>
        </div>
        `;

        let emailsSent = {
            student: false,
            cafeteria: false
        };

        // Enviar email al estudiante
        try {
            await base44.integrations.Core.SendEmail({
                from_name: 'PlatPal',
                to: reserva.student_email,
                subject: `✅ Reserva Confirmada - Código: ${reserva.codigo_recogida}`,
                body: emailEstudiante
            });
            console.log('✅ Email enviado al estudiante:', reserva.student_email);
            emailsSent.student = true;
        } catch (emailError) {
            console.error('❌ Error enviando email al estudiante:', emailError.message);
        }

        // EMAIL A LA CAFETERÍA (enviar a todos los usuarios asignados)
        if (cafeteriaEmails.length > 0) {
            const emailCafeteria = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nuevo Pedido</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                        Hola equipo de <strong>${reserva.cafeteria}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                        Tenéis un nuevo pedido listo para preparar:
                    </p>

                    <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
                        <h2 style="color: #d97706; margin: 0 0 15px 0; font-size: 20px;">📋 Detalles del Pedido</h2>
                        
                        <p style="margin: 8px 0; color: #374151;">
                            <strong>👤 Cliente:</strong> ${reserva.student_name || reserva.student_email}
                        </p>
                        <p style="margin: 8px 0; color: #374151;">
                            <strong>📧 Email:</strong> ${reserva.student_email}
                        </p>
                        <p style="margin: 8px 0; color: #374151;">
                            <strong>🍽️ Menú:</strong> ${reserva.menus_detalle}
                        </p>
                        <p style="margin: 8px 0; color: #374151;">
                            <strong>💳 Método de pago:</strong> ${metodoPago}
                        </p>
                        <p style="margin: 8px 0; color: #374151;">
                            <strong>💰 Total:</strong> <span style="color: #d97706; font-size: 18px;">${precioTexto}</span>
                        </p>
                    </div>

                    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 16px;">
                            🎫 Código de Recogida
                        </p>
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                                ${reserva.codigo_recogida}
                            </span>
                        </div>
                    </div>

                    ${reserva.envase_propio ? `
                    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #065f46; font-size: 14px;">
                            ♻️ <strong>El cliente traerá su propio envase</strong>
                        </p>
                    </div>
                    ` : ''}

                    <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                            Puedes gestionar este pedido desde tu panel en PlatPal.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p>PlatPal - Panel de Cafeterías</p>
                </div>
            </div>
            `;

            // Enviar a todos los usuarios de la cafetería
            for (const cafeteriaEmail of cafeteriaEmails) {
                try {
                    await base44.integrations.Core.SendEmail({
                        from_name: 'PlatPal',
                        to: cafeteriaEmail,
                        subject: `🔔 Nuevo Pedido - ${reserva.student_name || reserva.student_email} - Código: ${reserva.codigo_recogida}`,
                        body: emailCafeteria
                    });
                    console.log('✅ Email enviado a la cafetería:', cafeteriaEmail);
                    emailsSent.cafeteria = true;
                } catch (emailError) {
                    console.error('❌ Error enviando email a cafetería:', cafeteriaEmail, emailError.message);
                }
            }
        } else {
            console.warn('⚠️ No se encontró ningún email de cafetería para:', reserva.cafeteria);
        }

        return Response.json({ 
            success: true,
            emails_sent: emailsSent,
            cafeteria_emails: cafeteriaEmails.length > 0 ? cafeteriaEmails : ['no encontrado'],
            reserva_codigo: reserva.codigo_recogida
        });

    } catch (error) {
        console.error('❌ Error en sendReservationEmails:', error);
        return Response.json({ 
            error: 'Error enviando emails',
            details: error.message 
        }, { status: 500 });
    }
});