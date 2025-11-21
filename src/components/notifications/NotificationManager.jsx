import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NotificationManager({ currentUser }) {
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    nuevos_menus: true,
    ofertas_especiales: true,
    recordatorios_recogida: true,
    comunidad: false
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    if (currentUser?.notification_preferences) {
      setPreferences(currentUser.notification_preferences);
    }
  }, [currentUser]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Mostrar notificación de bienvenida
        new Notification('¡Notificaciones activadas! 🎉', {
          body: 'Te avisaremos de nuevos menús y ofertas especiales',
          icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png',
          badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png'
        });

        // Guardar preferencias
        await base44.auth.updateMe({
          notifications_enabled: true,
          notification_preferences: preferences
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      await base44.auth.updateMe({
        notification_preferences: newPreferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const disableNotifications = async () => {
    try {
      await base44.auth.updateMe({
        notifications_enabled: false
      });
      alert('Notificaciones desactivadas. Puedes reactivarlas cuando quieras.');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  };

  if (permission === 'denied') {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <BellOff className="w-5 h-5" />
            Notificaciones bloqueadas
          </CardTitle>
          <CardDescription className="text-red-700">
            Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          Notificaciones Push
        </CardTitle>
        <CardDescription>
          Recibe avisos sobre nuevos menús, ofertas y recordatorios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission === 'default' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Activa las notificaciones para no perderte ningún menú disponible
            </p>
            <Button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Activar Notificaciones
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Notificaciones activadas</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={disableNotifications}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Desactivar
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-gray-700">Preferencias de notificaciones</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="nuevos_menus" className="flex-1">
                    <div className="font-medium">Nuevos menús disponibles</div>
                    <div className="text-xs text-gray-500">Aviso cuando hay menús nuevos en tu campus</div>
                  </Label>
                  <Switch
                    id="nuevos_menus"
                    checked={preferences.nuevos_menus}
                    onCheckedChange={(checked) => updatePreference('nuevos_menus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ofertas_especiales" className="flex-1">
                    <div className="font-medium">Ofertas especiales</div>
                    <div className="text-xs text-gray-500">Descuentos y promociones exclusivas</div>
                  </Label>
                  <Switch
                    id="ofertas_especiales"
                    checked={preferences.ofertas_especiales}
                    onCheckedChange={(checked) => updatePreference('ofertas_especiales', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="recordatorios_recogida" className="flex-1">
                    <div className="font-medium">Recordatorios de recogida</div>
                    <div className="text-xs text-gray-500">Te avisamos antes de que expire tu reserva</div>
                  </Label>
                  <Switch
                    id="recordatorios_recogida"
                    checked={preferences.recordatorios_recogida}
                    onCheckedChange={(checked) => updatePreference('recordatorios_recogida', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="comunidad" className="flex-1">
                    <div className="font-medium">Actividad de la comunidad</div>
                    <div className="text-xs text-gray-500">Interacciones y menciones en tus publicaciones</div>
                  </Label>
                  <Switch
                    id="comunidad"
                    checked={preferences.comunidad}
                    onCheckedChange={(checked) => updatePreference('comunidad', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}