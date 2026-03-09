import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { 
            reserva_id, 
            menus_detalle, 
            cafeteria, 
            campus,
            precio_total, 
            codigo_recogida,
            hora_limite,
            envase_propio = false
        } = body;

        // Validate required fields and reserva_id
        if (!reserva_id || reserva_id.startsWith('temp_')) {
            return Response.json({ error: 'Invalid reservation ID' }, { status: 400 });
        }

        if (!menus_detalle || !cafeteria || !precio_total) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify reservation exists and belongs to user
        try {
            const reserva = await base44.entities.Reserva.get(reserva_id);
            if (!reserva) {
                return Response.json({ error: 'Reservation not found' }, { status: 404 });
            }
            if (reserva.created_by !== user.email) {
                return Response.json({ error: 'Unauthorized access to reservation' }, { status: 403 });
            }
        } catch (error) {
            console.error('Error verifying reservation:', error);
            return Response.json({ error: 'Error verifying reservation' }, { status: 500 });
        }

        // Convert price to cents (Stripe requires amounts in cents)
        const amountInCents = Math.round(precio_total * 100);

        // Create Stripe PaymentIntent
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'amount': amountInCents.toString(),
                'currency': 'eur',
                'payment_method_types[]': 'card',
                'description': `Menú PlatPal - ${cafeteria}`,
                'metadata[reserva_id]': reserva_id,
                'metadata[user_email]': user.email,
                'metadata[user_name]': user.full_name || 'Usuario',
                'metadata[cafeteria]': cafeteria,
                'metadata[campus]': campus || 'Campus',
                'metadata[menus_detalle]': menus_detalle,
                'metadata[codigo_recogida]': codigo_recogida,
                'metadata[hora_limite]': hora_limite || '',
                'metadata[envase_propio]': envase_propio ? 'true' : 'false',
                'receipt_email': user.email,
            }),
        });

        if (!stripeResponse.ok) {
            const error = await stripeResponse.text();
            console.error('Stripe API error:', error);
            return Response.json({ error: 'Failed to create payment intent' }, { status: 500 });
        }

        const paymentIntent = await stripeResponse.json();

        // Update reservation with Stripe payment ID
        await base44.entities.Reserva.update(reserva_id, {
            stripe_payment_id: paymentIntent.id,
            payment_status: 'pending'
        });

        return Response.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
});