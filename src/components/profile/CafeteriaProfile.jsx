import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Euro, 
  Loader2,
  Save,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";

export default function CafeteriaProfile({ user }) {
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  const [credentialsForm, setCredentialsForm] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    newPassword: ''
  });

  useEffect(() => {
    const loadCafeterias = async () => {
      try {
        if (!user?.cafeterias_asignadas || user.cafeterias_asignadas.length === 0) {
          setCafeterias([]);
          setIsLoading(false);
          return;
        }

        const allCafeterias = await base44.entities.Cafeteria.list();
        const userCafeterias = allCafeterias.filter(c => 
          user.cafeterias_asignadas.includes(c.id)
        );
        setCafeterias(userCafeterias);
      } catch (error) {
        console.error("Error loading cafeterias:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadCafeterias();
      setCredentialsForm({
        email: user.email || '',
        full_name: user.full_name || '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage('');

    try {
      const updateData = {
        full_name: credentialsForm.full_name
      };

      // Solo actualizar contraseña si se proporcionó una nueva
      if (credentialsForm.newPassword && credentialsForm.newPassword.length >= 6) {
        updateData.password = credentialsForm.newPassword;
      }

      await base44.auth.updateMe(updateData);

      setSavedMessage('✅ Datos actualizados correctamente');
      setCredentialsForm(prev => ({ ...prev, newPassword: '' }));
      setIsEditingCredentials(false);

      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error("Error updating credentials:", error);
      alert('❌ Error al actualizar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Perfil de Cafetería</h2>
        <p className="text-gray-600 mt-2">Gestiona tu información y credenciales</p>
      </div>

      {/* CREDENCIALES */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">🔐 Credenciales de Acceso</CardTitle>
            {!isEditingCredentials && (
              <Button 
                onClick={() => setIsEditingCredentials(true)}
                variant="outline"
                size="sm"
              >
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {savedMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {savedMessage}
            </div>
          )}

          {isEditingCredentials ? (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <Label>Email (no se puede cambiar)</Label>
                <Input 
                  value={credentialsForm.email} 
                  disabled 
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={credentialsForm.full_name}
                  onChange={(e) => setCredentialsForm(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Nueva Contraseña (opcional)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={credentialsForm.newPassword}
                    onChange={(e) => setCredentialsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Dejar en blanco para mantener la actual"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {credentialsForm.newPassword && credentialsForm.newPassword.length < 6 && (
                  <p className="text-sm text-red-600 mt-1">Mínimo 6 caracteres</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingCredentials(false);
                    setCredentialsForm({
                      email: user?.email || '',
                      full_name: user?.full_name || '',
                      newPassword: ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold text-gray-900">{user?.full_name || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contraseña</p>
                <p className="font-semibold text-gray-900">••••••••</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CAFETERÍAS ASIGNADAS */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">🏪 Mis Cafeterías</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {cafeterias.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tienes cafeterías asignadas</p>
              <p className="text-sm text-gray-500 mt-2">Contacta con el administrador</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cafeterias.map((cafe) => (
                <div key={cafe.id} className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{cafe.nombre}</h3>
                      <Badge className="mt-2 bg-emerald-600">
                        Activa
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span><strong>Campus:</strong> {cafe.campus}</span>
                    </div>

                    {cafe.contacto && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span><strong>Tel:</strong> {cafe.contacto}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span><strong>Horario:</strong> {cafe.horario_apertura || '08:00'} - {cafe.hora_fin_recogida || '18:00'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <Euro className="w-4 h-4 text-emerald-600" />
                      <span><strong>Precio default:</strong> €{cafe.precio_original_default?.toFixed(2) || '8.50'}</span>
                    </div>
                  </div>

                  {cafe.ubicacion_exacta && (
                    <p className="mt-3 text-sm text-gray-700">
                      📍 {cafe.ubicacion_exacta}
                    </p>
                  )}

                  {cafe.descripcion && (
                    <p className="mt-3 text-sm text-gray-600 italic">
                      "{cafe.descripcion}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACCESO RÁPIDO */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-4">🚀 Acceso Rápido</h3>
          <div className="flex flex-wrap gap-3">
            <Link to={createPageUrl("CafeteriaDashboard")}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Mi Panel
              </Button>
            </Link>
            <Link to={createPageUrl("PublishMenu")}>
              <Button variant="outline">
                Publicar Menú
              </Button>
            </Link>
            <Link to={createPageUrl("PickupPanel")}>
              <Button variant="outline">
                Panel Recogida
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}