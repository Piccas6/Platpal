import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, MapPin, Pencil, Save, UtensilsCrossed,
  Mail, Phone, TrendingUp, Calendar, Flame, X, Gift, Loader2, MessageCircle
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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <Card className="border-2 border-emerald-100">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{user?.full_name || 'Usuario'}</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">{user?.email}</p>
                {user?.campus && (
                  <Badge className="mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="text-xs">{campusOptions.find(c => c.id === user.campus)?.name}</span>
                  </Badge>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none" size="sm">
                  <X className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancelar</span>
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 flex-1 sm:flex-none" size="sm">
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Guardar</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto" size="sm">
                <Pencil className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
          </div>

          {/* WhatsApp status (siempre visible) */}
          {!isEditing && (
            <div className="mt-4 pt-4 border-t flex items-center gap-3">
              {user?.telefono ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp activo · <strong>{user.telefono}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Añade tu teléfono para recibir confirmaciones por WhatsApp</span>
                  <button onClick={() => setIsEditing(true)} className="text-emerald-600 font-semibold hover:underline ml-1">Añadir</button>
                </div>
              )}
            </div>
          )}

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
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Teléfono WhatsApp
                </label>
                <Input
                  value={editData.telefono}
                  onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                  placeholder="+34 612 345 678"
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1 mb-3">Recibirás el código de recogida por WhatsApp al reservar.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                  <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Activa el servicio en 3 pasos (solo la primera vez)
                  </p>
                  <ol className="space-y-2.5">
                    {[
                      { n: "1", text: "Abre WhatsApp y busca el contacto ", link: "https://wa.me/34613142125", linkText: "+34 613 142 125" },
                      { n: "2", text: 'Envíale exactamente este mensaje: ', code: "I allow callmebot to send me messages" },
                      { n: "3", text: "Espera la respuesta con tu API key (llega en segundos). ¡Ya está activo!" },
                    ].map(step => (
                      <li key={step.n} className="flex items-start gap-2 text-xs text-amber-700">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">{step.n}</span>
                        <span>
                          {step.text}
                          {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{step.linkText}</a>}
                          {step.code && <code className="bg-white border border-amber-200 px-1.5 py-0.5 rounded font-mono text-[11px] text-gray-800 block mt-1 select-all">{step.code}</code>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.totalReservas}</p>
            <p className="text-xs sm:text-sm text-gray-600">Menús Salvados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">€{stats.totalGastado.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Gastado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold">{stats.menusEsteMes}</p>
            <p className="text-xs sm:text-sm text-gray-600">Este Mes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <Flame className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${user?.racha_actual > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <p className="text-xl sm:text-2xl font-bold">{user?.racha_actual || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600">Racha Actual</p>
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
          <CardTitle className="text-lg sm:text-xl">Historial de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reservations.slice(0, 10).map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{r.menus_detalle}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{r.cafeteria}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(r.created_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Badge variant={r.estado === 'recogido' ? 'default' : 'outline'} className="text-xs">
                      {r.estado}
                    </Badge>
                    <p className="text-base sm:text-lg font-bold text-emerald-600">€{r.precio_total?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <UtensilsCrossed className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-600 px-4">No has hecho reservas aún</p>
              <Link to={createPageUrl("Menus")}>
                <Button className="mt-4 bg-emerald-600 text-sm sm:text-base">Explorar Menús</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}