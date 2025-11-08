
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, 
  MapPin, 
  Award, 
  Pencil, 
  Save, 
  UtensilsCrossed,
  Camera,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  Calendar,
  Bell,
  Heart,
  X, // Added X icon for cancel button
  Flame // Added Flame icon for streak
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StreakMeter from './StreakMeter'; // Added StreakMeter import

const campusOptions = [
  { id: 'jerez', name: 'Campus Jerez', emoji: '🏛️' },
  { id: 'puerto_real', name: 'Campus de Puerto Real', emoji: '🌊' },
  { id: 'cadiz', name: 'Campus de Cádiz', emoji: '🏖️' },
  { id: 'algeciras', name: 'Campus Bahía de Algeciras', emoji: '⛰️' }
];

const alergenosOptions = [
  { id: 'gluten', name: 'Gluten', emoji: '🌾' },
  { id: 'lacteos', name: 'Lácteos', emoji: '🥛' },
  { id: 'huevos', name: 'Huevos', emoji: '🥚' },
  { id: 'pescado', name: 'Pescado', emoji: '🐟' },
  { id: 'frutos_secos', name: 'Frutos Secos', emoji: '🥜' },
  { id: 'soja', name: 'Soja', emoji: '🫘' }
];

export default function StudentProfile({ user }) {
  const [userData, setUserData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    bio: user?.bio || '',
    campus: user?.campus || '',
    avatar_url: user?.avatar_url || '',
    preferencias_dieta: user?.preferencias_dieta || {
      es_vegetariano: false,
      es_vegano: false,
      sin_gluten: false,
      alergenos_evitar: []
    },
    notificaciones: user?.notificaciones || {
      email_nuevos_menus: true,
      email_recordatorios: true,
      push_disponibilidad: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchReservations = useCallback(async () => {
    setIsLoadingReservations(true);
    try {
      const allReservations = await base44.entities.Reserva.list('-created_date');
      const userReservations = allReservations.filter(r => r.created_by === user.email);
      setReservations(userReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [user.email]);

  const calculateStreak = useCallback(async () => {
    try {
      const allReservations = await base44.entities.Reserva.list('-created_date');
      const userReservations = allReservations.filter(
        r => r.created_by === user.email && 
        (r.payment_status === 'completed' || r.estado === 'recogido')
      );

      // If no valid reservations, streak should be 0.
      if (userReservations.length === 0) {
        if (userData.racha_actual !== 0) { // Only update if it's not already 0
          await base44.auth.updateMe({ racha_actual: 0, racha_maxima: userData.racha_maxima || 0, ultima_compra_fecha: null });
          setUserData(prev => ({ ...prev, racha_actual: 0, ultima_compra_fecha: null }));
        }
        return;
      }

      // Agrupar reservas por fecha (normalizadas a UTC para evitar problemas de zona horaria)
      const reservasPorFecha = {};
      let latestPurchaseDate = null; // To track the very last purchase date

      userReservations.forEach(r => {
        const date = new Date(r.created_date);
        // Normalize to UTC date to prevent timezone issues with day boundaries
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const fechaStr = utcDate.toISOString().split('T')[0];
        reservasPorFecha[fechaStr] = true;
        
        // Track the actual latest purchase date from valid reservations
        if (!latestPurchaseDate || utcDate.getTime() > latestPurchaseDate.getTime()) {
            latestPurchaseDate = utcDate;
        }
      });
      
      const today = new Date();
      const todayStr = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().split('T')[0];
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = new Date(Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())).toISOString().split('T')[0];

      let rachaActual = 0;
      let checkDate = new Date(); // Start checking from today
      checkDate = new Date(Date.UTC(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())); // Normalize to UTC

      // Determine the starting point for streak calculation based on today/yesterday
      if (reservasPorFecha[todayStr]) {
          rachaActual = 1;
          checkDate.setDate(checkDate.getDate() - 1); // Move to check yesterday
      } else if (reservasPorFecha[yesterdayStr]) {
          rachaActual = 1; // Purchase yesterday, considered active for today (grace period)
          checkDate.setDate(checkDate.getDate() - 1); // Move to check two days ago
      } else {
          rachaActual = 0; // No purchase today or yesterday, streak is broken.
      }

      // Continue checking backwards if an active streak was initiated
      if (rachaActual > 0) {
          // Loop through previous days to extend streak
          for (let i = 0; i < 365; i++) { // Limit the loop to a reasonable number of days (e.g., 1 year)
              const dateStr = checkDate.toISOString().split('T')[0];
              if (reservasPorFecha[dateStr]) {
                  rachaActual++;
                  checkDate.setDate(checkDate.getDate() - 1);
              } else {
                  break; // Streak broken
              }
          }
      }
      
      const actualRachaMaxima = Math.max(rachaActual, userData.racha_maxima || 0);
      const ultimaCompraFechaStr = latestPurchaseDate ? latestPurchaseDate.toISOString().split('T')[0] : null;

      // Only update if there's a change to avoid unnecessary backend calls
      if (rachaActual !== userData.racha_actual || actualRachaMaxima !== userData.racha_maxima || ultimaCompraFechaStr !== userData.ultima_compra_fecha) {
        await base44.auth.updateMe({ 
          racha_actual: rachaActual,
          racha_maxima: actualRachaMaxima,
          ultima_compra_fecha: ultimaCompraFechaStr
        });
        setUserData(prev => ({
          ...prev, 
          racha_actual: rachaActual,
          racha_maxima: actualRachaMaxima,
          ultima_compra_fecha: ultimaCompraFechaStr
        }));
      }
    } catch (error) {
      console.error("Error calculating streak:", error);
    }
  }, [user.email, userData.racha_actual, userData.racha_maxima, userData.ultima_compra_fecha]);

  useEffect(() => {
    setUserData(user);
    setEditData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      bio: user?.bio || '',
      campus: user?.campus || '',
      avatar_url: user?.avatar_url || '',
      preferencias_dieta: user?.preferencias_dieta || {
        es_vegetariano: false,
        es_vegano: false,
        sin_gluten: false,
        alergenos_evitar: []
      },
      notificaciones: user?.notificaciones || {
        email_nuevos_menus: true,
        email_recordatorios: true,
        push_disponibilidad: false
      }
    });
    fetchReservations();
    calculateStreak();
  }, [user, fetchReservations, calculateStreak]);

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Do not include email in the update, as it cannot be changed
      const { email, ...dataToUpdate } = editData;
      
      // Updated to use base44.auth.updateMe
      await base44.auth.updateMe(dataToUpdate);
      
      // Update the local userData state with the saved changes
      setUserData({ ...userData, ...dataToUpdate });
      setIsEditing(false);
      
      alert('✅ Perfil actualizado correctamente');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('❌ Error al actualizar el perfil. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Restore editData to the current userData state and exit editing mode
    setEditData({
      full_name: userData?.full_name || '',
      email: userData?.email || '',
      telefono: userData?.telefono || '',
      bio: userData?.bio || '',
      campus: userData?.campus || '',
      avatar_url: userData?.avatar_url || '',
      preferencias_dieta: userData?.preferencias_dieta || {
        es_vegetariano: false,
        es_vegano: false,
        sin_gluten: false,
        alergenos_evitar: []
      },
      notificaciones: userData?.notificaciones || {
        email_nuevos_menus: true,
        email_recordatorios: true,
        push_disponibilidad: false
      }
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditData(prev => ({ ...prev, avatar_url: file_url }));
      
      // Save avatar_url automatically
      // Updated to use base44.auth.updateMe
      await base44.auth.updateMe({ avatar_url: file_url });
      setUserData(prev => ({ ...prev, avatar_url: file_url }));
      alert('✅ Foto de perfil actualizada');
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert('❌ Error al subir la foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAlergenoToggle = (alergeno) => {
    if (!isEditing) return; // Prevent toggling when not in editing mode

    setEditData(prev => {
      const currentAlergenos = prev.preferencias_dieta?.alergenos_evitar || [];
      const newAlergenos = currentAlergenos.includes(alergeno)
        ? currentAlergenos.filter(a => a !== alergeno)
        : [...currentAlergenos, alergeno];
      
      return {
        ...prev,
        preferencias_dieta: {
          ...prev.preferencias_dieta,
          alergenos_evitar: newAlergenos
        }
      };
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'reservado': <Badge variant="outline" className="bg-blue-50 text-blue-700">Reservado</Badge>,
      'pagado': <Badge variant="outline" className="bg-green-50 text-green-700">Pagado</Badge>,
      'recogido': <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Recogido</Badge>,
      'cancelado': <Badge variant="outline" className="bg-red-50 text-red-700">Cancelado</Badge>
    };
    return badges[estado] || <Badge>{estado}</Badge>;
  };

  // Calcular estadísticas
  const stats = {
    totalReservas: reservations.length,
    totalGastado: reservations.reduce((sum, r) => sum + (r.precio_total || 0), 0),
    menusEsteMes: reservations.filter(r => {
      const reservaDate = new Date(r.created_date);
      const now = new Date();
      return reservaDate.getMonth() === now.getMonth() && reservaDate.getFullYear() === now.getFullYear();
    }).length,
    ahorroTotal: reservations.reduce((sum, r) => {
      const precioOriginal = 8.5; // Precio promedio de un menú normal
      return sum + (precioOriginal - (r.precio_total || 0));
    }, 0)
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header con Avatar */}
      <Card className="border-2 border-emerald-100">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {editData.avatar_url ? (
                  <img src={editData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userData.full_name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Info básica */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{userData.full_name || 'Usuario'}</h1>
                <Badge className="bg-emerald-100 text-emerald-700">Estudiante</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 justify-center md:justify-start">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userData.email}
                </span>
                {userData.telefono && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {userData.telefono}
                  </span>
                )}
                {userData.campus && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {campusOptions.find(c => c.id === userData.campus)?.name}
                  </span>
                )}
              </div>
              {userData.bio && !isEditing && (
                <p className="mt-3 text-gray-700 italic">"{userData.bio}"</p>
              )}
            </div>

            {/* Botones editar/guardar/cancelar */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="rounded-2xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas + Racha */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <UtensilsCrossed className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalReservas}</p>
            <p className="text-sm text-gray-600">Menús Salvados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">€{stats.totalGastado.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Total Gastado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.menusEsteMes}</p>
            <p className="text-sm text-gray-600">Este Mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">€{stats.ahorroTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Ahorro Total</p>
          </CardContent>
        </Card>
        
        {/* Racha compacta */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <CardContent className="p-6 text-center">
            <Flame className={`w-8 h-8 mx-auto mb-2 ${userData.racha_actual > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <p className="text-2xl font-bold text-gray-900">{userData.racha_actual || 0}</p>
            <p className="text-sm text-gray-600">Racha Actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Información Personal</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="streak">Racha</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* Tab: Información Personal */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={editData.full_name} // Always bind to editData when editing is possible
                    onChange={(e) => handleEditChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email} // Email is display-only, always from userData
                    disabled // Always disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">El email no se puede cambiar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={editData.telefono} // Bind to editData
                    onChange={(e) => handleEditChange('telefono', e.target.value)}
                    placeholder="+34 123 456 789"
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Mi Campus Principal</Label>
                  {isEditing ? (
                    <Select
                      value={editData.campus} // Bind to editData
                      onValueChange={(value) => handleEditChange('campus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map(campus => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.emoji} {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={campusOptions.find(c => c.id === userData.campus)?.name || 'No especificado'} // Display from userData
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía (opcional)</Label>
                <Textarea
                  id="bio"
                  value={editData.bio} // Bind to editData
                  onChange={(e) => handleEditChange('bio', e.target.value)}
                  placeholder="Cuéntanos algo sobre ti..."
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Preferencias */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias Dietéticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                  <Label htmlFor="pref_vegetariano" className="text-sm font-medium cursor-pointer">
                    🥗 Vegetariano
                  </Label>
                  <Switch
                    id="pref_vegetariano"
                    checked={editData.preferencias_dieta?.es_vegetariano || false}
                    onCheckedChange={(checked) => setEditData(prev => ({
                      ...prev,
                      preferencias_dieta: { ...(prev.preferencias_dieta || {}), es_vegetariano: checked }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                  <Label htmlFor="pref_vegano" className="text-sm font-medium cursor-pointer">
                    🌱 Vegano
                  </Label>
                  <Switch
                    id="pref_vegano"
                    checked={editData.preferencias_dieta?.es_vegano || false}
                    onCheckedChange={(checked) => setEditData(prev => ({
                      ...prev,
                      preferencias_dieta: { ...(prev.preferencias_dieta || {}), es_vegano: checked }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                  <Label htmlFor="pref_sin_gluten" className="text-sm font-medium cursor-pointer">
                    🌾 Sin Gluten
                  </Label>
                  <Switch
                    id="pref_sin_gluten"
                    checked={editData.preferencias_dieta?.sin_gluten || false}
                    onCheckedChange={(checked) => setEditData(prev => ({
                      ...prev,
                      preferencias_dieta: { ...(prev.preferencias_dieta || {}), sin_gluten: checked }
                    }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Alérgenos a Evitar</Label>
                <div className="flex flex-wrap gap-2">
                  {alergenosOptions.map(alergeno => (
                    <Badge
                      key={alergeno.id}
                      variant={(editData.preferencias_dieta?.alergenos_evitar || []).includes(alergeno.id) ? "default" : "outline"}
                      className={`px-4 py-2 text-sm ${isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default'} transition-all`}
                      onClick={() => isEditing && handleAlergenoToggle(alergeno.id)} // Only allow click when editing
                    >
                      {alergeno.emoji} {alergeno.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Los menús con estos alérgenos se marcarán claramente para tu seguridad.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <Label className="font-medium">Nuevos menús por email</Label>
                  <p className="text-sm text-gray-600">Recibe un email cuando haya menús nuevos</p>
                </div>
                <Switch
                  checked={editData.notificaciones?.email_nuevos_menus ?? true}
                  onCheckedChange={(checked) => setEditData(prev => ({
                    ...prev,
                    notificaciones: { ...(prev.notificaciones || {}), email_nuevos_menus: checked }
                  }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <Label className="font-medium">Recordatorios de recogida</Label>
                  <p className="text-sm text-gray-600">Te avisaremos antes de que expire tu reserva</p>
                </div>
                <Switch
                  checked={editData.notificaciones?.email_recordatorios ?? true}
                  onCheckedChange={(checked) => setEditData(prev => ({
                    ...prev,
                    notificaciones: { ...(prev.notificaciones || {}), email_recordatorios: checked }
                  }))}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Racha (NUEVO) */}
        <TabsContent value="streak" className="space-y-6">
          <StreakMeter 
            currentStreak={userData.racha_actual || 0}
            maxStreak={userData.racha_maxima || 0}
            size="large"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>¿Cómo funciona la racha?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Compra menús regularmente</p>
                  <p className="text-sm text-gray-600">Cada día que compres al menos un menú, tu racha aumenta</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mantén el ritmo</p>
                  <p className="text-sm text-gray-600">Si pasas un día sin comprar, tu racha se reinicia a 0</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3️⃣</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alcanza hitos</p>
                  <p className="text-sm text-gray-600">Desbloquea niveles especiales: 3, 7, 14, 30 días consecutivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                Mis Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReservations ? (
                <div className="text-center py-8 text-gray-500">Cargando historial...</div>
              ) : reservations.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {reservations.map(reserva => (
                    <div key={reserva.id} className="p-5 border-2 rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-lg">{reserva.menus_detalle}</p>
                            {getEstadoBadge(reserva.estado)}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {reserva.cafeteria} • {campusOptions.find(c => c.id === reserva.campus)?.name || reserva.campus}
                          </p>
                          <p className="text-xs text-gray-500">
                            📅 {new Date(reserva.created_date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {reserva.codigo_recogida && (
                            <Badge variant="outline" className="font-mono text-sm">
                              Código: {reserva.codigo_recogida}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">€{reserva.precio_total?.toFixed(2)}</p>
                          {reserva.descuento_aplicado > 0 && (
                            <p className="text-xs text-gray-500">Ahorraste €{reserva.descuento_aplicado.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <UtensilsCrossed className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Aún no has reservado ningún menú</p>
                  <p className="text-gray-500 text-sm mb-6">¡Empieza a salvar comida y ahorrar dinero hoy!</p>
                  <Link to={createPageUrl("Campus")}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Heart className="w-4 h-4 mr-2" />
                      Explorar Menús
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
