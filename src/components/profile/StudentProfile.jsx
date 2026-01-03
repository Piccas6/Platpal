import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, MapPin, Pencil, Save, UtensilsCrossed,
  Mail, Phone, TrendingUp, Calendar, Flame, X, Gift, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const campusOptions = [
  { id: 'jerez', name: 'Campus Jerez' },
  { id: 'puerto_real', name: 'Campus de Puerto Real' },
  { id: 'cadiz', name: 'Campus de Cádiz' },
  { id: 'algeciras', name: 'Campus Bahía de Algeciras' }
];

export default function StudentProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    telefono: user?.telefono || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [bonoStatus, setBonoStatus] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [allReservations, bonoCompras] = await Promise.all([
        base44.entities.Reserva.list('-created_date'),
        base44.entities.BonoCompra.list('-created_date')
      ]);

      const userReservations = allReservations.filter(r => r.created_by === user.email);
      setReservations(userReservations);

      const userBono = bonoCompras.find(b => b.user_email === user?.email && b.subscription_status === 'active');
      setBonoStatus(userBono || null);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe(editData);
      setIsEditing(false);
      alert('✅ Perfil actualizado');
    } catch (error) {
      alert('❌ Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalReservas: reservations.length,
    totalGastado: reservations.reduce((sum, r) => sum + (r.precio_total || 0), 0),
    menusEsteMes: reservations.filter(r => {
      const d = new Date(r.created_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-emerald-100">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user?.full_name || 'Usuario'}</h1>
                <p className="text-gray-600">{user?.email}</p>
                {user?.campus && (
                  <Badge className="mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {campusOptions.find(c => c.id === user.campus)?.name}
                  </Badge>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>

          {isEditing && (
            <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={editData.telefono}
                  onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                  placeholder="+34 123 456 789"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <UtensilsCrossed className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalReservas}</p>
            <p className="text-sm text-gray-600">Menús Salvados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">€{stats.totalGastado.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Total Gastado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.menusEsteMes}</p>
            <p className="text-sm text-gray-600">Este Mes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <CardContent className="p-6 text-center">
            <Flame className={`w-8 h-8 mx-auto mb-2 ${user?.racha_actual > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <p className="text-2xl font-bold">{user?.racha_actual || 0}</p>
            <p className="text-sm text-gray-600">Racha Actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Bono Status */}
      {bonoStatus && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Gift className="w-10 h-10 text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Bono Activo</h3>
                  <p className="text-sm text-purple-700">
                    {bonoStatus.cantidad_menus - (bonoStatus.menus_usados_mes_actual || 0)} de {bonoStatus.cantidad_menus} menús disponibles
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reservations.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{r.menus_detalle}</p>
                    <p className="text-sm text-gray-600">{r.cafeteria}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(r.created_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.estado === 'recogido' ? 'default' : 'outline'}>
                      {r.estado}
                    </Badge>
                    <p className="text-lg font-bold text-emerald-600 mt-1">€{r.precio_total?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No has hecho reservas aún</p>
              <Link to={createPageUrl("Menus")}>
                <Button className="mt-4 bg-emerald-600">Explorar Menús</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}