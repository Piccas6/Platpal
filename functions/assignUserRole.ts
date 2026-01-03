import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Dominios universitarios de Cádiz (expandir según necesidad)
const UNIVERSITY_DOMAINS = [
  'uca.es',
  'alum.uca.es',
  'gm.uca.es',
  // Otras universidades españolas comunes
  'ugr.es',
  'alum.ugr.es',
  'us.es',
  'alum.us.es',
  'uma.es',
  'alum.uma.es',
  'upm.es',
  'alumnos.upm.es',
  'ucm.es',
  'alum.ucm.es',
  'uam.es',
  'alum.uam.es',
  'uab.cat',
  'upc.edu',
  'upv.es',
  'alumni.upv.es'
];

function isUniversityEmail(email) {
  if (!email) return false;
  
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  
  if (!domain) return false;
  
  // Comprobar dominios exactos
  if (UNIVERSITY_DOMAINS.includes(domain)) {
    return true;
  }
  
  // Comprobar subdominios (ej: any.alum.uca.es)
  for (const uniDomain of UNIVERSITY_DOMAINS) {
    if (domain.endsWith('.' + uniDomain) || domain.endsWith(uniDomain)) {
      return true;
    }
  }
  
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Este endpoint puede ser llamado sin autenticación para nuevos usuarios
    // O con autenticación para actualizar usuarios existentes
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email requerido' }, { status: 400 });
    }

    const isStudent = isUniversityEmail(email);
    const assignedRole = isStudent ? 'user' : 'office_user';

    // Si hay usuario autenticado, actualizar su rol
    if (user) {
      await base44.auth.updateMe({ 
        app_role: assignedRole,
        is_student: isStudent
      });

      return Response.json({
        role: assignedRole,
        is_student: isStudent,
        message: `Rol asignado: ${isStudent ? 'Estudiante' : 'Usuario Office'}`
      });
    }

    // Si no hay usuario, solo devolver el rol sugerido
    return Response.json({
      suggested_role: assignedRole,
      is_student: isStudent
    });

  } catch (error) {
    console.error('Error asignando rol:', error);
    return Response.json(
      { error: error.message || 'Error al asignar rol' },
      { status: 500 }
    );
  }
});