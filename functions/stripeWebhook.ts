import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    const logPrefix = '🔔 [WEBHOOK]';
    console.log(`${logPrefix} ==================== INICIO ====================`);
    
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');
        
        if (!signature) {
            console.error(`${logPrefix} ❌ Sin firma de Stripe`);
            return Response.json({ received: true, error: 'No signature' }, { status: 200 });
        }

        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!webhookSecret || !stripeKey) {
            console.error(`${logPrefix} ❌ Faltan credenciales de Stripe`);
            return Response.json({ received: true, error: 'Missing credentials' }, { status: 200 });
        }

        let event;
        try {
            const stripe = new Stripe(stripeKey);
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
            console.log(`${logPrefix} ✅ Evento verificado:`, event.type);
        } catch (err) {
            console.error(`${logPrefix} ❌ Error verificando firma:`, err.message);
            return Response.json({ received: true, error: 'Invalid signature' }, { status: 200 });
        }

        const fakeReq = new Request('http://localhost', {
            headers: new Headers({ 'Authorization': 'Bearer service-role-token' })
        });
        const base44 = createClientFromRequest(fakeReq);

        // EVENTO: Checkout completado (primera vez o pago único)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customerEmail = session.customer_email || session.customer_details?.email;
            
            console.log(`${logPrefix} 💳 CHECKOUT COMPLETADO`);
            console.log(`${logPrefix} Customer Email:`, customerEmail);
            console.log(`${logPrefix} Mode:`, session.mode);
            console.log(`${logPrefix} Metadata:`, session.metadata);

            // CASO 1: Suscripción de Bono (desde Payment Link o Checkout)
            if (session.mode === 'subscription') {
                console.log(`${logPrefix} 🔄 Procesando SUSCRIPCIÓN de bono...`);
                
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (!subscriptionId || !customerEmail) {
                    console.error(`${logPrefix} ❌ Faltan datos de suscripción`);
                    return Response.json({ received: true, error: 'Missing subscription data' }, { status: 200 });
                }

                console.log(`${logPrefix} Subscription ID:`, subscriptionId);
                console.log(`${logPrefix} Customer ID:`, customerId);

                try {
                    // Buscar el BonoPack activo (asumimos que hay solo uno)
                    const allBonoPacks = await base44.asServiceRole.entities.BonoPack.list();
                    const activePack = allBonoPacks.find(p => p.activo === true);

                    if (!activePack) {
                        console.error(`${logPrefix} ❌ No hay BonoPack activo`);
                        return Response.json({ received: true, error: 'No active BonoPack' }, { status: 200 });
                    }

                    console.log(`${logPrefix} ✅ BonoPack encontrado:`, activePack.nombre);

                    // Buscar si ya existe una BonoCompra para este subscription_id
                    const allCompras = await base44.asServiceRole.entities.BonoCompra.list();
                    let bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);

                    if (!bonoCompra) {
                        // Crear nueva BonoCompra
                        console.log(`${logPrefix} 📝 Creando nueva BonoCompra...`);
                        bonoCompra = await base44.asServiceRole.entities.BonoCompra.create({
                            bono_pack_id: activePack.id,
                            user_email: customerEmail,
                            cantidad_menus: activePack.cantidad_menus,
                            precio_pagado: activePack.precio_mensual,
                            stripe_subscription_id: subscriptionId,
                            stripe_customer_id: customerId,
                            subscription_status: 'active',
                            fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            menus_usados_mes_actual: 0
                        });
                        console.log(`${logPrefix} ✅ BonoCompra creada:`, bonoCompra.id);
                    } else {
                        // Actualizar BonoCompra existente
                        console.log(`${logPrefix} 🔄 Actualizando BonoCompra existente:`, bonoCompra.id);
                        await base44.asServiceRole.entities.BonoCompra.update(bonoCompra.id, {
                            subscription_status: 'active',
                            stripe_subscription_id: subscriptionId,
                            stripe_customer_id: customerId,
                            fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        });
                    }

                    // Dar créditos iniciales al usuario
                    const allUsers = await base44.asServiceRole.entities.User.list();
                    const user = allUsers.find(u => u.email === customerEmail);

                    if (user) {
                        console.log(`${logPrefix} 👤 Usuario encontrado:`, user.email);
                        await base44.asServiceRole.entities.User.update(user.id, {
                            creditos_menu_bono: activePack.cantidad_menus,
                            tiene_subscripcion_activa: true,
                            subscripcion_id: bonoCompra.id
                        });
                        console.log(`${logPrefix} ✅ Usuario actualizado con ${activePack.cantidad_menus} créditos`);

                            // Notificar al usuario sobre su suscripción activada
                            try {
                                await base44.asServiceRole.entities.Notification.create({
                                    type: 'system',
                                    title: '🎉 ¡Bono activado!',
                                    message: `Tu suscripción ha sido activada. Tienes ${activePack.cantidad_menus} menús disponibles este mes.`,
                                    target_users: [customerEmail],
                                    notification_data: {
                                        bono_compra_id: bonoCompra.id,
                                        cantidad_menus: activePack.cantidad_menus,
                                        fecha_renovacion: bonoCompra.fecha_renovacion
                                    },
                                    sent_at: new Date().toISOString(),
                                    sent_by: 'system'
                                });

                                await base44.asServiceRole.integrations.Core.SendEmail({
                                    to: customerEmail,
                                    subject: '🎉 ¡Tu Bono PlatPal está activado!',
                                    body: `¡Hola!\n\nTu suscripción mensual ha sido activada correctamente.\n\n✅ Tienes ${activePack.cantidad_menus} menús disponibles este mes\n📅 Renovación: ${new Date(bonoCompra.fecha_renovacion).toLocaleDateString()}\n\n¡Disfruta de tus menús sostenibles!\n\nPlatPal`
                                });
                                console.log(`${logPrefix} ✅ Notificación de bono enviada al usuario`);
                            } catch (notifErr) {
                                console.error(`${logPrefix} ⚠️ Error enviando notificación de bono:`, notifErr.message);
                            }
                        } else {
                            console.warn(`${logPrefix} ⚠️ Usuario no encontrado:`, customerEmail);
                        }

                    console.log(`${logPrefix} 🎉 Suscripción activada correctamente`);
                    return Response.json({ received: true, success: true, type: 'subscription_created' }, { status: 200 });

                } catch (error) {
                    console.error(`${logPrefix} ❌ Error procesando suscripción:`, error.message);
                    return Response.json({ received: true, error: error.message }, { status: 200 });
                }
            }

            // CASO 2: Pago normal de menú (payment mode)
            const reservaId = session.client_reference_id;
            if (reservaId && session.mode === 'payment') {
                console.log(`${logPrefix} 🍽️ Procesando pago de menú...`);
                
                try {
                    // Obtener la reserva para verificar si tiene código de referido
                    const allReservas = await base44.asServiceRole.entities.Reserva.list();
                    const reserva = allReservas.find(r => r.id === reservaId);
                    
                    await base44.asServiceRole.entities.Reserva.update(reservaId, {
                        estado: 'pagado',
                        payment_status: 'completed',
                        stripe_payment_id: session.id
                    });
                    
                    console.log(`${logPrefix} ✅ Reserva ${reservaId} actualizada`);

                    // Notificar al estudiante sobre pago confirmado
                    if (reserva) {
                        try {
                            await base44.asServiceRole.entities.Notification.create({
                                type: 'order_confirmed',
                                title: '✅ ¡Pago confirmado!',
                                message: `Tu pedido #${reserva.codigo_recogida} ha sido confirmado. Recógelo en ${reserva.cafeteria}`,
                                target_users: [reserva.student_email || customerEmail],
                                notification_data: {
                                    reserva_id: reservaId,
                                    codigo_recogida: reserva.codigo_recogida,
                                    cafeteria: reserva.cafeteria,
                                    menu: reserva.menus_detalle,
                                    precio: reserva.precio_total
                                },
                                sent_at: new Date().toISOString(),
                                sent_by: 'system'
                            });
                            console.log(`${logPrefix} ✅ Notificación de pago enviada al estudiante`);
                        } catch (notifErr) {
                            console.error(`${logPrefix} ⚠️ Error enviando notificación al estudiante:`, notifErr.message);
                        }
                    }

                    // TRANSFERENCIA AUTOMÁTICA A CAFETERÍA
                    if (reserva && reserva.cafeteria && !reserva.pagado_con_bono) {
                        try {
                            // Buscar cafetería y usuario asociado
                            const allCafeterias = await base44.asServiceRole.entities.Cafeteria.list();
                            const cafeteria = allCafeterias.find(c => c.nombre === reserva.cafeteria);
                            
                            if (cafeteria) {
                                const allUsers = await base44.asServiceRole.entities.User.list();
                                const cafeteriaUser = allUsers.find(u => 
                                    u.cafeterias_asignadas?.includes(cafeteria.id) && 
                                    u.stripe_account_id &&
                                    u.stripe_onboarding_completed
                                );

                                if (cafeteriaUser?.stripe_account_id) {
                                    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
                                    const stripe = new Stripe(stripeKey);
                                    
                                    // Calcular montos (70% para cafetería, 30% para PlatPal)
                                    const totalAmount = Math.round(reserva.precio_total * 100); // en centavos
                                    const cafeteriaAmount = Math.round(totalAmount * 0.70);
                                    
                                    // Crear transferencia
                                    const transfer = await stripe.transfers.create({
                                        amount: cafeteriaAmount,
                                        currency: 'eur',
                                        destination: cafeteriaUser.stripe_account_id,
                                        transfer_group: `ORDER_${reservaId}`,
                                        description: `Pago menú - ${reserva.menus_detalle}`,
                                        metadata: {
                                            reserva_id: reservaId,
                                            cafeteria: reserva.cafeteria
                                        }
                                    });

                                    console.log(`${logPrefix} 💸 Transferencia creada: €${(cafeteriaAmount/100).toFixed(2)} a ${reserva.cafeteria} (${transfer.id})`);

                                    // Notificar a la cafetería sobre la transferencia
                                    try {
                                       await base44.asServiceRole.entities.Notification.create({
                                           type: 'system',
                                           title: '💸 Transferencia recibida',
                                           message: `Se ha transferido €${(cafeteriaAmount/100).toFixed(2)} a tu cuenta por el pedido #${reserva.codigo_recogida}`,
                                           target_users: [cafeteriaUser.email],
                                           notification_data: {
                                               amount: cafeteriaAmount / 100,
                                               transfer_id: transfer.id,
                                               reserva_id: reservaId,
                                               cafeteria: reserva.cafeteria
                                           },
                                           sent_at: new Date().toISOString(),
                                           sent_by: 'system'
                                       });
                                       console.log(`${logPrefix} ✅ Notificación de transferencia enviada a cafetería`);
                                    } catch (notifErr) {
                                       console.error(`${logPrefix} ⚠️ Error enviando notificación de transferencia:`, notifErr.message);
                                    }
                                    } else {
                                    console.log(`${logPrefix} ⚠️ Cafetería sin cuenta Stripe Connect configurada: ${reserva.cafeteria}`);
                                    }
                            }
                        } catch (transferError) {
                            console.error(`${logPrefix} ❌ Error en transferencia automática:`, transferError.message);
                            
                            // Notificar al admin sobre el error
                            try {
                                await base44.asServiceRole.entities.Notification.create({
                                    type: 'system',
                                    title: '⚠️ Error en transferencia automática',
                                    message: `Error al transferir fondos para el pedido #${reserva.codigo_recogida}: ${transferError.message}`,
                                    target_users: ['piccas.entrepreneurship@gmail.com'],
                                    notification_data: {
                                        error: transferError.message,
                                        reserva_id: reservaId,
                                        cafeteria: reserva.cafeteria,
                                        amount: reserva.precio_total
                                    },
                                    sent_at: new Date().toISOString(),
                                    sent_by: 'system'
                                });
                                
                                await base44.asServiceRole.integrations.Core.SendEmail({
                                    to: 'piccas.entrepreneurship@gmail.com',
                                    subject: '⚠️ Error en Transferencia Automática',
                                    body: `Error al transferir fondos:\n\nReserva: ${reservaId}\nCafetería: ${reserva.cafeteria}\nMonto: €${reserva.precio_total.toFixed(2)}\nError: ${transferError.message}`
                                });
                            } catch (notifErr) {
                                console.error(`${logPrefix} ⚠️ Error enviando notificación de error:`, notifErr.message);
                            }
                        }
                    }

                    // Procesar código de referido si existe
                    if (reserva && reserva.referral_code) {
                        console.log(`${logPrefix} 🎁 Procesando código de referido: ${reserva.referral_code}`);
                        
                        try {
                            // Crear registro de uso del código
                            await base44.asServiceRole.entities.ReferralUse.create({
                                code: reserva.referral_code,
                                user_email: reserva.student_email || session.customer_email,
                                user_name: reserva.student_name || '',
                                reserva_id: reservaId,
                                status: 'completed',
                                discount_applied: reserva.referral_discount || 0.20
                            });
                            console.log(`${logPrefix} ✅ ReferralUse creado`);

                            // Actualizar contador del código
                            const allCodes = await base44.asServiceRole.entities.ReferralCode.list();
                            const refCode = allCodes.find(c => c.code === reserva.referral_code);
                            
                            if (refCode) {
                                const newCompletedOrders = (refCode.completed_orders || 0) + 1;
                                const newTotalUses = (refCode.total_uses || 0) + 1;
                                
                                // Calcular si se alcanzó un hito
                                const threshold = refCode.reward_threshold || 10;
                                const previousRewards = Math.floor((refCode.completed_orders || 0) / threshold);
                                const newRewards = Math.floor(newCompletedOrders / threshold);
                                
                                await base44.asServiceRole.entities.ReferralCode.update(refCode.id, {
                                    total_uses: newTotalUses,
                                    completed_orders: newCompletedOrders,
                                    rewards_earned: newRewards
                                });
                                console.log(`${logPrefix} ✅ ReferralCode actualizado: ${newCompletedOrders} pedidos completados`);

                                // Si se alcanzó un nuevo hito, crear recompensa
                                if (newRewards > previousRewards) {
                                    console.log(`${logPrefix} 🎉 ¡Nuevo hito alcanzado! ${newCompletedOrders} referidos`);
                                    
                                    await base44.asServiceRole.entities.ReferralReward.create({
                                        code: refCode.code,
                                        partner_name: refCode.partner_name,
                                        reward_type: 'menu_gratis',
                                        trigger_count: newCompletedOrders,
                                        delivered: false
                                    });
                                    console.log(`${logPrefix} ✅ ReferralReward creado`);

                                    // Enviar notificación al partner
                                    if (refCode.partner_email) {
                                        try {
                                            await base44.asServiceRole.integrations.Core.SendEmail({
                                                to: refCode.partner_email,
                                                subject: `🎉 ¡Hito alcanzado! ${newCompletedOrders} referidos en PlatPal`,
                                                body: `¡Felicidades ${refCode.partner_name}!\n\nHas alcanzado ${newCompletedOrders} referidos con tu código ${refCode.code}.\n\n🎁 Has ganado ${newRewards} menú(s) gratis.\n\nContacta con PlatPal para canjear tu recompensa.\n\n¡Gracias por colaborar con nosotros!`
                                            });
                                            console.log(`${logPrefix} ✅ Email de hito enviado a ${refCode.partner_email}`);
                                        } catch (emailErr) {
                                            console.error(`${logPrefix} ⚠️ Error enviando email de hito:`, emailErr.message);
                                        }
                                    }
                                }
                            }
                        } catch (refError) {
                            console.error(`${logPrefix} ⚠️ Error procesando referido:`, refError.message);
                        }
                    }

                    // Enviar emails de confirmación después del pago
                    try {
                        console.log(`${logPrefix} 📧 Enviando emails de confirmación...`);
                        await base44.asServiceRole.functions.invoke('sendReservationEmails', {
                            reserva_id: reservaId
                        });
                        console.log(`${logPrefix} ✅ Emails enviados`);
                    } catch (emailError) {
                        console.error(`${logPrefix} ⚠️ Error enviando emails:`, emailError.message);
                    }

                    // Enviar notificación personal al administrador
                    try {
                        if (reserva) {
                            await base44.asServiceRole.integrations.Core.SendEmail({
                                to: 'piccas.entrepreneurship@gmail.com',
                                subject: `✅ Pago Confirmado - ${reserva.cafeteria}`,
                                body: `
✅ Pago confirmado para reserva:

👤 Usuario: ${reserva.student_name || reserva.student_email}
📧 Email: ${reserva.student_email}
📍 Cafetería: ${reserva.cafeteria}
🏫 Campus: ${reserva.campus}
🍽️ Menú: ${reserva.menus_detalle}
💰 Precio: €${reserva.precio_total.toFixed(2)}
🔢 Código: ${reserva.codigo_recogida}
${reserva.envase_propio ? '♻️ Con envase propio' : ''}
${reserva.referral_code ? '🎟️ Código referido: ' + reserva.referral_code : ''}

💳 Estado: Pagado y confirmado

---
PlatPal - Menús Sostenibles
                                `.trim()
                            });
                            console.log(`${logPrefix} ✅ Notificación personal enviada`);
                        }
                    } catch (notifError) {
                        console.error(`${logPrefix} ⚠️ Error enviando notificación personal:`, notifError.message);
                    }
                    
                    return Response.json({ received: true, success: true, type: 'menu_payment' }, { status: 200 });
                } catch (error) {
                    console.error(`${logPrefix} ❌ Error actualizando reserva:`, error.message);
                    return Response.json({ received: true, error: error.message }, { status: 200 });
                }
            }
        }

        // EVENTO: Renovación mensual de suscripción
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            const subscriptionId = invoice.subscription;
            
            console.log(`${logPrefix} 🔄 RENOVACIÓN MENSUAL - Subscription:`, subscriptionId);

            if (!subscriptionId) {
                return Response.json({ received: true }, { status: 200 });
            }

            try {
                // Buscar la BonoCompra por subscription_id
                const allCompras = await base44.asServiceRole.entities.BonoCompra.list();
                const bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);

                if (!bonoCompra) {
                    console.log(`${logPrefix} ⚠️ No se encontró BonoCompra para subscription:`, subscriptionId);
                    return Response.json({ received: true }, { status: 200 });
                }

                console.log(`${logPrefix} Renovando créditos para:`, bonoCompra.user_email);

                // Buscar usuario y RESETEAR créditos (no sumar)
                const allUsers = await base44.asServiceRole.entities.User.list();
                const user = allUsers.find(u => u.email === bonoCompra.user_email);

                if (user) {
                    await base44.asServiceRole.entities.User.update(user.id, {
                        creditos_menu_bono: bonoCompra.cantidad_menus
                    });

                    // Resetear contador mensual
                    await base44.asServiceRole.entities.BonoCompra.update(bonoCompra.id, {
                        menus_usados_mes_actual: 0,
                        fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });

                    console.log(`${logPrefix} ✅ Créditos reseteados a: ${bonoCompra.cantidad_menus} menús`);
                    
                    // Notificar al usuario sobre la renovación
                    try {
                        await base44.asServiceRole.entities.Notification.create({
                            type: 'system',
                            title: '🔄 Bono renovado',
                            message: `Tu suscripción se ha renovado. Tienes ${bonoCompra.cantidad_menus} menús nuevos disponibles.`,
                            target_users: [bonoCompra.user_email],
                            notification_data: {
                                bono_compra_id: bonoCompra.id,
                                cantidad_menus: bonoCompra.cantidad_menus,
                                fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            },
                            sent_at: new Date().toISOString(),
                            sent_by: 'system'
                        });
                        
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: bonoCompra.user_email,
                            subject: '🔄 Tu Bono PlatPal se ha renovado',
                            body: `¡Hola!\n\nTu suscripción mensual se ha renovado automáticamente.\n\n✅ Tienes ${bonoCompra.cantidad_menus} menús nuevos disponibles\n📅 Próxima renovación: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n¡Disfruta!\n\nPlatPal`
                        });
                        console.log(`${logPrefix} ✅ Notificación de renovación enviada`);
                    } catch (notifErr) {
                        console.error(`${logPrefix} ⚠️ Error enviando notificación de renovación:`, notifErr.message);
                    }
                }

                return Response.json({ received: true, success: true, type: 'renewal' }, { status: 200 });
            } catch (error) {
                console.error(`${logPrefix} ❌ Error renovando suscripción:`, error.message);
                return Response.json({ received: true, error: error.message }, { status: 200 });
            }
        }

        // EVENTO: Suscripción cancelada
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const subscriptionId = subscription.id;
            
            console.log(`${logPrefix} ❌ SUSCRIPCIÓN CANCELADA:`, subscriptionId);

            try {
                const allCompras = await base44.asServiceRole.entities.BonoCompra.list();
                const bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);

                if (bonoCompra) {
                    await base44.asServiceRole.entities.BonoCompra.update(bonoCompra.id, {
                        subscription_status: 'cancelled'
                    });

                    const allUsers = await base44.asServiceRole.entities.User.list();
                    const user = allUsers.find(u => u.email === bonoCompra.user_email);

                    if (user) {
                        await base44.asServiceRole.entities.User.update(user.id, {
                            tiene_subscripcion_activa: false,
                            subscripcion_id: null
                        });
                    }

                    console.log(`${logPrefix} ✅ Suscripción marcada como cancelada`);
                    
                    // Notificar al usuario sobre la cancelación
                    try {
                        await base44.asServiceRole.entities.Notification.create({
                            type: 'system',
                            title: '❌ Suscripción cancelada',
                            message: 'Tu suscripción de bonos ha sido cancelada. Puedes reactivarla cuando quieras.',
                            target_users: [bonoCompra.user_email],
                            notification_data: {
                                bono_compra_id: bonoCompra.id,
                                subscription_id: subscriptionId
                            },
                            sent_at: new Date().toISOString(),
                            sent_by: 'system'
                        });
                        
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: bonoCompra.user_email,
                            subject: 'Suscripción PlatPal Cancelada',
                            body: `Hola,\n\nTu suscripción mensual ha sido cancelada.\n\nSi deseas reactivarla en el futuro, puedes hacerlo desde tu perfil.\n\n¡Gracias por usar PlatPal!\n\nPlatPal`
                        });
                        console.log(`${logPrefix} ✅ Notificación de cancelación enviada`);
                    } catch (notifErr) {
                        console.error(`${logPrefix} ⚠️ Error enviando notificación de cancelación:`, notifErr.message);
                    }
                }

                return Response.json({ received: true, success: true, type: 'cancellation' }, { status: 200 });
            } catch (error) {
                console.error(`${logPrefix} ❌ Error cancelando suscripción:`, error.message);
                return Response.json({ received: true, error: error.message }, { status: 200 });
            }
        }

        console.log(`${logPrefix} ℹ️ Evento ${event.type} ignorado`);
        return Response.json({ received: true, ignored: true }, { status: 200 });

    } catch (error) {
        console.error(`${logPrefix} ❌ ERROR GENERAL:`, error.message);
        return Response.json({ received: true, error: error.message }, { status: 200 });
    } finally {
        console.log(`${logPrefix} ==================== FIN ====================`);
    }
});