import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { reserva_id, menus_detalle, cafeteria, precio_total, customer_email } = body;

        if (!reserva_id || !menus_detalle || !cafeteria || !precio_total) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert price to cents (Stripe requires amounts in cents)
        const amountInCents = Math.round(precio_total * 100);

        // Create Stripe checkout session
        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'mode': 'payment',
                'line_items[0][price_data][currency]': 'eur',
                'line_items[0][price_data][product_data][name]': `Menú PlatPal - ${cafeteria}`,
                'line_items[0][price_data][product_data][description]': menus_detalle,
                'line_items[0][price_data][unit_amount]': amountInCents.toString(),
                'line_items[0][quantity]': '1',
                'success_url': `${req.headers.get('origin')}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
                'cancel_url': `${req.headers.get('origin')}/menus?cancelled=true`,
                'metadata[reserva_id]': reserva_id,
                'metadata[user_email]': user.email,
                'customer_email': customer_email || user.email,
                'payment_intent_data[metadata][reserva_id]': reserva_id,
            }),
        });

        if (!stripeResponse.ok) {
            const error = await stripeResponse.text();
            console.error('Stripe API error:', error);
            return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
        }

        const session = await stripeResponse.json();

        // Update reservation with Stripe payment info
        await base44.entities.Reserva.update(reserva_id, {
            stripe_payment_link: session.url,
            stripe_payment_id: session.id,
            payment_status: 'pending'
        });

        return Response.json({
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('Error creating Stripe checkout:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
});