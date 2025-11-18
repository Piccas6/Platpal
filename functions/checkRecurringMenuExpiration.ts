import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Este endpoint puede llamarse sin autenticación (como cron job)
        // pero validamos que venga con un token de servicio
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.includes('service-role')) {
            return Response.json({ error: 'Unauthorized - service role required' }, { status: 401 });
        }

        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        const todayStr = today.toISOString().split('T')[0];
        const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

        // Buscar menús recurrentes que expiran en 3 días
        const allMenus = await base44.asServiceRole.entities.Menu.list();
        
        const expiringMenus = allMenus.filter(menu => 
            menu.es_recurrente && 
            menu.fecha_fin_recurrencia === threeDaysStr &&
            !menu.menu_padre_id // Solo menús padre
        );

        console.log(`📅 Encontrados ${expiringMenus.length} menús que expiran en 3 días`);

        const notificationsSent = [];

        for (const menu of expiringMenus) {
            try {
                // Buscar el usuario de la cafetería
                const allUsers = await base44.asServiceRole.entities.User.list();
                const allCafeterias = await base44.asServiceRole.entities.Cafeteria.list();
                
                const cafeteriaEntity = allCafeterias.find(c => c.nombre === menu.cafeteria);
                if (!cafeteriaEntity) {
                    console.warn(`⚠️ No se encontró cafetería: ${menu.cafeteria}`);
                    continue;
                }

                const cafeteriaUser = allUsers.find(u => 
                    (u.app_role === 'cafeteria' || u.app_role === 'manager' || u.app_role === 'admin') &&
                    u.cafeterias_asignadas && 
                    Array.isArray(u.cafeterias_asignadas) &&
                    u.cafeterias_asignadas.includes(cafeteriaEntity.id)
                );

                if (!cafeteriaUser) {
                    console.warn(`⚠️ No se encontró usuario para cafetería: ${menu.cafeteria}`);
                    continue;
                }

                // Enviar email de aviso
                const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Menú Recurrente Próximo a Expirar</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                            Hola equipo de <strong>${menu.cafeteria}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                            Te recordamos que uno de tus menús recurrentes está próximo a expirar:
                        </p>

                        <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
                            <h2 style="color: #d97706; margin: 0 0 15px 0; font-size: 20px;">📋 Detalles del Menú</h2>
                            
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>🍽️ Plato Principal:</strong> ${menu.plato_principal}
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>🥗 Acompañamiento:</strong> ${menu.plato_secundario}
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>📅 Fecha de Expiración:</strong> ${menu.fecha_fin_recurrencia}
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>📆 Días de la semana:</strong> ${menu.dias_semana?.join(', ') || 'No especificado'}
                            </p>
                        </div>

                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                                💡 <strong>Recomendación:</strong> Si deseas continuar ofreciendo este menú, puedes crear uno nuevo desde tu panel de cafetería.
                            </p>
                        </div>

                        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Puedes gestionar tus menús desde tu panel en PlatPal.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                        <p>PlatPal - Panel de Cafeterías</p>
                    </div>
                </div>
                `;

                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: 'PlatPal',
                    to: cafeteriaUser.email,
                    subject: `⏰ Menú Recurrente Expira en 3 Días - ${menu.plato_principal}`,
                    body: emailBody
                });

                console.log(`✅ Email enviado a ${cafeteriaUser.email} sobre menú: ${menu.plato_principal}`);
                notificationsSent.push({
                    menu_id: menu.id,
                    cafeteria: menu.cafeteria,
                    email: cafeteriaUser.email,
                    expiration_date: menu.fecha_fin_recurrencia
                });

            } catch (emailError) {
                console.error(`❌ Error enviando email para menú ${menu.id}:`, emailError);
            }
        }

        return Response.json({ 
            success: true,
            expiring_menus_found: expiringMenus.length,
            notifications_sent: notificationsSent.length,
            details: notificationsSent
        });

    } catch (error) {
        console.error('❌ Error en checkRecurringMenuExpiration:', error);
        return Response.json({ 
            error: 'Error verificando menús recurrentes',
            details: error.message 
        }, { status: 500 });
    }
});