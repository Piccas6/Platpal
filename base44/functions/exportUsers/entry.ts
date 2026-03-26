import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Verificar que el usuario es admin
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Obtener todos los usuarios
        const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

        // Crear CSV
        const headers = 'Email,Nombre Completo,Rol,Fecha Registro\n';
        const rows = users.map(u => {
            const email = u.email || '';
            const name = (u.full_name || '').replace(/,/g, ';'); // Reemplazar comas por punto y coma
            const role = u.role || 'user';
            const date = u.created_date ? new Date(u.created_date).toLocaleDateString('es-ES') : '';
            return `${email},${name},${role},${date}`;
        }).join('\n');

        const csv = headers + rows;

        // Devolver como archivo CSV
        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename=usuarios_platpal_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});