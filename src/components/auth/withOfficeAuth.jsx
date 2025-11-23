import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function withOfficeAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (currentUser?.app_role !== 'admin') {
          setError('unauthorized');
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        setError('not_authenticated');
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verificando acceso...</p>
          </div>
        </div>
      );
    }

    if (error === 'unauthorized') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <Card className="max-w-md w-full border-2 border-orange-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🚧 En Construcción
              </h2>
              <p className="text-gray-600 mb-6">
                Esta sección está en construcción y pronto estará disponible para todos los usuarios. 
                Por ahora solo es accesible para administradores.
              </p>
              <Button
                onClick={() => navigate(createPageUrl('Home'))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (error === 'not_authenticated') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-gray-600 mb-6">
                Necesitas iniciar sesión para acceder a esta sección.
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <Component {...props} user={user} />;
  };
}