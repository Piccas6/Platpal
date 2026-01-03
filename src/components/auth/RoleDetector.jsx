import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Componente para detectar y asignar rol automáticamente basado en el email del usuario
 * Se ejecuta al cargar la app si el usuario está logueado
 */
export default function RoleDetector() {
  useEffect(() => {
    const detectAndAssignRole = async () => {
      try {
        const user = await base44.auth.me();
        
        // Si el usuario no tiene rol asignado o es el rol por defecto
        if (!user.app_role || user.app_role === 'user') {
          // Llamar a la función que detecta el rol basado en el email
          const { data } = await base44.functions.invoke('assignUserRole', {
            email: user.email
          });

          if (data && data.role) {
            console.log(`✅ Rol asignado automáticamente: ${data.role}`);
            
            // Refrescar la página para aplicar el nuevo rol
            if (data.role !== user.app_role) {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          }
        }
      } catch (error) {
        // Silenciar errores si el usuario no está logueado
        if (error.message?.includes('not authenticated')) {
          return;
        }
        console.error('Error detectando rol:', error);
      }
    };

    detectAndAssignRole();
  }, []);

  return null; // Este componente no renderiza nada
}