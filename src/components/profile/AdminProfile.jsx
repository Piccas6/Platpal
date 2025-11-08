import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Users, Edit, Save, X, Search, Building2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const roleOptions = [
    { id: 'user', name: 'Estudiante' },
    { id: 'cafeteria', name: 'Cafetería' },
    { id: 'manager', name: 'Manager' },
    { id: 'admin', name: 'Administrador' }
];

const campusOptions = [
    { id: 'jerez', name: 'Campus Jerez' },
    { id: 'puerto_real', name: 'Campus Puerto Real' },
    { id: 'cadiz', name: 'Campus Cádiz' },
    { id: 'algeciras', name: 'Campus Algeciras' }
];

export default function AdminProfile({ user }) {
  const [allUsers, setAllUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});
  const [filterRole, setFilterRole] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Estados para cafeterías pendientes
  const [cafeterias, setCafeterias] = useState([]);
  const [cafeteriasPendientes, setCafeteriasPendientes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [users, allCafeterias] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Cafeteria.list()
      ]);
      
      setAllUsers(users);
      setCafeterias(allCafeterias);
      
      // Filtrar pendientes (solo las que tienen estado_onboarding)
      const pendientes = allCafeterias.filter(c => 
        c.estado_onboarding === 'en_revision' && c.aprobada === false
      );
      setCafeteriasPendientes(pendientes);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para aprobar/rechazar cafeterías
  const handleAprobarCafeteria = async (cafeteriaId) => {
    if (!confirm("¿Aprobar esta cafetería para que aparezca en la plataforma?")) return;
    
    try {
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: true,
        estado_onboarding: 'aprobada',
        activa: true,
        fecha_aprobacion: new Date().toISOString()
      });
      
      alert('✅ Cafetería aprobada correctamente');
      fetchData();
    } catch (error) {
      console.error("Error aprobando cafetería:", error);
      alert('❌ Error al aprobar la cafetería: ' + error.message);
    }
  };

  const handleRechazarCafeteria = async (cafeteriaId) => {
    const motivo = prompt("Motivo del rechazo (opcional):");
    
    try {
      await base44.entities.Cafeteria.update(cafeteriaId, {
        aprobada: false,
        estado_onboarding: 'rechazada',
        activa: false,
        notas_admin: motivo || 'Rechazada sin motivo especificado'
      });
      
      alert('Cafetería rechazada');
      fetchData();
    } catch (error) {
      console.error("Error rechazando cafetería:", error);
      alert('❌ Error al rechazar la cafetería: ' + error.message);
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit.id);
    setEditData({
      app_role: userToEdit.app_role || 'user',
      campus: userToEdit.campus || '',
      cafeterias_asignadas: userToEdit.cafeterias_asignadas || [],
      cafeterias_gestionadas: userToEdit.cafeterias_gestionadas || []
    });
  };

  const handleFieldChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleCafeteriaAssignmentToggle = (cafeteriaId) => {
    setEditData(prev => {
      const current = prev.cafeterias_asignadas || [];
      const newAssignments = current.includes(cafeteriaId)
        ? current.filter(id => id !== cafeteriaId)
        : [...current, cafeteriaId];
      return { ...prev, cafeterias_asignadas: newAssignments };
    });
  };

  const handleSaveUser = async (userId) => {
    setSaveStatus({ type: 'loading', userId });
    try {
      await base44.entities.User.update(userId, editData);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editData } : u));
      setSaveStatus({ type: 'success', userId });
      setTimeout(() => {
        setSaveStatus({});
        setEditingUser(null);
      }, 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      setSaveStatus({ type: 'error', userId });
      alert('❌ Error al actualizar el usuario: ' + (error.message || 'Intenta de nuevo'));
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditData({});
    setSaveStatus({});
  };
  
  const filteredUsers = allUsers.filter(u => {
    const roleMatch = filterRole === 'all' || u.app_role === filterRole;
    const searchMatch = !filterSearch ||
      u.full_name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(filterSearch.toLowerCase());
    return roleMatch && searchMatch;
  });

  // FIXED: Mostrar todas las cafeterías activas (sin importar si tienen aprobada o no)
  const cafeteriasParaAsignar = cafeterias.filter(c => c.activa !== false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Gestión de usuarios y cafeterías</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Cafeterías Pendientes de Aprobación */}
      {cafeteriasPendientes.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              {cafeteriasPendientes.length} {cafeteriasPendientes.length === 1 ? 'Cafetería Pendiente' : 'Cafeterías Pendientes'} de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cafeteriasPendientes.map(caf => (
              <div key={caf.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-orange-200">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{caf.nombre}</p>
                    <p className="text-sm text-gray-600">Campus {caf.campus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contacto</p>
                    <p className="text-sm font-medium">{caf.contacto || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="text-sm font-medium">{caf.ubicacion_exacta || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Solicitado</p>
                    <p className="text-sm font-medium">
                      {new Date(caf.fecha_solicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleAprobarCafeteria(caf.id)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    onClick={() => handleRechazarCafeteria(caf.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN: Gestión de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nombre o email..." 
                value={filterSearch} 
                onChange={(e) => setFilterSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger><SelectValue placeholder="Filtrar por rol"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roleOptions.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {filteredUsers.map(currentUser => (
              <div key={currentUser.id} className="p-4 border rounded-xl bg-gray-50/50">
                {editingUser === currentUser.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Rol</Label>
                        <Select value={editData.app_role || 'user'} onValueChange={(v) => handleFieldChange('app_role', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Campus del Usuario</Label>
                        <Select value={editData.campus || ''} onValueChange={(v) => handleFieldChange('campus', v)}>
                          <SelectTrigger><SelectValue placeholder="Sin campus"/></SelectTrigger>
                          <SelectContent>
                            {campusOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {editData.app_role === 'cafeteria' && (
                      <div className="p-4 bg-amber-50 rounded-xl space-y-3">
                        <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Asignar Cafeterías ({cafeteriasParaAsignar.length} disponibles)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {cafeteriasParaAsignar.map(cafe => (
                            <div key={cafe.id} className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:border-amber-300 transition-colors">
                              <Checkbox
                                id={`cafe-${cafe.id}`}
                                checked={(editData.cafeterias_asignadas || []).includes(cafe.id)}
                                onCheckedChange={() => handleCafeteriaAssignmentToggle(cafe.id)}
                              />
                              <label htmlFor={`cafe-${cafe.id}`} className="text-sm cursor-pointer flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <strong>{cafe.nombre}</strong>
                                    <span className="text-gray-600 ml-2">- {campusOptions.find(c => c.id === cafe.campus)?.name}</span>
                                  </div>
                                  {cafe.activa && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Activa</Badge>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))}
                          {cafeteriasParaAsignar.length === 0 && (
                            <div className="text-center py-8">
                              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                No hay cafeterías disponibles
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Crea cafeterías desde "Gestionar Cafeterías"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button size="sm" onClick={() => handleSaveUser(currentUser.id)} disabled={saveStatus.type === 'loading'}>
                        {saveStatus.userId === currentUser.id && saveStatus.type === 'loading' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1" />
                            Guardar
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{currentUser.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleEditUser(currentUser)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={
                        currentUser.app_role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        currentUser.app_role === 'manager' ? 'bg-teal-100 text-teal-800' : 
                        currentUser.app_role === 'cafeteria' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'
                      }>
                        {roleOptions.find(r => r.id === currentUser.app_role)?.name || currentUser.app_role}
                      </Badge>
                      {currentUser.campus && (
                        <Badge variant="outline">
                          {campusOptions.find(c => c.id === currentUser.campus)?.name || currentUser.campus}
                        </Badge>
                      )}
                      {currentUser.app_role === 'cafeteria' && currentUser.cafeterias_asignadas?.length > 0 && (
                        <Badge className="bg-amber-100 text-amber-800">
                          {currentUser.cafeterias_asignadas.length} {currentUser.cafeterias_asignadas.length === 1 ? 'cafetería' : 'cafeterías'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}