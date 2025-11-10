import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
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
            const tipoCompra = session.metadata?.tipo_compra;
            
            console.log(`${logPrefix} 💳 CHECKOUT COMPLETADO`);
            console.log(`${logPrefix} Tipo:`, tipoCompra);

            // CASO 1: Suscripción de Bono
            if (tipoCompra === 'bono_subscripcion') {
                console.log(`${logPrefix} 🔄 Procesando SUSCRIPCIÓN de bono...`);
                
                const bonoCompraId = session.client_reference_id;
                const userEmail = session.metadata?.user_email;
                const cantidadMenus = parseInt(session.metadata?.cantidad_menus || '0');
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                console.log(`${logPrefix} Subscription ID:`, subscriptionId);
                console.log(`${logPrefix} Customer ID:`, customerId);

                if (!bonoCompraId || !userEmail || !subscriptionId) {
                    console.error(`${logPrefix} ❌ Faltan datos de suscripción`);
                    return Response.json({ received: true, error: 'Missing data' }, { status: 200 });
                }

                try {
                    // Actualizar BonoCompra con IDs de Stripe
                    await base44.asServiceRole.entities.BonoCompra.update(bonoCompraId, {
                        subscription_status: 'active',
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: customerId,
                        fecha_renovacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });

                    // Dar créditos iniciales al usuario
                    const allUsers = await base44.asServiceRole.entities.User.list();
                    const user = allUsers.find(u => u.email === userEmail);

                    if (user) {
                        await base44.asServiceRole.entities.User.update(user.id, {
                            creditos_menu_bono: cantidadMenus,
                            tiene_subscripcion_activa: true,
                            subscripcion_id: bonoCompraId
                        });
                        console.log(`${logPrefix} ✅ Usuario actualizado con suscripción activa`);
                    }

                    console.log(`${logPrefix} 🎉 Suscripción activada correctamente`);
                    return Response.json({ received: true, success: true, type: 'subscription_created' }, { status: 200 });

                } catch (error) {
                    console.error(`${logPrefix} ❌ Error procesando suscripción:`, error.message);
                    return Response.json({ received: true, error: error.message }, { status: 200 });
                }
            }

            // CASO 2: Pago normal de menú
            const reservaId = session.client_reference_id;
            if (reservaId && tipoCompra !== 'bono_subscripcion') {
                console.log(`${logPrefix} 🍽️ Procesando pago de menú...`);
                
                try {
                    await base44.asServiceRole.entities.Reserva.update(reservaId, {
                        estado: 'pagado',
                        payment_status: 'completed',
                        stripe_payment_id: session.id
                    });
                    
                    console.log(`${logPrefix} ✅ Reserva ${reservaId} actualizada`);

                    // NUEVO: Enviar emails de confirmación después del pago
                    try {
                        console.log(`${logPrefix} 📧 Enviando emails de confirmación...`);
                        await base44.asServiceRole.functions.invoke('sendReservationEmails', {
                            reserva_id: reservaId
                        });
                        console.log(`${logPrefix} ✅ Emails enviados`);
                    } catch (emailError) {
                        console.error(`${logPrefix} ⚠️ Error enviando emails:`, emailError.message);
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