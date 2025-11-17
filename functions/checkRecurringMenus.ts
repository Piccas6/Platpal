import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticación (solo admins pueden ejecutar esto)
    const user = await base44.auth.me();
    if (!user || user.app_role !== 'admin') {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

    // Obtener menús recurrentes que coincidan con el día de hoy
    const menusRecurrentes = await base44.asServiceRole.entities.Menu.list('-created_date', 500);
    
    const menusAPublicar = menusRecurrentes.filter(menu => {
      if (!menu.es_recurrente || !menu.dias_semana || menu.dias_semana.length === 0) {
        return false;
      }
      
      // Verificar si hoy es un día válido para este menú
      if (!menu.dias_semana.includes(dayOfWeek)) {
        return false;
      }
      
      // Verificar si el menú sigue vigente
      if (menu.fecha_fin_recurrente) {
        const fechaFin = new Date(menu.fecha_fin_recurrente);
        const hoy = new Date(today);
        if (hoy > fechaFin) {
          return false;
        }
      }
      
      return true;
    });

    const creados = [];
    const avisos = [];

    for (const menuOriginal of menusAPublicar) {
      // Verificar si ya existe un menú publicado hoy para esta cafetería
      const menusHoy = await base44.asServiceRole.entities.Menu.filter({
        cafeteria: menuOriginal.cafeteria,
        fecha: today,
        plato_principal: menuOriginal.plato_principal
      });

      if (menusHoy.length === 0) {
        // Crear nuevo menú para hoy
        const nuevoMenu = {
          campus: menuOriginal.campus,
          cafeteria: menuOriginal.cafeteria,
          plato_principal: menuOriginal.plato_principal,
          plato_secundario: menuOriginal.plato_secundario,
          precio_original: menuOriginal.precio_original,
          precio_descuento: menuOriginal.precio_descuento || 2.99,
          stock_total: menuOriginal.stock_total,
          stock_disponible: menuOriginal.stock_total,
          hora_limite_reserva: '16:30',
          hora_limite: '18:00',
          fecha: today,
          es_recurrente: false,
          es_sorpresa: menuOriginal.es_sorpresa,
          permite_llevar_envase: menuOriginal.permite_llevar_envase ?? true,
          permite_envase_propio: menuOriginal.permite_envase_propio ?? true,
          descuento_envase_propio: menuOriginal.descuento_envase_propio || 0.15,
          tipo_cocina: menuOriginal.tipo_cocina,
          es_vegetariano: menuOriginal.es_vegetariano,
          es_vegano: menuOriginal.es_vegano,
          sin_gluten: menuOriginal.sin_gluten,
          alergenos: menuOriginal.alergenos || ['ninguno'],
          imagen_url: menuOriginal.imagen_url
        };

        await base44.asServiceRole.entities.Menu.create(nuevoMenu);
        creados.push({
          cafeteria: menuOriginal.cafeteria,
          plato: menuOriginal.plato_principal
        });
      }

      // Verificar si está próximo a terminar (3 días antes)
      if (menuOriginal.fecha_fin_recurrente && !menuOriginal.aviso_enviado) {
        const fechaFin = new Date(menuOriginal.fecha_fin_recurrente);
        const hoy = new Date(today);
        const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes <= 3 && diasRestantes > 0) {
          // Buscar cafetería para obtener contacto
          const cafeterias = await base44.asServiceRole.entities.Cafeteria.filter({
            nombre: menuOriginal.cafeteria
          });

          if (cafeterias.length > 0) {
            const cafeteria = cafeterias[0];
            
            // Buscar usuarios asignados a esta cafetería
            const usuarios = await base44.asServiceRole.entities.User.list();
            const usuariosCafeteria = usuarios.filter(u => 
              u.cafeterias_asignadas && u.cafeterias_asignadas.includes(cafeteria.id)
            );

            for (const usuario of usuariosCafeteria) {
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: usuario.email,
                  subject: `⏰ Tu menú recurrente está por finalizar`,
                  body: `
                    <h2>Hola ${usuario.full_name || 'Administrador'},</h2>
                    <p>Te recordamos que tu menú recurrente en <strong>${menuOriginal.cafeteria}</strong> finalizará en <strong>${diasRestantes} días</strong>.</p>
                    
                    <h3>Detalles del menú:</h3>
                    <ul>
                      <li><strong>Plato principal:</strong> ${menuOriginal.plato_principal}</li>
                      <li><strong>Acompañamiento:</strong> ${menuOriginal.plato_secundario}</li>
                      <li><strong>Fecha de finalización:</strong> ${menuOriginal.fecha_fin_recurrente}</li>
                    </ul>
                    
                    <p>Si deseas renovarlo o crear uno nuevo, por favor accede a tu panel de cafetería.</p>
                    
                    <p>Saludos,<br>El equipo de PlatPal</p>
                  `
                });
              } catch (emailError) {
                console.error('Error enviando email a', usuario.email, emailError);
              }
            }

            // Marcar como aviso enviado
            await base44.asServiceRole.entities.Menu.update(menuOriginal.id, {
              aviso_enviado: true
            });

            avisos.push({
              cafeteria: menuOriginal.cafeteria,
              diasRestantes
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      fecha: today,
      dia: dayOfWeek,
      menusCreados: creados.length,
      avisosEnviados: avisos.length,
      detalles: {
        creados,
        avisos
      }
    });

  } catch (error) {
    console.error('Error en checkRecurringMenus:', error);
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});