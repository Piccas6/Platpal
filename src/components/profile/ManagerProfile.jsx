import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, UserCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ManagerProfile({ user }) {
  const managedCafeterias = user?.cafeterias_gestionadas || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfil de Manager</h1>
          <p className="text-gray-600">Supervisa las cafeterías que tienes asignadas.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Mis Cafeterías Asignadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {managedCafeterias.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {managedCafeterias.map((cafeteriaName, index) => (
                <Badge key={index} className="text-base px-4 py-2 bg-teal-100 text-teal-800 border border-teal-200">
                  {cafeteriaName}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tienes ninguna cafetería asignada actualmente. Contacta con un administrador.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Link to={createPageUrl("ManagerDashboard")}>
          <Button className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-2xl py-3 font-semibold shadow-md">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ir a mi Dashboard de Manager
          </Button>
        </Link>
      </div>
    </div>
  );
}