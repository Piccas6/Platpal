import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Validar que quien llama es admin
        const caller = await base44.auth.me();
        if (!caller || caller.app_role !== 'admin') {
            return Response.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
        }

        const { userId, templateId } = await req.json();

        if (!userId || !templateId) {
            return Response.json({ error: 'userId y templateId son requeridos' }, { status: 400 });
        }

        // Obtener template con permisos de servicio
        const template = await base44.asServiceRole.entities.CafeteriaProfileTemplate.get(templateId);

        if (!template) {
            return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 });
        }

        if (!template.is_active) {
            return Response.json({ error: 'Plantilla no está activa' }, { status: 400 });
        }

        // Preparar datos para el usuario
        const cafeteriaInfo = {
            nombre_cafeteria: template.nombre_cafeteria,
            campus: template.campus,
            horario_apertura: template.horario_apertura || '08:00',
            hora_fin_reserva: template.hora_fin_reserva || '16:00',
            hora_fin_recogida: template.hora_fin_recogida || '18:00',
            contacto: template.contacto || '',
            ubicacion_exacta: template.ubicacion_exacta || '',
            descripcion: template.descripcion || ''
        };

        // Actualizar usuario con permisos de servicio
        await base44.asServiceRole.entities.User.update(userId, {
            app_role: 'cafeteria',
            campus: template.campus,
            cafeteria_info: cafeteriaInfo
        });

        return Response.json({
            success: true,
            message: 'Plantilla asignada correctamente',
            cafeteria: cafeteriaInfo
        });

    } catch (error) {
        console.error("Error assigning template:", error);
        return Response.json({ 
            error: 'Error interno al asignar plantilla',
            details: error.message 
        }, { status: 500 });
    }
});