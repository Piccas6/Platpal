import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia'
});

Deno.serve(async (req) => {
  try {
    // Autenticación Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, menu_detalle, precio_total, cliente_email, incluye_bebida } = await req.json();

    if (!order_id || !precio_total || !cliente_email) {
      return Response.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Crear sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Menú Office: ${menu_detalle}`,
              description: incluye_bebida ? 'Con bebida incluida' : 'Sin bebida',
              metadata: {
                order_type: 'office',
                order_id: order_id
              }
            },
            unit_amount: Math.round(precio_total * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      customer_email: cliente_email,
      metadata: {
        order_id: order_id,
        order_type: 'office',
        user_id: user.id,
        user_email: user.email
      },
      success_url: `${req.headers.get('origin')}/platpal-v2/OfficeSuccess?session_id={CHECKOUT_SESSION_ID}&order_id=${order_id}`,
      cancel_url: `${req.headers.get('origin')}/platpal-v2/OfficeMenus?cancelled=true`,
    });

    return Response.json({
      checkout_url: session.url,
      session_id: session.id
    });

  } catch (error) {
    console.error('Error creating office checkout:', error);
    return Response.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
});