import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client'; // FIXED: Use base44 SDK
import { createPageUrl } from '@/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const withAuth = (WrappedComponent, allowedRoles = [], requireOwnership = false) => {
  return (props) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const currentUser = await base44.auth.me(); // FIXED: Use base44.auth.me()
          
          if (!currentUser.app_role) {
            await base44.auth.updateMe({ app_role: 'user' }); // FIXED: Use base44.auth.updateMe()
            currentUser.app_role = 'user';
          }
          
          // **FIX: Admins always have access to everything**
          if (currentUser.app_role === 'admin') {
            setUser(currentUser);
            setIsLoading(false);
            return;
          }

          // Check if user has required role
          if (allowedRoles.length === 0 || allowedRoles.includes(currentUser.app_role)) {
            setUser(currentUser);
            setIsLoading(false);
          } else {
            setError('No tienes permisos para acceder a esta página');
            setIsLoading(false);
          }
        } catch (error) {
          setError('Debes iniciar sesión para acceder a esta página');
          setIsLoading(false);
        }
      };
      checkAuth();
    }, [navigate]);

    const handleLogin = async () => {
      try {
        await base44.auth.redirectToLogin(); // FIXED: Use base44.auth
      } catch (error) {
        console.error('Login error:', error);
      }
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center space-y-6 max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Iniciar Sesión
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(createPageUrl("Home"))}
                className="w-full"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} user={user} />;
  };
};

export default withAuth;