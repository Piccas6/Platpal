Deno.serve(async (req) => {
    console.log('🚀 createCheckoutSession iniciado');
    
    try {
        // 1. Verificar autenticación
        const authHeader = req.headers.get('Authorization');
        console.log('🔐 Auth header presente:', !!authHeader);
        
        if (!authHeader) {
            console.error('❌ No hay Authorization header');
            return Response.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 2. Verificar variables de entorno
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        console.log('🔑 STRIPE_SECRET_KEY configurada:', !!stripeKey);
        
        if (!stripeKey) {
            console.error('❌ STRIPE_SECRET_KEY no configurada');
            return Response.json({ error: 'Stripe no configurado' }, { status: 500 });
        }

        // 3. Parsear body
        console.log('📦 Parseando body...');
        let body;
        try {
            body = await req.json();
            console.log('✅ Body parseado:', JSON.stringify(body, null, 2));
        } catch (parseError) {
            console.error('❌ Error parseando body:', parseError.message);
            return Response.json({ error: 'Body inválido' }, { status: 400 });
        }

        const { 
            reserva_id, 
            menus_detalle, 
            cafeteria,
            campus,
            precio_total,
            codigo_recogida,
            envase_propio
        } = body;

        // 4. Validar datos requeridos
        console.log('✓ Validando datos...');
        if (!reserva_id || !menus_detalle || !cafeteria || !precio_total) {
            console.error('❌ Faltan datos requeridos:', { reserva_id, menus_detalle, cafeteria, precio_total });
            return Response.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        console.log('✅ Datos validados correctamente');
        console.log('💳 Creando checkout para reserva:', reserva_id);

        // 5. Convertir precio a centavos
        const amountInCents = Math.round(precio_total * 100);
        console.log('💰 Precio en centavos:', amountInCents);

        // 6. Determinar origin
        const origin = req.headers.get('origin') || 'https://plat-pal-f5d59edb.base44.app';
        console.log('🌐 Origin:', origin);

        // 7. Preparar datos para Stripe
        const stripeData = {
            'mode': 'payment',
            'line_items[0][price_data][currency]': 'eur',
            'line_items[0][price_data][product_data][name]': `Menú PlatPal - ${cafeteria}`,
            'line_items[0][price_data][product_data][description]': menus_detalle,
            'line_items[0][price_data][unit_amount]': amountInCents.toString(),
            'line_items[0][quantity]': '1',
            'success_url': `${origin}/PaymentFlow?session_id={CHECKOUT_SESSION_ID}`,
            'cancel_url': `${origin}/PaymentFlow?cancelled=true`,
            'client_reference_id': reserva_id,
            'metadata[reserva_id]': reserva_id,
            'metadata[cafeteria]': cafeteria,
            'metadata[campus]': campus || 'Campus',
            'metadata[menus_detalle]': menus_detalle,
            'metadata[codigo_recogida]': codigo_recogida || '',
            'metadata[envase_propio]': envase_propio ? 'true' : 'false',
        };

        console.log('📋 Datos para Stripe preparados');

        // 8. Llamar a Stripe API
        console.log('🔄 Llamando a Stripe API...');
        
        let stripeResponse;
        try {
            stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(stripeData),
            });

            console.log('📡 Respuesta de Stripe recibida, status:', stripeResponse.status);
        } catch (fetchError) {
            console.error('❌ Error en fetch a Stripe:', fetchError.message);
            return Response.json({ 
                error: 'Error conectando con Stripe',
                details: fetchError.message 
            }, { status: 500 });
        }

        // 9. Procesar respuesta de Stripe
        if (!stripeResponse.ok) {
            const errorText = await stripeResponse.text();
            console.error('❌ Error de Stripe:', errorText);
            
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: errorText };
            }
            
            return Response.json({ 
                error: 'Error creando sesión de pago',
                stripe_error: errorJson 
            }, { status: 500 });
        }

        const session = await stripeResponse.json();
        console.log('✅ Sesión de Stripe creada:', session.id);

        // 10. Actualizar reserva con session ID
        console.log('🔄 Actualizando reserva con session ID...');
        const APP_ID = Deno.env.get('BASE44_APP_ID');
        
        try {
            const updateResponse = await fetch(
                `https://base44.app/api/apps/${APP_ID}/entities/Reserva/${reserva_id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        stripe_payment_id: session.id,
                        payment_status: 'pending'
                    })
                }
            );

            if (!updateResponse.ok) {
                console.warn('⚠️ No se pudo actualizar reserva con session ID');
            } else {
                console.log('✅ Reserva actualizada con session ID');
            }
        } catch (updateError) {
            console.warn('⚠️ Error actualizando reserva (no crítico):', updateError.message);
        }

        // 11. Retornar éxito
        console.log('🎉 Checkout creado exitosamente');
        return Response.json({
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('❌ ERROR GENERAL:', error.message);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            error: 'Error interno del servidor',
            message: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});