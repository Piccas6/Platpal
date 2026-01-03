import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, MapPin, Phone, Clock, Euro, Loader2, Save } from "lucide-react";

export default function CafeteriaProfile({ user }) {
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({
    full_name: user?.full_name || ''
  });

  useEffect(() => {
    const loadCafeterias = async () => {
      try {
        if (!user?.cafeterias_asignadas?.length) {
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
      setCredentialsForm({ full_name: user.full_name || '' });
    }
  }, [user]);

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await base44.auth.updateMe({ full_name: credentialsForm.full_name });
      alert('✅ Datos actualizados');
      setIsEditingCredentials(false);
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Perfil de Cafetería</h2>
        <p className="text-gray-600 mt-2">Gestiona tu información</p>
      </div>

      {/* Credenciales */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle>🔐 Credenciales</CardTitle>
            {!isEditingCredentials && (
              <Button onClick={() => setIsEditingCredentials(true)} variant="outline" size="sm">
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditingCredentials ? (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email (no se puede cambiar)</label>
                <Input value={user?.email} disabled className="bg-gray-100 mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={credentialsForm.full_name}
                  onChange={(e) => setCredentialsForm({...credentialsForm, full_name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditingCredentials(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-blue-600">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Guardar</>}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cafeterías */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>🏪 Mis Cafeterías</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {cafeterias.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tienes cafeterías asignadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cafeterias.map((cafe) => (
                <div key={cafe.id} className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl border-2 border-emerald-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{cafe.nombre}</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Campus: {cafe.campus}</span>
                    </div>
                    {cafe.contacto && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{cafe.contacto}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{cafe.horario_apertura || '08:00'} - {cafe.hora_fin_recogida || '18:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-emerald-600" />
                      <span>€{cafe.precio_original_default?.toFixed(2) || '8.50'}</span>
                    </div>
                  </div>
                  {cafe.ubicacion_exacta && (
                    <p className="mt-3 text-sm text-gray-700">📍 {cafe.ubicacion_exacta}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-4">🚀 Acceso Rápido</h3>
          <div className="flex flex-wrap gap-3">
            <Link to={createPageUrl("CafeteriaDashboard")}>
              <Button className="bg-emerald-600">Mi Panel</Button>
            </Link>
            <Link to={createPageUrl("PublishMenu")}>
              <Button variant="outline">Publicar Menú</Button>
            </Link>
            <Link to={createPageUrl("PickupPanel")}>
              <Button variant="outline">Panel Recogida</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}