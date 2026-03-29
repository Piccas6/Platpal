import { createClient } from 'npm:@base44/sdk@0.8.23';
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
        const appId = Deno.env.get('BASE44_APP_ID');
        
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

        // Inicializar SDK con service role (webhooks no tienen usuario autenticado)
        const base44 = createClient({ appId, defaultRole: 'serviceRole' });

        // EVENTO: Checkout completado
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customerEmail = session.customer_email || session.customer_details?.email;
            
            console.log(`${logPrefix} 💳 CHECKOUT COMPLETADO - Mode:`, session.mode);

            // CASO 1: Suscripción de Bono
            if (session.mode === 'subscription') {
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (!subscriptionId || !customerEmail) {
                    console.error(`${logPrefix} ❌ Faltan datos de suscripción`);
                    return Response.json({ received: true }, { status: 200 });
                }

                try {
                    const allBonoPacks = await base44.entities.BonoPack.list();
                    const activePack = allBonoPacks.find(p => p.activo === true);
                    if (!activePack) {
                        console.error(`${logPrefix} ❌ No hay BonoPack activo`);
                        return Response.json({ received: true }, { status: 200 });
                    }

                    const allCompras = await base44.entities.BonoCompra.list();
                    let bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);

                    if (!bonoCompra) {
                        bonoCompra = await base44.entities.BonoCompra.create({
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
                    } else {
                        await base44.entities.BonoCompra.update(bonoCompra.id, {
                            subscription_status: 'active',
                            stripe_customer_id: customerId,
                            fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        });
                    }

                    const allUsers = await base44.entities.User.list();
                    const user = allUsers.find(u => u.email === customerEmail);
                    if (user) {
                        await base44.entities.User.update(user.id, {
                            creditos_menu_bono: activePack.cantidad_menus,
                            tiene_subscripcion_activa: true,
                            subscripcion_id: bonoCompra.id
                        });

                        try {
                            await base44.integrations.Core.SendEmail({
                                to: customerEmail,
                                subject: '🎉 ¡Tu Bono PlatPal está activado!',
                                body: `¡Hola!\n\nTu suscripción mensual ha sido activada correctamente.\n\n✅ Tienes ${activePack.cantidad_menus} menús disponibles este mes\n📅 Renovación: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}\n\n¡Disfruta de tus menús sostenibles!\n\nPlatPal`
                            });
                        } catch (emailErr) {
                            console.error(`${logPrefix} ⚠️ Error email bono:`, emailErr.message);
                        }
                    }

                    return Response.json({ received: true, success: true, type: 'subscription_created' }, { status: 200 });
                } catch (error) {
                    console.error(`${logPrefix} ❌ Error procesando suscripción:`, error.message);
                    return Response.json({ received: true, error: error.message }, { status: 200 });
                }
            }

            // CASO 2: Pago normal de menú
            const reservaId = session.client_reference_id;
            if (reservaId && session.mode === 'payment') {
                try {
                    const allReservas = await base44.entities.Reserva.list();
                    const reserva = allReservas.find(r => r.id === reservaId);

                    await base44.entities.Reserva.update(reservaId, {
                        estado: 'pagado',
                        payment_status: 'completed',
                        stripe_payment_id: session.id
                    });
                    console.log(`${logPrefix} ✅ Reserva ${reservaId} marcada como pagada`);

                    // Transferencia a cafetería (si tiene Stripe Connect)
                    if (reserva?.cafeteria && !reserva.pagado_con_bono) {
                        try {
                            const allCafeterias = await base44.entities.Cafeteria.list();
                            const cafeteria = allCafeterias.find(c => c.nombre === reserva.cafeteria);
                            if (cafeteria) {
                                const allUsers = await base44.entities.User.list();
                                const cafeteriaUser = allUsers.find(u =>
                                    u.cafeterias_asignadas?.includes(cafeteria.id) &&
                                    u.stripe_account_id &&
                                    u.stripe_onboarding_completed
                                );
                                if (cafeteriaUser?.stripe_account_id) {
                                    const stripe = new Stripe(stripeKey);
                                    const cafeteriaAmount = Math.round(reserva.precio_total * 100 * 0.70);
                                    await stripe.transfers.create({
                                        amount: cafeteriaAmount,
                                        currency: 'eur',
                                        destination: cafeteriaUser.stripe_account_id,
                                        transfer_group: `ORDER_${reservaId}`,
                                        description: `Pago menú - ${reserva.menus_detalle}`,
                                        metadata: { reserva_id: reservaId, cafeteria: reserva.cafeteria }
                                    });
                                    console.log(`${logPrefix} 💸 Transferencia €${(cafeteriaAmount/100).toFixed(2)} → ${reserva.cafeteria}`);
                                }
                            }
                        } catch (transferError) {
                            console.error(`${logPrefix} ❌ Error en transferencia:`, transferError.message);
                        }
                    }

                    // Procesar referido
                    if (reserva?.referral_code) {
                        try {
                            await base44.entities.ReferralUse.create({
                                code: reserva.referral_code,
                                user_email: reserva.student_email || customerEmail,
                                user_name: reserva.student_name || '',
                                reserva_id: reservaId,
                                status: 'completed',
                                discount_applied: reserva.referral_discount || 0.20
                            });

                            const allCodes = await base44.entities.ReferralCode.list();
                            const refCode = allCodes.find(c => c.code === reserva.referral_code);
                            if (refCode) {
                                const newCompleted = (refCode.completed_orders || 0) + 1;
                                const threshold = refCode.reward_threshold || 10;
                                const previousRewards = Math.floor((refCode.completed_orders || 0) / threshold);
                                const newRewards = Math.floor(newCompleted / threshold);

                                await base44.entities.ReferralCode.update(refCode.id, {
                                    total_uses: (refCode.total_uses || 0) + 1,
                                    completed_orders: newCompleted,
                                    rewards_earned: newRewards
                                });

                                if (newRewards > previousRewards) {
                                    await base44.entities.ReferralReward.create({
                                        code: refCode.code,
                                        partner_name: refCode.partner_name,
                                        reward_type: 'menu_gratis',
                                        trigger_count: newCompleted,
                                        delivered: false
                                    });
                                    if (refCode.partner_email) {
                                        await base44.integrations.Core.SendEmail({
                                            to: refCode.partner_email,
                                            subject: `🎉 ¡Hito alcanzado! ${newCompleted} referidos en PlatPal`,
                                            body: `¡Felicidades ${refCode.partner_name}!\n\nHas alcanzado ${newCompleted} referidos con tu código ${refCode.code}.\n🎁 Has ganado ${newRewards} menú(s) gratis.\n\nContacta con PlatPal para canjear tu recompensa.`
                                        });
                                    }
                                }
                            }
                        } catch (refError) {
                            console.error(`${logPrefix} ⚠️ Error procesando referido:`, refError.message);
                        }
                    }

                    // Enviar emails + WhatsApp de confirmación
                    try {
                        await base44.functions.invoke('sendReservationEmails', { reserva_id: reservaId });
                        console.log(`${logPrefix} ✅ Emails/WhatsApp enviados`);
                    } catch (emailError) {
                        console.error(`${logPrefix} ⚠️ Error emails:`, emailError.message);
                    }

                    // Notificación al admin
                    if (reserva) {
                        try {
                            await base44.integrations.Core.SendEmail({
                                to: 'piccas.entrepreneurship@gmail.com',
                                subject: `✅ Pago Confirmado - ${reserva.cafeteria}`,
                                body: `✅ Pago confirmado:\n\n👤 ${reserva.student_name || reserva.student_email}\n📍 ${reserva.cafeteria} · ${reserva.campus}\n🍽️ ${reserva.menus_detalle}\n💰 €${reserva.precio_total?.toFixed(2)}\n🔢 Código: ${reserva.codigo_recogida}`
                            });
                        } catch (e) { /* no crítico */ }
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
            if (!subscriptionId) return Response.json({ received: true }, { status: 200 });

            try {
                const allCompras = await base44.entities.BonoCompra.list();
                const bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);
                if (!bonoCompra) return Response.json({ received: true }, { status: 200 });

                const allUsers = await base44.entities.User.list();
                const user = allUsers.find(u => u.email === bonoCompra.user_email);

                if (user) {
                    await base44.entities.User.update(user.id, { creditos_menu_bono: bonoCompra.cantidad_menus });
                    await base44.entities.BonoCompra.update(bonoCompra.id, {
                        menus_usados_mes_actual: 0,
                        fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });
                    console.log(`${logPrefix} ✅ Créditos renovados: ${bonoCompra.cantidad_menus} menús para ${bonoCompra.user_email}`);

                    try {
                        await base44.integrations.Core.SendEmail({
                            to: bonoCompra.user_email,
                            subject: '🔄 Tu Bono PlatPal se ha renovado',
                            body: `¡Hola!\n\nTu suscripción mensual se ha renovado.\n✅ Tienes ${bonoCompra.cantidad_menus} menús nuevos disponibles.\n\n¡Disfruta!\n\nPlatPal`
                        });
                    } catch (e) { /* no crítico */ }
                }

                return Response.json({ received: true, success: true, type: 'renewal' }, { status: 200 });
            } catch (error) {
                console.error(`${logPrefix} ❌ Error renovando:`, error.message);
                return Response.json({ received: true, error: error.message }, { status: 200 });
            }
        }

        // EVENTO: Suscripción cancelada
        if (event.type === 'customer.subscription.deleted') {
            const subscriptionId = event.data.object.id;
            try {
                const allCompras = await base44.entities.BonoCompra.list();
                const bonoCompra = allCompras.find(c => c.stripe_subscription_id === subscriptionId);
                if (bonoCompra) {
                    await base44.entities.BonoCompra.update(bonoCompra.id, { subscription_status: 'cancelled' });
                    const allUsers = await base44.entities.User.list();
                    const user = allUsers.find(u => u.email === bonoCompra.user_email);
                    if (user) {
                        await base44.entities.User.update(user.id, { tiene_subscripcion_activa: false, subscripcion_id: null });
                    }
                    try {
                        await base44.integrations.Core.SendEmail({
                            to: bonoCompra.user_email,
                            subject: 'Suscripción PlatPal Cancelada',
                            body: `Hola,\n\nTu suscripción mensual ha sido cancelada.\nPuedes reactivarla cuando quieras desde tu perfil.\n\nPlatPal`
                        });
                    } catch (e) { /* no crítico */ }
                }
                return Response.json({ received: true, success: true, type: 'cancellation' }, { status: 200 });
            } catch (error) {
                console.error(`${logPrefix} ❌ Error cancelando:`, error.message);
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