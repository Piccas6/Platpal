import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    console.log('🚀 processReservation iniciado');
    
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Validar usuario autenticado
        console.log('🔐 Validando autenticación...');
        const user = await base44.auth.me();
        if (!user) {
            console.error('❌ Usuario no autenticado');
            return Response.json({ error: 'No autenticado' }, { status: 401 });
        }

        console.log('✅ Usuario autenticado:', user.email);

        // 2. Parsear body
        console.log('📦 Parseando body...');
        const body = await req.json();
        const { reservaData, menuId } = body;

        if (!menuId || !reservaData) {
            console.error('❌ Faltan datos:', { menuId: !!menuId, reservaData: !!reservaData });
            return Response.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        console.log('✅ Datos recibidos:', { menuId, reservaData: Object.keys(reservaData) });

        // 3. Obtener menú con privilegios de servicio
        console.log('📋 Obteniendo menú:', menuId);
        let menu;
        try {
            menu = await base44.asServiceRole.entities.Menu.get(menuId);
            console.log('✅ Menú obtenido:', {
                id: menu.id,
                cafeteria: menu.cafeteria,
                stock_disponible: menu.stock_disponible
            });
        } catch (menuError) {
            console.error('❌ Error obteniendo menú:', menuError.message);
            return Response.json({ error: 'Menú no encontrado', details: menuError.message }, { status: 404 });
        }

        // 4. Validar stock
        if (menu.stock_disponible <= 0) {
            console.error('❌ Sin stock disponible');
            return Response.json({ error: 'Sin stock disponible' }, { status: 409 });
        }

        // 5. Reducir stock
        const newStock = menu.stock_disponible - 1;
        console.log(`🔄 Reduciendo stock: ${menu.stock_disponible} → ${newStock}`);

        try {
            await base44.asServiceRole.entities.Menu.update(menuId, {
                stock_disponible: newStock
            });
            console.log('✅ Stock actualizado correctamente');
        } catch (stockError) {
            console.error('❌ Error actualizando stock:', stockError.message);
            return Response.json({ error: 'Error actualizando stock', details: stockError.message }, { status: 500 });
        }

        // 6. Crear reserva
        console.log('🎫 Creando reserva...');
        const reservaCompleta = {
            ...reservaData,
            menu_id: menuId,
            user_name: user.full_name || 'Usuario',
            hora_reserva: new Date().toISOString(),
            estado: 'reservado',
            payment_status: 'pending'
        };

        console.log('📤 Datos de reserva:', reservaCompleta);

        let newReserva;
        try {
            newReserva = await base44.entities.Reserva.create(reservaCompleta);
            console.log('✅ Reserva creada:', newReserva.id);
        } catch (reservaError) {
            console.error('❌ Error creando reserva:', reservaError.message);
            
            // Intentar revertir el stock
            try {
                await base44.asServiceRole.entities.Menu.update(menuId, {
                    stock_disponible: menu.stock_disponible
                });
                console.log('↩️ Stock revertido');
            } catch (revertError) {
                console.error('⚠️ No se pudo revertir el stock:', revertError.message);
            }
            
            return Response.json({ 
                error: 'Error creando reserva', 
                details: reservaError.message 
            }, { status: 500 });
        }

        // 7. Preparar respuesta
        const updatedMenu = { ...menu, stock_disponible: newStock };

        console.log('🎉 processReservation completado exitosamente');
        return Response.json({ 
            success: true,
            reserva: newReserva,
            menu: updatedMenu
        });

    } catch (error) {
        console.error('❌ ERROR GENERAL en processReservation:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        return Response.json({ 
            error: 'Error interno del servidor',
            message: error.message,
            details: error.toString()
        }, { status: 500 });
    }
});