import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    console.log('🎁 createBonoCheckout iniciado (SUSCRIPCIÓN)');
    
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            console.error('❌ Usuario no autenticado');
            return Response.json({ error: 'No autenticado' }, { status: 401 });
        }

        console.log('✅ Usuario autenticado:', user.email);

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            console.error('❌ STRIPE_SECRET_KEY no configurada');
            return Response.json({ error: 'Stripe no configurado' }, { status: 500 });
        }

        const body = await req.json();
        const { bono_pack_id, cantidad_menus, precio_mensual, nombre_bono, descripcion } = body;

        if (!bono_pack_id || !cantidad_menus || !precio_mensual) {
            console.error('❌ Faltan datos requeridos');
            return Response.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        console.log('💳 Creando suscripción para bono:', {
            bono_pack_id,
            cantidad_menus,
            precio_mensual,
            user_email: user.email
        });

        // Crear compra de bono pendiente (ahora suscripción)
        const bonoCompra = await base44.asServiceRole.entities.BonoCompra.create({
            bono_pack_id,
            user_email: user.email,
            cantidad_menus,
            precio_pagado: precio_mensual,
            subscription_status: 'pending',
            menus_usados_mes_actual: 0
        });

        console.log('📝 BonoCompra creado:', bonoCompra.id);

        const amountInCents = Math.round(precio_mensual * 100);
        const origin = req.headers.get('origin') || 'https://plat-pal-f5d59edb.base44.app';

        // MODO SUSCRIPCIÓN
        const stripeData = {
            'mode': 'subscription',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][product_data][name]': nombre_bono || `Suscripción PlatPal - ${cantidad_menus} Menús/Mes`,
            'line_items[0][price_data][product_data][description]': descripcion || `Recibe ${cantidad_menus} menús cada mes con descuento. Cancela cuando quieras.`,
            'line_items[0][price_data][unit_amount]': amountInCents.toString(),
            'line_items[0][price_data][recurring[interval]]': 'month',
            'line_items[0][quantity]': '1',
            'success_url': `${origin}/BonoSuccess?session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${origin}/Bonos?cancelled=true`,
            'client_reference_id': bonoCompra.id,
            'metadata[tipo_compra]': 'bono_subscripcion',
            'metadata[bono_compra_id]': bonoCompra.id,
            'metadata[user_email]': user.email,
            'metadata[cantidad_menus]': cantidad_menus.toString(),
            'customer_email': user.email,
        };

        console.log('🔄 Llamando a Stripe API para crear suscripción...');

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(stripeData),
        });

        if (!stripeResponse.ok) {
            const errorText = await stripeResponse.text();
            console.error('❌ Error de Stripe:', errorText);
            return Response.json({ 
                error: 'Error creando suscripción',
                details: errorText 
            }, { status: 500 });
        }

        const session = await stripeResponse.json();
        console.log('✅ Sesión de Stripe creada (suscripción):', session.id);

        return Response.json({
            success: true,
            checkout_url: session.url,
            session_id: session.id,
            bono_compra_id: bonoCompra.id,
            is_subscription: true
        });

    } catch (error) {
        console.error('❌ Error en createBonoCheckout:', error);
        return Response.json({ 
            error: 'Error interno del servidor',
            details: error.message 
        }, { status: 500 });
    }
});