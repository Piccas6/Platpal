import React, { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNotifications } from './NotificationContext';

export default function NotificationTriggers({ user }) {
  const { addNotification } = useNotifications();
  const shownIds = useRef(new Set());

  useEffect(() => {
    if (!user?.id) return;

    const pollNotifications = async () => {
      try {
        const allNotifications = await base44.entities.Notification.list('-sent_at', 20);
        
        const userNotifications = allNotifications.filter(n => {
          if (!n.target_users || n.target_users.length === 0) {
            return ['admin', 'manager', 'cafeteria'].includes(user.app_role);
          }
          return n.target_users.includes(user.email);
        });

        // Solo mostrar notificaciones de los últimos 5 minutos que no se hayan mostrado ya
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newNotifications = userNotifications.filter(n => {
          const sentAt = new Date(n.sent_at);
          return sentAt > fiveMinutesAgo && !shownIds.current.has(n.id);
        });

        newNotifications.forEach(n => {
          shownIds.current.add(n.id);
          addNotification({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.sent_at,
            data: n.notification_data
          });
        });

      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Marcar notificaciones existentes como ya vistas al inicio
    const initializeSeenIds = async () => {
      try {
        const existing = await base44.entities.Notification.list('-sent_at', 20);
        existing.forEach(n => shownIds.current.add(n.id));
      } catch {}
    };

    initializeSeenIds().then(() => {
      const interval = setInterval(pollNotifications, 30000);
      return () => clearInterval(interval);
    });

  }, [user?.id]);

  // Trigger para stock bajo (solo para cafeterias/admins)
  useEffect(() => {
    if (!user?.id || !['admin', 'cafeteria', 'manager'].includes(user.app_role)) return;

    const checkStockLow = async () => {
      try {
        await base44.functions.invoke('notifyStockLow');
      } catch (error) {
        console.error('Error checking stock:', error);
      }
    };

    // Verificar stock cada 10 minutos
    const stockInterval = setInterval(checkStockLow, 10 * 60 * 1000);

    return () => clearInterval(stockInterval);
  }, [user]);

  // Trigger para recordatorios de recogida
  useEffect(() => {
    if (!user?.id) return;

    const checkPickupReminders = async () => {
      try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Obtener reservas del usuario para hoy
        const allReservations = await base44.entities.Reserva.list();
        const userReservations = allReservations.filter(r => 
          r.student_email === user.email && 
          r.estado === 'pagado' &&
          r.created_date?.startsWith(today)
        );

        userReservations.forEach(reserva => {
          // Calcular tiempo hasta hora límite
          const horaLimite = reserva.hora_limite || '18:00';
          const [hours, minutes] = horaLimite.split(':').map(Number);
          const limitTime = new Date();
          limitTime.setHours(hours, minutes, 0, 0);

          const timeUntilLimit = limitTime - now;
          const minutesUntilLimit = Math.floor(timeUntilLimit / 60000);

          // Notificar 30 minutos antes
          if (minutesUntilLimit === 30) {
            addNotification({
              id: `reminder-${reserva.id}`,
              type: 'reminder',
              title: '⏰ Recordatorio de Recogida',
              message: `Recuerda recoger tu pedido en ${reserva.cafeteria}. Código: ${reserva.codigo_recogida}`,
              timestamp: new Date().toISOString(),
              data: {
                reserva_id: reserva.id,
                codigo_recogida: reserva.codigo_recogida
              }
            });
          }
        });

      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    // Verificar cada 5 minutos
    const reminderInterval = setInterval(checkPickupReminders, 5 * 60 * 1000);

    return () => clearInterval(reminderInterval);
  }, [user, addNotification]);

  return null;
}