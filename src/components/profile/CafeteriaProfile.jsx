import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ExternalLink, AlertCircle, Building2, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const campusOptions = [
  { id: 'jerez', name: 'Campus Jerez' },
  { id: 'puerto_real', name: 'Campus Puerto Real' },
  { id: 'cadiz', name: 'Campus Cádiz' },
  { id: 'algeciras', name: 'Campus Algeciras' }
];

export default function CafeteriaProfile({ user }) {
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCafeterias = async () => {
      try {
        if (user?.cafeterias_asignadas && user.cafeterias_asignadas.length > 0) {
          const allCafeterias = await base44.entities.Cafeteria.list();
          const userCafeterias = allCafeterias.filter(c => 
            user.cafeterias_asignadas.includes(c.id)
          );
          setCafeterias(userCafeterias);
        }
      } catch (error) {
        console.error('Error loading cafeterias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCafeterias();
  }, [user]);

  const getEstadoBadge = (cafeteria) => {
    if (cafeteria.aprobada && cafeteria.activa) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobada</Badge>;
    }
    if (cafeteria.estado_onboarding === 'en_revision') {
      return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />En Revisión</Badge>;
    }
    if (cafeteria.estado_onboarding === 'rechazada') {
      return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Cafetería</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus establecimientos...</p>
          </CardContent>
        </Card>
      ) : cafeterias.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes establecimientos registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Registra tu primera cafetería para empezar a usar PlatPal
            </p>
            <Link to={createPageUrl("CafeteriaOnboarding")}>
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600">
                Registrar mi cafetería
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Botones de acción */}
          <div className="flex gap-3">
            <Link to={createPageUrl("CafeteriaDashboard")}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir a mi Panel
              </Button>
            </Link>
            <Link to={createPageUrl("CafeteriaOnboarding")}>
              <Button variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Añadir otro establecimiento
              </Button>
            </Link>
          </div>

          {/* Lista de cafeterías */}
          <div className="space-y-4">
            {cafeterias.map(cafe => (
              <Card key={cafe.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{cafe.nombre}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {campusOptions.find(c => c.id === cafe.campus)?.name}
                      </p>
                    </div>
                    {getEstadoBadge(cafe)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Ubicación:</p>
                      <p className="font-medium">{cafe.ubicacion_exacta || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Contacto:</p>
                      <p className="font-medium">{cafe.contacto || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Horario:</p>
                      <p className="font-medium">{cafe.horario_apertura} - {cafe.hora_fin_recogida}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Precio por defecto:</p>
                      <p className="font-medium">€{cafe.precio_original_default.toFixed(2)}</p>
                    </div>
                  </div>

                  {cafe.estado_onboarding === 'en_revision' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900">En proceso de revisión</p>
                          <p className="text-sm text-orange-700 mt-1">
                            Tu cafetería está siendo revisada por nuestro equipo. Te notificaremos por email cuando sea aprobada (normalmente 24-48 horas).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cafe.estado_onboarding === 'rechazada' && cafe.notas_admin && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                      <p className="text-sm font-medium text-red-900 mb-1">Motivo del rechazo:</p>
                      <p className="text-sm text-red-700">{cafe.notas_admin}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}