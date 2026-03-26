import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || (user.app_role !== 'cafeteria' && user.app_role !== 'admin')) {
            return Response.json({ error: 'No autorizado' }, { status: 403 });
        }

        const { iban, titular_cuenta, cafeteria_id } = await req.json();

        if (!iban || !titular_cuenta) {
            return Response.json({ error: 'Faltan datos bancarios' }, { status: 400 });
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

        // Buscar cafetería para obtener datos
        const cafeterias = await base44.entities.Cafeteria.list();
        const cafeteria = cafeterias.find(c => c.id === cafeteria_id);

        if (!cafeteria) {
            return Response.json({ error: 'Cafetería no encontrada' }, { status: 404 });
        }

        // Crear cuenta Connect Express
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'ES',
            email: user.email,
            capabilities: {
                transfers: { requested: true }
            },
            business_type: 'individual',
            business_profile: {
                name: cafeteria.nombre,
                product_description: 'Cafetería universitaria',
                mcc: '5812' // Eating Places, Restaurants
            }
        });

        console.log('✅ Cuenta Stripe Connect creada:', account.id);

        // Crear link de onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${req.headers.get('origin')}/cafeteria-dashboard`,
            return_url: `${req.headers.get('origin')}/cafeteria-dashboard`,
            type: 'account_onboarding'
        });

        // Guardar ID de cuenta en User
        await base44.auth.updateMe({
            stripe_account_id: account.id,
            iban: iban,
            titular_cuenta: titular_cuenta
        });

        return Response.json({
            success: true,
            account_id: account.id,
            onboarding_url: accountLink.url
        });

    } catch (error) {
        console.error('Error creando cuenta Stripe:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});