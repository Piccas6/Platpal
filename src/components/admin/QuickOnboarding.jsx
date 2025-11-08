import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Zap, CheckCircle2, Mail } from 'lucide-react';

export default function QuickOnboarding() {
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allTemplates] = await Promise.all([
        base44.entities.User.list('-created_date'),
        base44.entities.CafeteriaProfileTemplate.filter({ is_active: true })
      ]);
      
      // Solo usuarios sin rol cafeteria asignado aún
      const pendingUsers = allUsers.filter(u => !u.app_role || u.app_role === 'user');
      setUsers(pendingUsers);
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTemplate = async (userId, templateId) => {
    setAssigningUser(userId);
    try {
      const response = await base44.functions.invoke('assignCafeteriaTemplate', {
        userId,
        templateId
      });

      if (response.data.success) {
        alert('✅ Plantilla asignada correctamente. La cafetería está lista!');
        loadData(); // Recargar lista
      } else {
        alert('❌ Error: ' + response.data.error);
      }
    } catch (error) {
      console.error("Error assigning template:", error);
      alert('❌ Error al asignar plantilla');
    } finally {
      setAssigningUser(null);
    }
  };

  const filteredUsers = users.filter(u => 
    !searchFilter ||
    u.full_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Onboarding Rápido de Cafeterías
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Asigna plantillas a usuarios nuevos para convertirlos en cafeterías en un click
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-amber-800 font-semibold">⚠️ No hay plantillas activas</p>
            <p className="text-sm text-amber-700 mt-2">
              Crea plantillas primero en la sección de arriba
            </p>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuario por nombre o email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No hay usuarios pendientes de configurar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div key={user.id} className="p-4 bg-white rounded-xl border hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{user.full_name || 'Sin nombre'}</p>
                          <Badge variant="outline" className="text-xs">Nuevo</Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Registrado: {new Date(user.created_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 min-w-[280px]">
                        <Select
                          disabled={assigningUser === user.id}
                          onValueChange={(templateId) => handleAssignTemplate(user.id, templateId)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar plantilla..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-2">
                                  <span>{template.nombre_cafeteria}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {template.campus}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {assigningUser === user.id && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Asignando...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}